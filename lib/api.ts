const BASE = process.env.NEXT_PUBLIC_WP_URL ?? 'https://cms.bonvoyagers.co'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WCProductImage {
  id: number
  src: string
  name: string
  alt: string
}

export interface WCProductCategory {
  id: number
  name: string
  slug: string
}

export interface WCProduct {
  id: number
  slug: string
  name: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  average_rating: string
  rating_count: number
  images: WCProductImage[]
  categories: WCProductCategory[]
  meta_data: Array<{ id: number; key: string; value: unknown }>
  description?: string
  short_description?: string
  acf?: Record<string, unknown>
}

export interface Category {
  id: number
  slug: string
  name: string
  count: number
}

export interface Destination {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  images?: WCProductImage[]
  acf?: Record<string, unknown>
}

export interface Collection {
  id: number
  slug: string
  name: string
  description: string
  image?: { id: number; src: string; alt: string }
  acf?: Record<string, unknown>
}

export interface GetPackagesParams {
  page?: number
  perPage?: number
  category?: string | number
  onSale?: boolean
  search?: string
}

// ── Auth ───────────────────────────────────────────────────────────────────────

function wcAuthHeader(): string {
  const ck = process.env.WC_CONSUMER_KEY
  const cs = process.env.WC_CONSUMER_SECRET
  if (!ck || !cs) throw new Error('WooCommerce credentials are not configured')
  return 'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64')
}

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function wcFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: wcAuthHeader() },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`WooCommerce API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`WordPress API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ── Raw CPT shape from WP REST API ─────────────────────────────────────────────

interface RawWPPost {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  acf?: Record<string, unknown>
}

function normaliseCollection(raw: RawWPPost): Collection {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.title.rendered,
    description: raw.excerpt.rendered,
    acf: raw.acf,
  }
}

// ── Packages ───────────────────────────────────────────────────────────────────

export async function getPackages(params: GetPackagesParams = {}): Promise<WCProduct[]> {
  const { page = 1, perPage = 12, category, onSale, search } = params
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    status: 'publish',
  })
  if (category) qs.set('category', String(category))
  if (onSale)   qs.set('on_sale', 'true')
  if (search)   qs.set('search', search)
  qs.set('_fields', 'id,name,slug,price,regular_price,sale_price,on_sale,average_rating,rating_count,images,categories,meta_data')
  return wcFetch<WCProduct[]>(`/wp-json/wc/v3/products?${qs.toString()}`)
}

export async function getPackageBySlug(slug: string): Promise<WCProduct | null> {
  const results = await wcFetch<WCProduct[]>(
    `/wp-json/wc/v3/products?slug=${encodeURIComponent(slug)}&status=publish`,
  )
  return results[0] ?? null
}

// Uses WP REST endpoint to get full ACF fields alongside the product post
export async function getPackageById(id: number): Promise<WCProduct | null> {
  try {
    return await wpFetch<WCProduct>(`/wp-json/wp/v2/product/${id}?acf_format=standard`)
  } catch {
    return null
  }
}

export async function getCategories(): Promise<Category[]> {
  return wcFetch<Category[]>('/wp-json/wc/v3/products/categories?per_page=100')
}

export async function getSalePackages(perPage = 12): Promise<WCProduct[]> {
  return wcFetch<WCProduct[]>(
    `/wp-json/wc/v3/products?on_sale=true&per_page=${perPage}&status=publish`,
  )
}

export async function searchPackages(query: string): Promise<WCProduct[]> {
  return wcFetch<WCProduct[]>(
    `/wp-json/wc/v3/products?search=${encodeURIComponent(query)}&status=publish`,
  )
}

// ── Destinations ───────────────────────────────────────────────────────────────

export async function getDestinations(): Promise<Destination[]> {
  return wpFetch<Destination[]>(
    '/wp-json/wp/v2/destination?per_page=100&acf_format=standard',
  )
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const results = await wpFetch<Destination[]>(
    `/wp-json/wp/v2/destination?slug=${encodeURIComponent(slug)}&acf_format=standard`,
  )
  return results[0] ?? null
}

// ── Collections ────────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const raw = await wpFetch<RawWPPost[]>(
    '/wp-json/wp/v2/collection?per_page=100&acf_format=standard',
  )
  return raw.map(normaliseCollection)
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const raw = await wpFetch<RawWPPost[]>(
    `/wp-json/wp/v2/collection?slug=${encodeURIComponent(slug)}&acf_format=standard`,
  )
  return raw[0] ? normaliseCollection(raw[0]) : null
}
