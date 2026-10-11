import { resolveMediaUrl, type PayloadListResponse } from './payload-api'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

async function payloadFetch<T>(path: string, timeoutMs?: number): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, {
    next: { revalidate: 60 },
    // Optional. When set, a Payload that does not answer in time rejects instead of hanging.
    ...(timeoutMs ? { signal: AbortSignal.timeout(timeoutMs) } : {}),
  })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// How long a hotel detail page waits for Payload before giving up with an error.
const HOTEL_DETAIL_TIMEOUT_MS = 10000

// Pages through a Payload list endpoint until it reports no further page, and
// returns every document once. `path` is the endpoint plus its query, WITHOUT
// limit or page. Callers should add depth=0 and select=... when they only need
// a few fields, and a stable sort (sort=id) so pages never overlap. Documents
// are de-duplicated by id, so a hotel added while the loop runs cannot appear
// twice. maxPages is a safety stop against a misbehaving endpoint.
export async function fetchAllPayloadDocs<T extends { id: number | string }>(
  path: string,
  options: { pageSize?: number; maxPages?: number } = {},
): Promise<T[]> {
  const pageSize = options.pageSize ?? 200
  const maxPages = options.maxPages ?? 500
  const separator = path.includes('?') ? '&' : '?'
  const seen = new Map<number | string, T>()

  for (let page = 1; page <= maxPages; page++) {
    const pagePath = `${path}${separator}limit=${pageSize}&page=${page}`
    const res = await payloadFetch<PayloadListResponse<T>>(pagePath)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${pagePath}, got a non-array response`, res)
      break
    }
    for (const doc of res.docs) seen.set(doc.id, doc)
    if (!res.hasNextPage || res.docs.length === 0) break
    if (page === maxPages) console.warn(`fetchAllPayloadDocs: stopped at maxPages=${maxPages} for ${path}`)
  }
  return [...seen.values()]
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

// Payload's amenities/foodType/viewType/compatibility/propertyType
// values are snake_case slugs (e.g. "mountain_view"), so incoming filter labels
// from the UI (e.g. "Mountain View") are converted back the same way. Labels
// that went through formatAmenityLabel's overrides (e.g. "Geyser (Hot Water)")
// do not reverse cleanly with the generic conversion, so those are checked
// against the reverse override map first.
function labelToSlug(label: string): string {
  return REVERSE_LABEL_OVERRIDES[label] ?? label.toLowerCase().replace(/\s+/g, '_')
}

// A price is real only when it is a finite number above zero. Blank room
// prices come through as null, and bad data can be 0, undefined or NaN.
export function isRealPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

// "₹2,700", or null when there is no real price, so callers print nothing.
export function formatPrice(value: number | null | undefined): string | null {
  return isRealPrice(value) ? '₹' + value.toLocaleString('en-IN') : null
}

// Star rating is a single select in Payload holding the strings '1' to '5', or
// empty. Anything else is treated as "no rating".
export type StarRating = '1' | '2' | '3' | '4' | '5'

export function isStarRating(value: unknown): value is StarRating {
  return value === '1' || value === '2' || value === '3' || value === '4' || value === '5'
}

// '3' becomes "3 Star".
export function formatStarRating(value: StarRating): string {
  return `${value} Star`
}

export interface PayloadRoomType {
  id: string
  name: string
  category: string
  price: number | null
  isAvailable: boolean
  images: Array<{ id: number; url: string; alt?: string }>
}

export interface PayloadHotel {
  id: number
  title: string
  slug: string
  isActive?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  locations: Array<{ id: number; name: string; slug: string }>
  address: string
  overview: string
  gallery: Array<{ id: number; url: string; alt?: string }>
  // Retired from the site, kept so the Payload response type stays complete. Unused.
  propertyCategory: string | null
  starRating?: StarRating | null
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
  seoTitle: string
  seoDescription: string
  location: string
  address: string
  overview: string
  image: string
  gallery: string[]
  // Retired from the site, no longer shown or filtered on. Unused.
  propertyCategory: string
  starRating?: StarRating | null
  propertyType: string
  amenities: string[]
  foodType: string[]
  viewType: string[]
  compatibility: string[]
  roomPricing: Array<{ name: string; price: number | null }>
  startingPrice: number | null
  sightseeing: string
  kitchenAvailability: boolean
  checkinTime: string
  checkoutTime: string
}

export function mapPayloadHotel(hotel: PayloadHotel): MappedHotel {
  const location = hotel.locations.map((l) => l.name).join(', ')
  const galleryUrls = hotel.gallery.map((g) => resolveMediaUrl(g.url) ?? g.url)

  // Rooms keep their own price (which may be blank) for the names list, but the
  // starting price only considers real positive prices. No real price means null.
  const roomPricing = hotel.roomTypes.map((r) => ({ name: r.name, price: isRealPrice(r.price) ? r.price : null }))
  const realPrices = roomPricing.map((r) => r.price).filter(isRealPrice)
  const startingPrice = realPrices.length > 0 ? Math.min(...realPrices) : null

  return {
    id: hotel.id,
    slug: hotel.slug,
    title: hotel.title,
    seoTitle: hotel.seoTitle?.trim() ?? '',
    seoDescription: hotel.seoDescription?.trim() ?? '',
    location,
    address: hotel.address,
    overview: hotel.overview,
    image: galleryUrls[0] ?? '',
    gallery: galleryUrls,
    propertyCategory: hotel.propertyCategory ? formatEnumLabel(hotel.propertyCategory) : '',
    starRating: isStarRating(hotel.starRating) ? hotel.starRating : null,
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

// Returns null ONLY when Payload answered and there is no such hotel (no document,
// or an inactive one). That is a real 404 and may be cached as one.
//
// Any failure to get an answer THROWS: a non-OK response, a network error, a
// timeout, or a malformed body. The page then renders an error (500), which
// Next.js does not cache, so a short Payload outage can never be stored as a 404.
export async function getPayloadHotelBySlug(slug: string): Promise<MappedHotel | null> {
  const qs = `where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
  const path = `/api/hotels?${qs}`
  const res = await payloadFetch<PayloadListResponse<PayloadHotel>>(path, HOTEL_DETAIL_TIMEOUT_MS)
  if (!Array.isArray(res.docs)) {
    throw new Error(`Payload returned an unexpected response for ${path}`)
  }
  const doc = res.docs[0]
  if (!doc) return null
  // The public API already hides inactive hotels. This is a second guard.
  if (doc.isActive === false) return null
  return mapPayloadHotel(doc)
}

export interface HotelSitemapEntry {
  slug: string
  updatedAt: string | null
}

// Every hotel's slug and last update, for the sitemap. Pages through the whole
// list with depth 0 and only those two fields selected, so it stays small at
// any number of hotels.
export async function getAllHotelSitemapEntries(pageSize = 200): Promise<HotelSitemapEntry[]> {
  const docs = await fetchAllPayloadDocs<{ id: number; slug?: string; updatedAt?: string }>(
    '/api/hotels?depth=0&sort=id&select[slug]=true&select[updatedAt]=true',
    { pageSize },
  )
  return docs
    .filter((d): d is { id: number; slug: string; updatedAt?: string } => typeof d.slug === 'string' && d.slug !== '')
    .map((d) => ({ slug: d.slug, updatedAt: d.updatedAt ?? null }))
}

// ── Filtering ────────────────────────────────────────────────────────────────

const HOTEL_PER_PAGE = 12

export interface FilteredPayloadHotelsParams {
  location?: string
  // '1' to '5'. Any other value is ignored.
  starRating?: string
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

// Every location, all pages, so none is lost above 100.
async function fetchAllLocations(): Promise<RawLocation[]> {
  return fetchAllPayloadDocs<RawLocation>('/api/locations?depth=0&sort=id&select[name]=true&select[slug]=true')
}

async function findLocationSlugByName(name: string): Promise<string | null> {
  const locations = await fetchAllLocations()
  const target = name.trim().toLowerCase()
  const match = locations.find((loc) => loc.name.toLowerCase() === target)
  return match ? match.slug : null
}

export async function getAllLocations(): Promise<string[]> {
  const locations = await fetchAllLocations()
  return locations.map((loc) => loc.name).sort((a, b) => a.localeCompare(b))
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
    starRating,
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
  if (isStarRating(starRating)) {
    queryParts.push(`where[starRating][equals]=${starRating}`)
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

  // Price band, matched inside the Payload query. Both conditions sit on the same
  // array field, and Payload applies them to the SAME room row, so a hotel matches
  // when it has one room priced inside the band. A room with a blank price never
  // matches a comparison, so hotels with no prices do not appear under a band.
  if (minPrice !== undefined) {
    queryParts.push(`where[roomTypes.price][greater_than_equal]=${encodeURIComponent(String(minPrice))}`)
  }
  if (maxPrice !== undefined) {
    queryParts.push(`where[roomTypes.price][less_than_equal]=${encodeURIComponent(String(maxPrice))}`)
  }

  if (impossible) {
    return { hotels: [], nextCursor: null, hasMore: false, totalCount: 0 }
  }

  const queryPrefix = queryParts.length > 0 ? `${queryParts.join('&')}&` : ''
  const page = Math.max(1, cursor)

  // One Payload page per call. Payload's own totals make pagination and the count exact.
  const { hotels, totalPages, total } = await fetchHotelsPage(page, queryPrefix)
  const nextCursor = page < totalPages ? page + 1 : null

  return {
    hotels: hotels.map(mapPayloadHotel),
    nextCursor,
    hasMore: nextCursor !== null,
    totalCount: total,
  }
}
