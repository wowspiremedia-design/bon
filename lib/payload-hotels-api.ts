import { resolveMediaUrl, type PayloadListResponse } from './payload-api'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

async function payloadFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export function formatEnumLabel(value: string): string {
  return value.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// AmenityIcon.tsx looks up icons by exact label string, and a few amenity/food
// values don't survive the generic Title Case conversion (e.g. "wifi" should
// stay "WiFi", not become "Wifi"), so those are special-cased here instead.
const LABEL_OVERRIDES: Record<string, string> = {
  wifi: 'WiFi',
  ac: 'AC',
  geyser_hot_water: 'Geyser (Hot Water)',
  travel_desk_tour_assistance: 'Travel Desk / Tour Assistance',
  non_veg: 'Non-Veg',
}

const REVERSE_LABEL_OVERRIDES: Record<string, string> = Object.fromEntries(
  Object.entries(LABEL_OVERRIDES).map(([slug, label]) => [label, slug]),
)

export function formatAmenityLabel(value: string): string {
  return LABEL_OVERRIDES[value] ?? formatEnumLabel(value)
}

// Payload's amenities/foodType/viewType/compatibility/propertyCategory/propertyType
// values are snake_case slugs (e.g. "mountain_view"), so incoming filter labels
// from the UI (e.g. "Mountain View") are converted back the same way. Labels
// that went through formatAmenityLabel's overrides (e.g. "Geyser (Hot Water)")
// do not reverse cleanly with the generic conversion, so those are checked
// against the reverse override map first.
function labelToSlug(label: string): string {
  return REVERSE_LABEL_OVERRIDES[label] ?? label.toLowerCase().replace(/\s+/g, '_')
}

export interface PayloadRoomType {
  id: string
  name: string
  category: string
  price: number
  isAvailable: boolean
  images: Array<{ id: number; url: string; alt?: string }>
}

export interface PayloadHotel {
  id: number
  title: string
  slug: string
  locations: Array<{ id: number; name: string; slug: string }>
  address: string
  overview: string
  gallery: Array<{ id: number; url: string; alt?: string }>
  propertyCategory: string | null
  propertyType: string | null
  amenities: string[]
  foodType: string[]
  viewType: string[]
  compatibility: string[]
  roomTypes: PayloadRoomType[]
  sightseeing: string
  kitchenAvailability: boolean
  checkinTime: string
  checkoutTime: string
}

export interface MappedHotel {
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
  roomPricing: Array<{ name: string; price: number }>
  startingPrice: number | null
  sightseeing: string
  kitchenAvailability: boolean
  checkinTime: string
  checkoutTime: string
}

export function mapPayloadHotel(hotel: PayloadHotel): MappedHotel {
  const location = hotel.locations.map((l) => l.name).join(', ')
  const galleryUrls = hotel.gallery.map((g) => resolveMediaUrl(g.url) ?? g.url)

  const roomPricing = hotel.roomTypes.map((r) => ({ name: r.name, price: r.price }))
  const startingPrice = hotel.roomTypes.length > 0
    ? Math.min(...hotel.roomTypes.map((r) => r.price))
    : null

  return {
    id: hotel.id,
    slug: hotel.slug,
    title: hotel.title,
    location,
    address: hotel.address,
    overview: hotel.overview,
    image: galleryUrls[0] ?? '',
    gallery: galleryUrls,
    propertyCategory: hotel.propertyCategory ? formatEnumLabel(hotel.propertyCategory) : '',
    propertyType: hotel.propertyType ? formatEnumLabel(hotel.propertyType) : '',
    amenities: hotel.amenities.map(formatAmenityLabel),
    foodType: hotel.foodType.map(formatAmenityLabel),
    viewType: hotel.viewType.map(formatEnumLabel),
    compatibility: hotel.compatibility.map(formatEnumLabel),
    roomPricing,
    startingPrice,
    sightseeing: hotel.sightseeing,
    kitchenAvailability: hotel.kitchenAvailability,
    checkinTime: hotel.checkinTime,
    checkoutTime: hotel.checkoutTime,
  }
}

export async function getAllPayloadHotels(): Promise<PayloadHotel[]> {
  const path = '/api/hotels?limit=100'
  const res = await payloadFetch<PayloadListResponse<PayloadHotel>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs
}

export async function getPayloadHotelBySlug(slug: string): Promise<MappedHotel | null> {
  try {
    const qs = `where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
    const path = `/api/hotels?${qs}`
    const res = await payloadFetch<PayloadListResponse<PayloadHotel>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return null
    }
    const doc = res.docs[0]
    return doc ? mapPayloadHotel(doc) : null
  } catch {
    return null
  }
}

export async function getAllMappedPayloadHotels(): Promise<MappedHotel[]> {
  const hotels = await getAllPayloadHotels()
  return hotels.map(mapPayloadHotel)
}

// ── Filtering ────────────────────────────────────────────────────────────────

const HOTEL_PER_PAGE = 12
const MAX_HOTEL_FETCHES = 5

export interface FilteredPayloadHotelsParams {
  location?: string
  propertyCategory?: string
  propertyType?: string
  amenities?: string[]
  foodType?: string[]
  viewType?: string[]
  compatibility?: string[]
  minPrice?: number
  maxPrice?: number
  cursor?: number
}

export interface FilteredPayloadHotelsResult {
  hotels: MappedHotel[]
  nextCursor: number | null
  hasMore: boolean
  totalCount: number
}

interface RawLocation {
  id: number
  name: string
  slug: string
}

async function findLocationSlugByName(name: string): Promise<string | null> {
  const path = '/api/locations?limit=100'
  const res = await payloadFetch<PayloadListResponse<RawLocation>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return null
  }
  const target = name.trim().toLowerCase()
  const match = res.docs.find((loc) => loc.name.toLowerCase() === target)
  return match ? match.slug : null
}

export async function getAllLocations(): Promise<string[]> {
  const path = '/api/locations?limit=100'
  const res = await payloadFetch<PayloadListResponse<RawLocation>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map((loc) => loc.name).sort((a, b) => a.localeCompare(b))
}

async function fetchHotelsPage(
  page: number,
  queryPrefix: string,
): Promise<{ hotels: PayloadHotel[]; totalPages: number; total: number }> {
  const qs = `${queryPrefix}page=${page}&limit=${HOTEL_PER_PAGE}`
  const path = `/api/hotels?${qs}`
  const res = await payloadFetch<PayloadListResponse<PayloadHotel>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return { hotels: [], totalPages: page, total: 0 }
  }
  return {
    hotels: res.docs,
    totalPages: res.totalPages,
    total: res.totalDocs,
  }
}

export async function getFilteredPayloadHotels(
  params: FilteredPayloadHotelsParams = {},
): Promise<FilteredPayloadHotelsResult> {
  const {
    location,
    propertyCategory,
    propertyType,
    amenities = [],
    foodType = [],
    viewType = [],
    compatibility = [],
    minPrice,
    maxPrice,
    cursor = 1,
  } = params

  const queryParts: string[] = []
  let impossible = false

  if (location) {
    const slug = await findLocationSlugByName(location)
    if (!slug) impossible = true
    else queryParts.push(`where[locations.slug][equals]=${encodeURIComponent(slug)}`)
  }
  if (propertyCategory) {
    queryParts.push(`where[propertyCategory][equals]=${encodeURIComponent(labelToSlug(propertyCategory))}`)
  }
  if (propertyType) {
    queryParts.push(`where[propertyType][equals]=${encodeURIComponent(labelToSlug(propertyType))}`)
  }
  if (amenities.length > 0) {
    queryParts.push(`where[amenities][in]=${amenities.map(labelToSlug).join(',')}`)
  }
  if (foodType.length > 0) {
    queryParts.push(`where[foodType][in]=${foodType.map(labelToSlug).join(',')}`)
  }
  if (viewType.length > 0) {
    queryParts.push(`where[viewType][in]=${viewType.map(labelToSlug).join(',')}`)
  }
  if (compatibility.length > 0) {
    queryParts.push(`where[compatibility][in]=${compatibility.map(labelToSlug).join(',')}`)
  }

  if (impossible) {
    return { hotels: [], nextCursor: null, hasMore: false, totalCount: 0 }
  }

  const queryPrefix = queryParts.length > 0 ? `${queryParts.join('&')}&` : ''

  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined

  let page = Math.max(1, cursor)
  let totalPages = page
  let totalHeaderCount = 0
  let fetches = 0
  const collected: MappedHotel[] = []

  while (true) {
    fetches++
    const { hotels: rawHotels, totalPages: tp, total } = await fetchHotelsPage(page, queryPrefix)
    totalPages = tp
    totalHeaderCount = total

    const mapped = rawHotels.map(mapPayloadHotel)
    const matched = hasPriceFilter
      ? mapped.filter((h) => {
          if (h.startingPrice === null) return false
          if (minPrice !== undefined && h.startingPrice < minPrice) return false
          if (maxPrice !== undefined && h.startingPrice > maxPrice) return false
          return true
        })
      : mapped

    collected.push(...matched)

    const morePagesExist = page < totalPages
    if (collected.length >= HOTEL_PER_PAGE) break
    if (!morePagesExist) break
    if (fetches >= MAX_HOTEL_FETCHES) break
    page++
  }

  const morePagesExist = page < totalPages
  const nextCursor = morePagesExist ? page + 1 : null
  const totalCount = hasPriceFilter ? collected.length : totalHeaderCount

  return {
    hotels: collected,
    nextCursor,
    hasMore: nextCursor !== null,
    totalCount,
  }
}
