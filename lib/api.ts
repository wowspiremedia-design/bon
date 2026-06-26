const WP_URL = process.env.NEXT_PUBLIC_WP_URL

const STORE_API = `${WP_URL}/wp-json/wc/store/v1`
const WP_API = `${WP_URL}/wp-json/wp/v2`

const REVALIDATE = 60

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WooProductImage {
  id: number
  src: string
  thumbnail: string
  name: string
  alt: string
}

export interface WooProductCategory {
  id: number
  name: string
  slug: string
  link: string
}

export interface WooProductPrices {
  price: string
  regular_price: string
  sale_price: string
  currency_code: string
  currency_symbol: string
  currency_prefix: string
  currency_suffix: string
  price_range: { min_amount: string; max_amount: string } | null
}

export interface WooProduct {
  id: number
  name: string
  slug: string
  permalink: string
  type: string
  status: string
  featured: boolean
  description: string
  short_description: string
  sku: string
  prices: WooProductPrices
  is_in_stock: boolean
  is_on_sale: boolean
  images: WooProductImage[]
  categories: WooProductCategory[]
  has_options: boolean
  variations: number[]
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  image: { id: number; src: string; alt: string } | null
  count: number
  link: string
}

export interface WPFeaturedMedia {
  id: number
  source_url: string
  alt_text: string
  media_details: {
    width: number
    height: number
    sizes: Record<string, { source_url: string; width: number; height: number }>
  }
}

export interface Destination {
  id: number
  date: string
  slug: string
  status: string
  link: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  featured_media: number
  acf?: Record<string, unknown>
  _embedded?: { 'wp:featuredmedia'?: WPFeaturedMedia[] }
}

export interface Collection {
  id: number
  date: string
  slug: string
  status: string
  link: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  featured_media: number
  acf?: Record<string, unknown>
  _embedded?: { 'wp:featuredmedia'?: WPFeaturedMedia[] }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  totalPages: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE } })
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`)
  return res.json() as Promise<T>
}

async function fetchPaginated<T>(url: string): Promise<PaginatedResponse<T>> {
  const res = await fetch(url, { next: { revalidate: REVALIDATE } })
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`)
  const items = (await res.json()) as T[]
  const total = parseInt(res.headers.get('x-wp-total') ?? '0', 10)
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') ?? '1', 10)
  return { items, total, totalPages }
}

// ─── Packages (WooCommerce Products) ──────────────────────────────────────────

export async function getAllPackages(
  page = 1,
  perPage = 12,
): Promise<PaginatedResponse<WooProduct>> {
  const url = `${STORE_API}/products?page=${page}&per_page=${perPage}&status=publish&_embed=1`
  return fetchPaginated<WooProduct>(url)
}

export async function getPackageBySlug(slug: string): Promise<WooProduct | null> {
  const url = `${STORE_API}/products?slug=${encodeURIComponent(slug)}&_embed=1`
  const res = await fetch(url, { next: { revalidate: REVALIDATE } })
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`)
  const products = (await res.json()) as WooProduct[]
  return products[0] ?? null
}

// Uses wp/v2/product_cat — requires the product_cat taxonomy to be REST-enabled
export async function getPackageCategories(): Promise<ProductCategory[]> {
  const url = `${WP_API}/product_cat?per_page=100&hide_empty=true`
  return fetchJSON<ProductCategory[]>(url)
}

export async function getSalePackages(
  page = 1,
  perPage = 12,
): Promise<PaginatedResponse<WooProduct>> {
  const url = `${STORE_API}/products?on_sale=true&page=${page}&per_page=${perPage}&status=publish&_embed=1`
  return fetchPaginated<WooProduct>(url)
}

export async function searchPackages(
  query: string,
  page = 1,
  perPage = 12,
): Promise<PaginatedResponse<WooProduct>> {
  const url = `${STORE_API}/products?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&status=publish&_embed=1`
  return fetchPaginated<WooProduct>(url)
}

// ─── Destinations (Custom Post Type) ──────────────────────────────────────────

export async function getAllDestinations(
  page = 1,
  perPage = 100,
): Promise<Destination[]> {
  const url = `${WP_API}/destinations?page=${page}&per_page=${perPage}&status=publish&_embed=1`
  return fetchJSON<Destination[]>(url)
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const url = `${WP_API}/destinations?slug=${encodeURIComponent(slug)}&_embed=1`
  const items = await fetchJSON<Destination[]>(url)
  return items[0] ?? null
}

// ─── Collections (Custom Post Type) ───────────────────────────────────────────

export async function getAllCollections(
  page = 1,
  perPage = 100,
): Promise<Collection[]> {
  const url = `${WP_API}/collections?page=${page}&per_page=${perPage}&status=publish&_embed=1`
  return fetchJSON<Collection[]>(url)
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const url = `${WP_API}/collections?slug=${encodeURIComponent(slug)}&_embed=1`
  const items = await fetchJSON<Collection[]>(url)
  return items[0] ?? null
}
