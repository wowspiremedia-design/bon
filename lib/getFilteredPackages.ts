import { wcAuthHeader, type WCProduct } from './api'
import { mapProduct } from './mapProduct'
import type { PackageCardProps } from '@/components/shared/PackageCard'

const BASE = process.env.NEXT_PUBLIC_WP_URL ?? 'https://cms.bonvoyagers.co'
const PER_PAGE = 20
const MAX_WC_FETCHES = 5

export type SortValue = 'popular' | 'price_asc' | 'price_desc' | 'duration'

export const DURATION_BAND_KEYS = ['1-3', '4-6', '7-10', '10+'] as const
export type DurationBandKey = typeof DURATION_BAND_KEYS[number]

const DURATION_BANDS: Record<DurationBandKey, { min: number; max: number }> = {
  '1-3':  { min: 1,  max: 3 },
  '4-6':  { min: 4,  max: 6 },
  '7-10': { min: 7,  max: 10 },
  '10+':  { min: 11, max: Infinity },
}

function parseDays(duration: string): number {
  const match = duration.match(/(\d+)\s*days?/i)
  return match ? parseInt(match[1], 10) : 0
}

function getDuration(product: WCProduct): string {
  const durationMeta = product.meta_data.find((m) => m.key === '_package_days_duration')
  return typeof durationMeta?.value === 'string' ? durationMeta.value : ''
}

function matchesDuration(product: WCProduct, bands: string[]): boolean {
  const days = parseDays(getDuration(product))
  return bands.some((key) => {
    const range = DURATION_BANDS[key as DurationBandKey]
    return range && days >= range.min && days <= range.max
  })
}

function applySort(packages: PackageCardProps[], sort: SortValue): PackageCardProps[] {
  return [...packages].sort((a, b) => {
    if (sort === 'price_asc')  return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'duration')   return parseDays(a.duration) - parseDays(b.duration)
    return 0
  })
}

async function fetchWCPage(
  page: number,
  categories: number[],
  minPrice: number | undefined,
  maxPrice: number | undefined,
): Promise<{ products: WCProduct[]; totalPages: number; total: number }> {
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(PER_PAGE),
    status: 'publish',
  })
  if (categories.length > 0) qs.set('category', categories.join(','))
  if (minPrice !== undefined) qs.set('min_price', String(minPrice))
  if (maxPrice !== undefined && Number.isFinite(maxPrice)) qs.set('max_price', String(maxPrice))
  qs.set('_fields', 'id,name,slug,price,regular_price,sale_price,on_sale,average_rating,rating_count,images,categories,meta_data')

  const res = await fetch(`${BASE}/wp-json/wc/v3/products?${qs.toString()}`, {
    headers: { Authorization: wcAuthHeader() },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`WooCommerce API error ${res.status}`)

  const products = (await res.json()) as WCProduct[]
  const totalPagesHeader = res.headers.get('x-wp-totalpages')
  const parsedTotalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : NaN
  const totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
    ? parsedTotalPages
    : (products.length < PER_PAGE ? page : page + 1)

  const totalHeader = res.headers.get('x-wp-total')
  const parsedTotal = totalHeader ? parseInt(totalHeader, 10) : NaN
  const total = Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : products.length

  return { products, totalPages, total }
}

export interface FilteredPackagesParams {
  categories?: number[]
  minPrice?: number
  maxPrice?: number
  duration?: string[]
  sort?: SortValue
  cursor?: number
}

export interface FilteredPackagesResult {
  packages: PackageCardProps[]
  nextCursor: number | null
  hasMore: boolean
  totalCount: number
}

export async function getFilteredPackages(
  params: FilteredPackagesParams = {},
): Promise<FilteredPackagesResult> {
  const {
    categories = [],
    minPrice,
    maxPrice,
    duration = [],
    sort = 'popular',
    cursor = 1,
  } = params

  let page = Math.max(1, cursor)
  let totalPages = page
  let totalCount = 0
  let fetches = 0
  const collected: WCProduct[] = []

  while (true) {
    fetches++
    const { products, totalPages: tp, total } = await fetchWCPage(page, categories, minPrice, maxPrice)
    totalPages = tp
    totalCount = total

    const matched = duration.length > 0 ? products.filter((p) => matchesDuration(p, duration)) : products
    collected.push(...matched)

    const morePagesExist = page < totalPages
    if (collected.length >= PER_PAGE) break
    if (!morePagesExist) break
    if (fetches >= MAX_WC_FETCHES) break
    page++
  }

  const morePagesExist = page < totalPages
  const nextCursor = morePagesExist ? page + 1 : null

  const packages = applySort(collected.map((p) => mapProduct(p)), sort)

  return {
    packages,
    nextCursor,
    hasMore: nextCursor !== null,
    totalCount,
  }
}
