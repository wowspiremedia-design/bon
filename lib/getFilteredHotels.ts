import { getAllTaxonomyLookups, mapHotel, type RawHotel, type Hotel } from './hotels-api'

const BASE = process.env.NEXT_PUBLIC_WP_URL ?? 'https://cms.bonvoyagers.co'
const PER_PAGE = 12
const MAX_HOTEL_FETCHES = 5

export interface FilteredHotelsParams {
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

export interface FilteredHotelsResult {
  hotels: Hotel[]
  nextCursor: number | null
  hasMore: boolean
  totalCount: number
}

function findIdByName(lookup: Map<number, string>, name: string): number | null {
  const target = name.trim().toLowerCase()
  for (const [id, n] of lookup) {
    if (n.toLowerCase() === target) return id
  }
  return null
}

function findIdsByNames(lookup: Map<number, string>, names: string[]): number[] {
  const ids: number[] = []
  for (const name of names) {
    const id = findIdByName(lookup, name)
    if (id !== null) ids.push(id)
  }
  return ids
}

async function fetchHotelsPage(
  page: number,
  taxonomyQuery: URLSearchParams,
): Promise<{ hotels: RawHotel[]; totalPages: number; total: number }> {
  const qs = new URLSearchParams(taxonomyQuery)
  qs.set('page', String(page))
  qs.set('per_page', String(PER_PAGE))
  qs.set('acf_format', 'standard')
  qs.set('_embed', 'true')

  const res = await fetch(`${BASE}/wp-json/wp/v2/dt_hotels?${qs.toString()}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`WordPress API error ${res.status}`)

  const hotels = (await res.json()) as RawHotel[]

  const totalPagesHeader = res.headers.get('x-wp-totalpages')
  const parsedTotalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : NaN
  const totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
    ? parsedTotalPages
    : (hotels.length < PER_PAGE ? page : page + 1)

  const totalHeader = res.headers.get('x-wp-total')
  const parsedTotal = totalHeader ? parseInt(totalHeader, 10) : NaN
  const total = Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : hotels.length

  return { hotels, totalPages, total }
}

export async function getFilteredHotels(
  params: FilteredHotelsParams = {},
): Promise<FilteredHotelsResult> {
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

  const lookups = await getAllTaxonomyLookups()

  // WordPress needs term IDs, not the readable names filters arrive as, so
  // every filter value is resolved here before it is used as a query param.
  const taxonomyQuery = new URLSearchParams()
  let impossible = false

  if (location) {
    const id = findIdByName(lookups.hotel_locations, location)
    if (id === null) impossible = true
    else taxonomyQuery.set('hotel_locations', String(id))
  }
  if (propertyCategory) {
    const id = findIdByName(lookups.hotel_property_category, propertyCategory)
    if (id === null) impossible = true
    else taxonomyQuery.set('hotel_property_category', String(id))
  }
  if (propertyType) {
    const id = findIdByName(lookups.hotel_property_type, propertyType)
    if (id === null) impossible = true
    else taxonomyQuery.set('hotel_property_type', String(id))
  }
  if (amenities.length > 0) {
    const ids = findIdsByNames(lookups.hotel_amenities, amenities)
    if (ids.length === 0) impossible = true
    else taxonomyQuery.set('hotel_amenities', ids.join(','))
  }
  if (foodType.length > 0) {
    const ids = findIdsByNames(lookups.hotel_food_type, foodType)
    if (ids.length === 0) impossible = true
    else taxonomyQuery.set('hotel_food_type', ids.join(','))
  }
  if (viewType.length > 0) {
    const ids = findIdsByNames(lookups.hotel_view_type, viewType)
    if (ids.length === 0) impossible = true
    else taxonomyQuery.set('hotel_view_type', ids.join(','))
  }
  // Compatibility cannot be filtered as a native WordPress taxonomy query like
  // the other fields above: the hotel_compatibility term relationships are
  // never actually written on the post (every hotel's native hotel_compatibility
  // field is an empty array), even though the ACF compatibility_select field
  // that mapHotel resolves for display does hold real values. So compatibility
  // is filtered in-memory after mapping instead, the same way price is.
  if (compatibility.length > 0) {
    const validNames = lookups.hotel_compatibility
    const hasAnyValidName = compatibility.some((name) => findIdByName(validNames, name) !== null)
    if (!hasAnyValidName) impossible = true
  }

  if (impossible) {
    return { hotels: [], nextCursor: null, hasMore: false, totalCount: 0 }
  }

  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const hasCompatibilityFilter = compatibility.length > 0
  const needsInMemoryFilter = hasPriceFilter || hasCompatibilityFilter

  // Price and compatibility cannot be filtered by WordPress directly (see the
  // comments above), so each taxonomy-matching page is mapped and filtered
  // here instead, fetching further pages only when needed, capped the same
  // way duration filtering is capped for packages.
  let page = Math.max(1, cursor)
  let totalPages = page
  let totalHeaderCount = 0
  let fetches = 0
  const collected: Hotel[] = []

  while (true) {
    fetches++
    const { hotels: rawHotels, totalPages: tp, total } = await fetchHotelsPage(page, taxonomyQuery)
    totalPages = tp
    totalHeaderCount = total

    const mapped = rawHotels.map((h) => mapHotel(h, lookups))
    const matched = needsInMemoryFilter
      ? mapped.filter((h) => {
          if (hasPriceFilter) {
            if (h.startingPrice === null) return false
            if (minPrice !== undefined && h.startingPrice < minPrice) return false
            if (maxPrice !== undefined && h.startingPrice > maxPrice) return false
          }
          if (hasCompatibilityFilter) {
            if (!compatibility.some((c) => h.compatibility.includes(c))) return false
          }
          return true
        })
      : mapped

    collected.push(...matched)

    const morePagesExist = page < totalPages
    if (collected.length >= PER_PAGE) break
    if (!morePagesExist) break
    if (fetches >= MAX_HOTEL_FETCHES) break
    page++
  }

  const morePagesExist = page < totalPages
  const nextCursor = morePagesExist ? page + 1 : null
  const totalCount = needsInMemoryFilter ? collected.length : totalHeaderCount

  return {
    hotels: collected,
    nextCursor,
    hasMore: nextCursor !== null,
    totalCount,
  }
}
