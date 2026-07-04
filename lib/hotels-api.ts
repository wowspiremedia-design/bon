const BASE = process.env.NEXT_PUBLIC_WP_URL ?? 'https://cms.bonvoyagers.co'

// -- Types --------------------------------------------------------------------

const HOTEL_TAXONOMIES = [
  'hotel_property_category',
  'hotel_property_type',
  'hotel_amenities',
  'hotel_food_type',
  'hotel_view_type',
  'hotel_locations',
  'hotel_compatibility',
] as const

type HotelTaxonomySlug = typeof HOTEL_TAXONOMIES[number]

export type TaxonomyLookups = Record<HotelTaxonomySlug, Map<number, string>>

interface RawTaxonomyTerm {
  id: number
  name: string
}

interface RawACFAttachment {
  ID?: number
  id?: number
  url?: string
}

interface RawRoomPricing {
  room_name?: string
  room_price?: string | number
}

// ACF returns false (not an empty array/undefined) for any unset field,
// regardless of its configured type, so every field here must allow false.
interface RawHotelACF {
  overview?: string | false
  hotel_address?: string | false
  property_category_select?: number | false
  property_type_select?: number | false
  amenities_select?: number[] | false
  food_type_select?: number[] | false
  view_type_select?: number[] | false
  compatibility_select?: number[] | false
  hotel_gallery?: RawACFAttachment[] | false
  room_pricing?: RawRoomPricing[] | false
  sightseeing?: string | false
  kitchen_availability?: boolean
  checkin_time?: string | false
  checkout_time?: string | false
}

export interface RawHotel {
  id: number
  slug: string
  title: { rendered: string }
  hotel_locations?: number[]
  acf?: RawHotelACF
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
  }
}

export interface RoomPricing {
  name: string
  price: number
}

export interface Hotel {
  id: number
  slug: string
  title: string
  location: string
  address: string
  overview: string
  image: string
  gallery: string[]
  propertyCategory: string
  propertyType: string
  amenities: string[]
  foodType: string[]
  viewType: string[]
  compatibility: string[]
  roomPricing: RoomPricing[]
  startingPrice: number | null
  sightseeing: string
  kitchenAvailability: boolean
  checkinTime: string
  checkoutTime: string
}

// -- Fetch helpers --------------------------------------------------------------

async function wpFetch<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`WordPress API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// -- Taxonomy lookups -------------------------------------------------------------

export async function getTaxonomyLookup(taxonomySlug: string): Promise<Map<number, string>> {
  const terms = await wpFetch<RawTaxonomyTerm[]>(
    `/wp-json/wp/v2/${taxonomySlug}?per_page=100&_fields=id,name`,
    3600,
  )
  return new Map(terms.map((term) => [term.id, term.name]))
}

export async function getAllTaxonomyLookups(): Promise<TaxonomyLookups> {
  const lookups = await Promise.all(HOTEL_TAXONOMIES.map((slug) => getTaxonomyLookup(slug)))
  return HOTEL_TAXONOMIES.reduce((acc, slug, i) => {
    acc[slug] = lookups[i]
    return acc
  }, {} as TaxonomyLookups)
}

// -- Hotels -----------------------------------------------------------------------

export async function getAllHotels(): Promise<RawHotel[]> {
  const all: RawHotel[] = []
  const MAX_PAGES = 20
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await wpFetch<RawHotel[]>(
      `/wp-json/wp/v2/dt_hotels?per_page=100&page=${page}&acf_format=standard&_embed`,
      60,
    )
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

function resolveIds(ids: number[] | false | undefined, lookup: Map<number, string>): string[] {
  if (!ids || ids.length === 0) return []
  const resolved: string[] = []
  for (const id of ids) {
    const name = lookup.get(id)
    if (name) resolved.push(name)
  }
  return resolved
}

export function mapHotel(rawHotel: RawHotel, lookups: TaxonomyLookups): Hotel {
  const acf = rawHotel.acf ?? {}

  const locationNames = resolveIds(rawHotel.hotel_locations, lookups.hotel_locations)
  const location = locationNames.join(', ')

  const galleryUrls = (acf.hotel_gallery || [])
    .map((item) => item.url ?? '')
    .filter(Boolean)
  const featuredImage = rawHotel._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? ''
  const image = galleryUrls[0] ?? featuredImage ?? ''

  const propertyCategory = acf.property_category_select
    ? lookups.hotel_property_category.get(acf.property_category_select) ?? ''
    : ''
  const propertyType = acf.property_type_select
    ? lookups.hotel_property_type.get(acf.property_type_select) ?? ''
    : ''

  const roomPricing: RoomPricing[] = (acf.room_pricing || []).map((r) => ({
    name: r.room_name ?? '',
    price: Number(r.room_price) || 0,
  }))
  const startingPrice = roomPricing.length > 0
    ? Math.min(...roomPricing.map((r) => r.price))
    : null

  return {
    id: rawHotel.id,
    slug: rawHotel.slug,
    title: rawHotel.title.rendered,
    location,
    address: acf.hotel_address || '',
    overview: acf.overview || '',
    image,
    gallery: galleryUrls,
    propertyCategory,
    propertyType,
    amenities: resolveIds(acf.amenities_select, lookups.hotel_amenities),
    foodType: resolveIds(acf.food_type_select, lookups.hotel_food_type),
    viewType: resolveIds(acf.view_type_select, lookups.hotel_view_type),
    compatibility: resolveIds(acf.compatibility_select, lookups.hotel_compatibility),
    roomPricing,
    startingPrice,
    sightseeing: acf.sightseeing || '',
    kitchenAvailability: acf.kitchen_availability === true,
    checkinTime: acf.checkin_time || '',
    checkoutTime: acf.checkout_time || '',
  }
}

export async function getHotelBySlug(slug: string): Promise<Hotel | null> {
  const [lookups, hotels] = await Promise.all([getAllTaxonomyLookups(), getAllHotels()])
  const rawHotel = hotels.find((h) => h.slug === slug)
  return rawHotel ? mapHotel(rawHotel, lookups) : null
}

export async function getAllMappedHotels(): Promise<Hotel[]> {
  const [lookups, hotels] = await Promise.all([getAllTaxonomyLookups(), getAllHotels()])
  return hotels.map((h) => mapHotel(h, lookups))
}
