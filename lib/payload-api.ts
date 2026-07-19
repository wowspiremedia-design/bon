import type { PackageCardProps } from '@/components/shared/PackageCard'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

async function payloadFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export interface PayloadMedia {
  id: number
  url: string
  alt?: string
}

export interface PayloadCategory {
  id: number
  name: string
  slug: string
}

export interface PayloadDestination {
  id: number
  title: string
  slug: string
  featuredImage: PayloadMedia | null
  excerpt: string
  destinationDetails: unknown
  gallery: PayloadMedia[]
  region: 'domestic' | 'international' | undefined
  packageCategory: PayloadCategory[]
}

export interface PayloadItineraryDay {
  dayLabel: string
  dayTitle: string
  dayDescription: string
}

export interface PayloadInclusion {
  item: string
}

export interface PayloadExclusion {
  item: string
}

export interface PayloadFaq {
  question: string
  answer: string
}

export interface PayloadPackage {
  id: number
  title: string
  slug: string
  category: PayloadCategory[]
  tags: { id: number; name: string; slug: string }[]
  images: PayloadMedia[]
  brochure: PayloadMedia | null
  price: number
  regularPrice: number
  onSale: boolean
  route: string
  duration: string
  people: number
  mapQuery: string
  shortDescription: unknown
  weatherSummary: string
  bestMonths: string[]
  itinerary: PayloadItineraryDay[]
  inclusions: PayloadInclusion[]
  exclusions: PayloadExclusion[]
  faqs: PayloadFaq[]
  seoTitle: string | null
  seoDescription: string | null
  seoFocusKeyword: string | null
}

export interface PayloadPackageLite {
  id: number
  price: number
  regularPrice: number
  duration: string
}

export interface PayloadListResponse<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${PAYLOAD_URL}${url}`
}

function resolveDestinationMedia(dest: PayloadDestination): PayloadDestination {
  return {
    ...dest,
    featuredImage: dest.featuredImage
      ? { ...dest.featuredImage, url: resolveMediaUrl(dest.featuredImage.url) ?? dest.featuredImage.url }
      : null,
    gallery: dest.gallery.map((item) => ({ ...item, url: resolveMediaUrl(item.url) ?? item.url })),
  }
}

export async function getDestinations(): Promise<PayloadDestination[]> {
  const path = '/api/destinations?limit=100'
  const res = await payloadFetch<PayloadListResponse<PayloadDestination>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map(resolveDestinationMedia)
}

export async function getDestinationBySlug(slug: string): Promise<PayloadDestination | null> {
  try {
    const qs = `where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
    const path = `/api/destinations?${qs}`
    const res = await payloadFetch<PayloadListResponse<PayloadDestination>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return null
    }
    const doc = res.docs[0]
    return doc ? resolveDestinationMedia(doc) : null
  } catch {
    return null
  }
}

export interface DestinationHeroSlide {
  title: string
  sub_title: string
  image: string
  button_text: string
  button_url: string
}

export async function getDestinationHeroSlides(): Promise<DestinationHeroSlide[]> {
  const path = '/api/destinations?limit=100'
  const res = await payloadFetch<PayloadListResponse<PayloadDestination>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  const withImages = res.docs.filter((dest) => dest.featuredImage !== null)

  return withImages.map((dest) => ({
    title: dest.title,
    sub_title: `Explore ${dest.title} with Bon Voyagers`,
    image: resolveMediaUrl(dest.featuredImage?.url) ?? '',
    button_text: 'Explore Now',
    button_url: `/destination/${dest.slug}`,
  }))
}

function resolvePackageMedia(pkg: PayloadPackage): PayloadPackage {
  return {
    ...pkg,
    images: pkg.images.map((item) => ({ ...item, url: resolveMediaUrl(item.url) ?? item.url })),
    brochure: pkg.brochure
      ? { ...pkg.brochure, url: resolveMediaUrl(pkg.brochure.url) ?? pkg.brochure.url }
      : null,
  }
}

export async function getPackageBySlug(slug: string): Promise<PayloadPackage | null> {
  try {
    const qs = `where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
    const path = `/api/packages?${qs}`
    const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return null
    }
    const doc = res.docs[0]
    return doc ? resolvePackageMedia(doc) : null
  } catch {
    return null
  }
}

export async function getOnSalePackages(limit = 30): Promise<PayloadPackage[]> {
  const path = `/api/packages?where[onSale][equals]=true&limit=${limit}`
  const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map(resolvePackageMedia)
}

export async function getPackagesByCategoryLite(categoryIds: number[], limit = 200): Promise<PayloadPackageLite[]> {
  const path = `/api/packages?where[category][in]=${categoryIds.join(',')}&limit=${limit}&depth=0`
  const res = await payloadFetch<PayloadListResponse<PayloadPackageLite>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map((doc) => ({
    id: doc.id,
    price: doc.price,
    regularPrice: doc.regularPrice,
    duration: doc.duration,
  }))
}

export interface PayloadPackageSlug {
  slug: string
  updatedAt: string
}

export async function getAllPackageSlugs(): Promise<PayloadPackageSlug[]> {
  const limit = 200
  const all: PayloadPackageSlug[] = []
  let page = 1

  while (true) {
    const path = `/api/packages?limit=${limit}&page=${page}&depth=0&select[slug]=true&select[updatedAt]=true`
    const res = await payloadFetch<PayloadListResponse<PayloadPackageSlug>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      break
    }
    all.push(...res.docs.map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt })))
    if (res.docs.length < limit) break
    page++
  }

  return all
}

export async function getPackagesByIds(ids: number[]): Promise<PayloadPackage[]> {
  if (ids.length === 0) return []
  const path = `/api/packages?where[id][in]=${ids.join(',')}&limit=${ids.length}`
  const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map(resolvePackageMedia)
}

export async function getCategories(): Promise<PayloadCategory[]> {
  const path = '/api/categories?limit=100'
  const res = await payloadFetch<PayloadListResponse<PayloadCategory>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs
}

export async function getPackagesByCategory(
  categoryId: number,
  page = 1,
  perPage = 20,
): Promise<{ packages: PayloadPackage[]; totalDocs: number; totalPages: number }> {
  const path = `/api/packages?where[category][in]=${categoryId}&page=${page}&limit=${perPage}`
  const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return { packages: [], totalDocs: 0, totalPages: 0 }
  }
  return {
    packages: res.docs.map(resolvePackageMedia),
    totalDocs: res.totalDocs,
    totalPages: res.totalPages,
  }
}

export async function getPackagesByDepartureState(
  state: DepartureState,
  limit = 20,
): Promise<PayloadPackage[]> {
  const path = `/api/packages?where[departureState][in]=${state}&limit=${limit}`
  const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  return res.docs.map(resolvePackageMedia)
}

// Deterministic string hash → 32-bit seed, then a small seeded PRNG (mulberry32)
// so the "random" fallback pool is stable for everyone all day and only
// reshuffles when the date itself changes, with no database changes needed.
function seedFromDateString(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function mulberry32(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items]
  const rand = mulberry32(seed)
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const FALLBACK_POOL_SIZE = 60

export async function getFallbackPackages(limit = 18): Promise<PayloadPackage[]> {
  const path = `/api/packages?limit=${FALLBACK_POOL_SIZE}`
  const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  const pool = res.docs.map(resolvePackageMedia)
  const todayKey = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const seed = seedFromDateString(todayKey)
  return seededShuffle(pool, seed).slice(0, limit)
}

export interface PayloadCollection {
  id: number
  name: string
  slug: string
  description: unknown
  priority: number
  isActive: boolean
  collectionType: 'destination_based' | 'package_based'
  destinations: PayloadDestination[]
  packageSourceType: 'category' | 'tag' | 'manual' | null
  sourceCategory: PayloadCategory | null
  sourceTag: { id: number; name: string; slug: string } | null
  manualPackages: string | null
}

function resolveCollectionMedia(col: PayloadCollection): PayloadCollection {
  return {
    ...col,
    destinations: col.destinations.map(resolveDestinationMedia),
  }
}

export async function getActiveCollections(): Promise<PayloadCollection[]> {
  const path = '/api/collections?where[isActive][equals]=true&limit=100&sort=priority'
  const res = await payloadFetch<PayloadListResponse<PayloadCollection>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return []
  }
  const sorted = [...res.docs].sort((a, b) => a.priority - b.priority)
  return sorted.map(resolveCollectionMedia)
}

export async function getCollectionBySlug(slug: string): Promise<PayloadCollection | null> {
  try {
    const qs = `where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
    const path = `/api/collections?${qs}`
    const res = await payloadFetch<PayloadListResponse<PayloadCollection>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return null
    }
    const doc = res.docs[0]
    return doc ? resolveCollectionMedia(doc) : null
  } catch {
    return null
  }
}

export async function getCollectionPackages(col: PayloadCollection): Promise<PayloadPackage[]> {
  if (col.packageSourceType === 'category' && col.sourceCategory) {
    const path = `/api/packages?where[category][in]=${col.sourceCategory.id}&limit=100`
    const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return []
    }
    return res.docs.map(resolvePackageMedia)
  }
  if (col.packageSourceType === 'tag' && col.sourceTag) {
    const path = `/api/packages?where[tags][in]=${col.sourceTag.id}&limit=100`
    const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return []
    }
    return res.docs.map(resolvePackageMedia)
  }
  if (col.packageSourceType === 'manual' && col.manualPackages) {
    const ids = col.manualPackages
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n > 0)
    return getPackagesByIds(ids)
  }
  return []
}

export async function getCollectionCoverImage(col: PayloadCollection): Promise<string | null> {
  if (col.collectionType === 'destination_based' && col.destinations.length > 0) {
    return col.destinations[0]?.featuredImage?.url ?? null
  }
  const packages = await getCollectionPackages(col)
  return packages[0]?.images[0]?.url ?? null
}

export async function getActiveCollectionsWithCoverImages(): Promise<Array<PayloadCollection & { coverImage: string | null }>> {
  const collections = await getActiveCollections()
  const withImages = await Promise.all(
    collections.map(async (col) => ({ ...col, coverImage: await getCollectionCoverImage(col) }))
  )
  return withImages.filter((c) => c.coverImage !== null)
}

// ── Package card mapping ────────────────────────────────────────────────────────

export function mapPayloadPackageToCard(pkg: PayloadPackage, destinationOverride?: string): PackageCardProps {
  const discount = pkg.regularPrice > 0
    ? Math.round((1 - pkg.price / pkg.regularPrice) * 100)
    : 0

  const catNames = pkg.category.map((c) => c.name.toLowerCase())
  const badgeType: PackageCardProps['badgeType'] = pkg.onSale && discount > 20
    ? 'deal'
    : catNames.some((n) => n.includes('honeymoon'))
      ? 'honeymoon'
      : null

  const destination = destinationOverride ?? (pkg.category[0]?.name ?? '').replace(' Packages', '').trim()

  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    image: pkg.images[0]?.url ?? '',
    price: pkg.price,
    regularPrice: pkg.regularPrice,
    onSale: pkg.onSale,
    duration: pkg.duration,
    rating: 0,
    reviewCount: 0,
    destination,
    badgeType,
    route: pkg.route,
  }
}

// ── Filtered packages (all-packages listing) ───────────────────────────────────

const FILTER_PER_PAGE = 20
const MAX_FILTER_FETCHES = 5

export type SortValue = 'popular' | 'price_asc' | 'price_desc' | 'duration'

export const DURATION_BAND_KEYS = ['1-3', '4-6', '7-10', '10+'] as const

// All 36 real Indian states/UTs used for the `departureState` field on the
// Packages collection in Payload, matching the exact snake_case enum values
// defined there.
export const DEPARTURE_STATE_VALUES = [
  'andhra_pradesh',
  'arunachal_pradesh',
  'assam',
  'bihar',
  'chhattisgarh',
  'goa',
  'gujarat',
  'haryana',
  'himachal_pradesh',
  'jharkhand',
  'karnataka',
  'kerala',
  'madhya_pradesh',
  'maharashtra',
  'manipur',
  'meghalaya',
  'mizoram',
  'nagaland',
  'odisha',
  'punjab',
  'rajasthan',
  'sikkim',
  'tamil_nadu',
  'telangana',
  'tripura',
  'uttar_pradesh',
  'uttarakhand',
  'west_bengal',
  'andaman_and_nicobar_islands',
  'chandigarh',
  'dadra_and_nagar_haveli_and_daman_and_diu',
  'delhi',
  'jammu_and_kashmir',
  'ladakh',
  'lakshadweep',
  'puducherry',
] as const

export type DepartureState = typeof DEPARTURE_STATE_VALUES[number]

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

function matchesDurationBands(pkg: PayloadPackage, bands: string[]): boolean {
  const days = parseDaysFromDuration(pkg.duration)
  return bands.some((key) => {
    const range = DURATION_BANDS[key]
    return range && days >= range.min && days <= range.max
  })
}

export interface FilteredPayloadPackagesParams {
  categories?: number[]
  minPrice?: number
  maxPrice?: number
  duration?: string[]
  experienceType?: string[]
  activities?: string[]
  bestSeason?: string[]
  departureState?: DepartureState
  sort?: SortValue
  cursor?: number
}

export interface FilteredPayloadPackagesResult {
  packages: PackageCardProps[]
  nextCursor: number | null
  hasMore: boolean
  totalCount: number
}

async function fetchFilteredPackagesPage(
  page: number,
  categories: number[],
  minPrice: number | undefined,
  maxPrice: number | undefined,
  experienceType: string[],
  activities: string[],
  bestSeason: string[],
  departureState: DepartureState | undefined,
  sort: FilteredPayloadPackagesParams['sort'],
): Promise<{ packages: PayloadPackage[]; totalPages: number; total: number }> {
  let qs = `page=${page}&limit=${FILTER_PER_PAGE}`
  if (categories.length > 0) qs += `&where[category][in]=${categories.join(',')}`
  if (minPrice !== undefined) qs += `&where[price][greater_than_equal]=${minPrice}`
  if (maxPrice !== undefined && Number.isFinite(maxPrice)) qs += `&where[price][less_than_equal]=${maxPrice}`
  if (experienceType.length > 0) qs += `&where[experienceType][in]=${experienceType.join(',')}`
  if (activities.length > 0) qs += `&where[activities][in]=${activities.join(',')}`
  if (bestSeason.length > 0) qs += `&where[bestSeason][in]=${bestSeason.join(',')}`
  if (departureState) qs += `&where[departureState][in]=${departureState}`
  if (sort === 'price_asc') qs += '&sort=price'
  if (sort === 'price_desc') qs += '&sort=-price'

  const path = `/api/packages?${qs}`
  const res = await payloadFetch<PayloadListResponse<PayloadPackage>>(path)
  if (!Array.isArray(res.docs)) {
    console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
    return { packages: [], totalPages: page, total: 0 }
  }
  return {
    packages: res.docs.map(resolvePackageMedia),
    totalPages: res.totalPages,
    total: res.totalDocs,
  }
}

export async function getFilteredPayloadPackages(
  params: FilteredPayloadPackagesParams = {},
): Promise<FilteredPayloadPackagesResult> {
  const {
    categories = [],
    minPrice,
    maxPrice,
    duration = [],
    experienceType = [],
    activities = [],
    bestSeason = [],
    departureState,
    sort = 'popular',
    cursor = 1,
  } = params

  let page = Math.max(1, cursor)
  let totalPages = page
  let totalCount = 0
  let fetches = 0
  const collected: PayloadPackage[] = []

  while (true) {
    fetches++
    const { packages: batch, totalPages: tp, total } = await fetchFilteredPackagesPage(page, categories, minPrice, maxPrice, experienceType, activities, bestSeason, departureState, sort)
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

  let packages = collected.map((p) => mapPayloadPackageToCard(p))
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
