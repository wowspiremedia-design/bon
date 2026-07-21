import type { PayloadMedia, PayloadListResponse, PayloadItineraryDay, DepartureState } from './payload-api'
import { resolveMediaUrl } from './payload-api'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

async function payloadFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export interface RouteStop {
  name: string
  latitude: number
  longitude: number
}

export interface FixedDepartureFaq {
  question: string
  answer: string
}

export interface FixedDeparturePackage {
  id: number
  title: string
  slug: string
  images: PayloadMedia[]
  brochure: PayloadMedia | null
  price: number
  regularPrice: number
  onSale: boolean
  type: 'domestic' | 'international'
  packageType: 'economy' | 'deluxe' | 'star'
  departureState: DepartureState
  departureDate: string
  duration: string
  startingPoint: string
  route: string
  routeStops: RouteStop[]
  overview: unknown
  itinerary: PayloadItineraryDay[]
  faqs: FixedDepartureFaq[]
  termsAndConditions: unknown
  paymentPolicy: unknown
  cancellationPolicy: unknown
  childPolicy: unknown
  seoTitle: string | null
  seoDescription: string | null
  seoFocusKeyword: string | null
}

function resolveFixedDeparturePackageMedia(pkg: FixedDeparturePackage): FixedDeparturePackage {
  return {
    ...pkg,
    images: pkg.images.map((item) => ({ ...item, url: resolveMediaUrl(item.url) ?? item.url })),
    brochure: pkg.brochure
      ? { ...pkg.brochure, url: resolveMediaUrl(pkg.brochure.url) ?? pkg.brochure.url }
      : null,
  }
}

export async function getFixedDeparturePackagesByDepartureState(
  state: DepartureState,
  limit = 20,
): Promise<FixedDeparturePackage[]> {
  const path = `/api/fixed-departure-packages?where[departureState][in]=${state}&limit=${limit}`
  const res = await payloadFetch<PayloadListResponse<FixedDeparturePackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map(resolveFixedDeparturePackageMedia)
}

export async function getFixedDeparturePackageBySlug(slug: string): Promise<FixedDeparturePackage | null> {
  try {
    const qs = `where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
    const path = `/api/fixed-departure-packages?${qs}`
    const res = await payloadFetch<PayloadListResponse<FixedDeparturePackage>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return null
    }
    const doc = res.docs[0]
    return doc ? resolveFixedDeparturePackageMedia(doc) : null
  } catch {
    return null
  }
}

// ── Filtered fixed-departure packages (listing) ────────────────────────────────

const FILTER_PER_PAGE = 20
const MAX_FILTER_FETCHES = 5

export type FixedDepartureSortValue = 'popular' | 'price_asc' | 'price_desc' | 'departure_soonest' | 'duration'

// Duplicated from lib/payload-api.ts rather than imported: the equivalent
// helpers there (DURATION_BANDS, parseDaysFromDuration, matchesDurationBands)
// are module-private and typed specifically against PayloadPackage, not
// exported for reuse against a different collection's shape.
const DURATION_BANDS: Record<string, { min: number; max: number }> = {
  '1-3':  { min: 1,  max: 3 },
  '4-6':  { min: 4,  max: 6 },
  '7-10': { min: 7,  max: 10 },
  '10+':  { min: 11, max: Infinity },
}

function parseDaysFromDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*days?/i)
  return match ? parseInt(match[1], 10) : 0
}

function matchesDurationBands(pkg: FixedDeparturePackage, bands: string[]): boolean {
  const days = parseDaysFromDuration(pkg.duration)
  return bands.some((key) => {
    const range = DURATION_BANDS[key]
    return range && days >= range.min && days <= range.max
  })
}

export interface FilteredFixedDeparturePackagesParams {
  type?: FixedDeparturePackage['type']
  packageType?: string[]
  departureState?: DepartureState
  minPrice?: number
  maxPrice?: number
  duration?: string[]
  sort?: FixedDepartureSortValue
  cursor?: number
}

export interface FilteredFixedDeparturePackagesResult {
  packages: FixedDeparturePackageCardProps[]
  nextCursor: number | null
  hasMore: boolean
  totalCount: number
}

async function fetchFilteredFixedDeparturePackagesPage(
  page: number,
  type: FilteredFixedDeparturePackagesParams['type'],
  packageType: string[],
  departureState: DepartureState | undefined,
  minPrice: number | undefined,
  maxPrice: number | undefined,
  sort: FixedDepartureSortValue,
  todayKey: string,
): Promise<{ packages: FixedDeparturePackage[]; totalPages: number; total: number }> {
  let qs = `page=${page}&limit=${FILTER_PER_PAGE}`
  // Always applied, not optional: never show a departure date that's already passed.
  qs += `&where[departureDate][greater_than_equal]=${todayKey}`
  if (type) qs += `&where[type][equals]=${type}`
  if (packageType.length > 0) qs += `&where[packageType][in]=${packageType.join(',')}`
  if (departureState) qs += `&where[departureState][in]=${departureState}`
  if (minPrice !== undefined) qs += `&where[price][greater_than_equal]=${minPrice}`
  if (maxPrice !== undefined && Number.isFinite(maxPrice)) qs += `&where[price][less_than_equal]=${maxPrice}`
  if (sort === 'price_asc') qs += '&sort=price'
  if (sort === 'price_desc') qs += '&sort=-price'
  if (sort === 'departure_soonest') qs += '&sort=departureDate'

  const path = `/api/fixed-departure-packages?${qs}`
  const res = await payloadFetch<PayloadListResponse<FixedDeparturePackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return { packages: [], totalPages: page, total: 0 }
  }
  return {
    packages: res.docs.map(resolveFixedDeparturePackageMedia),
    totalPages: res.totalPages,
    total: res.totalDocs,
  }
}

export async function getFilteredFixedDeparturePackages(
  params: FilteredFixedDeparturePackagesParams = {},
): Promise<FilteredFixedDeparturePackagesResult> {
  const {
    type,
    packageType = [],
    departureState,
    minPrice,
    maxPrice,
    duration = [],
    sort = 'popular',
    cursor = 1,
  } = params

  const todayKey = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  let page = Math.max(1, cursor)
  let totalPages = page
  let totalCount = 0
  let fetches = 0
  const collected: FixedDeparturePackage[] = []

  while (true) {
    fetches++
    const { packages: batch, totalPages: tp, total } = await fetchFilteredFixedDeparturePackagesPage(page, type, packageType, departureState, minPrice, maxPrice, sort, todayKey)
    totalPages = tp
    totalCount = total

    const matched = duration.length > 0 ? batch.filter((p) => matchesDurationBands(p, duration)) : batch
    collected.push(...matched)

    const morePagesExist = page < totalPages
    if (collected.length >= FILTER_PER_PAGE) break
    if (!morePagesExist) break
    if (fetches >= MAX_FILTER_FETCHES) break
    page++
  }

  const morePagesExist = page < totalPages
  const nextCursor = morePagesExist ? page + 1 : null

  let packages = collected.map((p) => mapFixedDeparturePackageToCard(p))
  if (sort === 'duration') {
    packages = [...packages].sort((a, b) => parseDaysFromDuration(a.duration) - parseDaysFromDuration(b.duration))
  }

  return {
    packages,
    nextCursor,
    hasMore: nextCursor !== null,
    totalCount,
  }
}

// ── Mapping ──────────────────────────────────────────────────────────────────

// Only the fields that map 1:1 onto a card today; extend once the real
// fixed-departure card component's props are defined.
export interface FixedDeparturePackageCardProps {
  id: number
  title: string
  slug: string
  price: number
  regularPrice: number
  onSale: boolean
  duration: string
  packageType: FixedDeparturePackage['packageType']
  departureDate: string
  departureState: DepartureState
  startingPoint: string
  route: string
  images: PayloadMedia[]
  faqs: FixedDepartureFaq[]
}

export function mapFixedDeparturePackageToCard(pkg: FixedDeparturePackage): FixedDeparturePackageCardProps {
  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    price: pkg.price,
    regularPrice: pkg.regularPrice,
    onSale: pkg.onSale,
    duration: pkg.duration,
    packageType: pkg.packageType,
    departureDate: pkg.departureDate,
    departureState: pkg.departureState,
    startingPoint: pkg.startingPoint,
    route: pkg.route,
    images: pkg.images,
    faqs: pkg.faqs,
  }
}
