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
  excerpt?: { rendered: string }
  content: { rendered: string }
  images?: WCProductImage[]
  acf?: Record<string, unknown>
  place_entries?: number[]
  place_gallery_ids?: number[]
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>
  }
}

export interface CollectionACFSource {
  package_source_type?: string
  package_category?: Array<{ term_id: number } | number>
  package_tag?: Array<{ term_id: number } | number>
}

export interface Collection {
  id: number
  slug: string
  name: string
  description: string
  image?: { id: number; src: string; alt: string }
  acf?: Record<string, unknown>
  collection_name: string
  collection_slug: string
  collection_description: string
  collection_type?: string
  collection_priority?: number
  is_active?: boolean | string
  direct_package_collection?: CollectionACFSource
  destinations?: Array<{ package_category?: Array<{ term_id: number } | number> }>
}

export interface GetPackagesParams {
  page?: number
  perPage?: number
  category?: string | number
  tag?: number
  onSale?: boolean
  search?: string
}

export interface PackageLite {
  id: number
  price: number
  regularPrice: number
  duration: string
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
  excerpt?: { rendered: string }
  content: { rendered: string }
  acf?: Record<string, unknown>
}

function normaliseCollection(raw: RawWPPost): Collection {
  const acf = (raw.acf ?? {}) as Record<string, unknown>
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.title.rendered,
    description: raw.excerpt?.rendered ?? '',
    acf,
    collection_name:        (acf.collection_name as string)        ?? raw.title.rendered,
    collection_slug:        (acf.collection_slug as string)        ?? raw.slug,
    collection_description: (acf.collection_description as string) ?? '',
    collection_type:        acf.collection_type  as string | undefined,
    collection_priority:    acf.collection_priority as number | undefined,
    is_active:              acf.is_active as boolean | string | undefined,
    direct_package_collection: acf.direct_package_collection as Collection['direct_package_collection'],
    destinations:           acf.destinations as Collection['destinations'],
  }
}

// ── Packages ───────────────────────────────────────────────────────────────────

export async function getPackages(params: GetPackagesParams = {}): Promise<WCProduct[]> {
  const { page = 1, perPage = 12, category, tag, onSale, search } = params
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    status: 'publish',
  })
  if (category) qs.set('category', String(category))
  if (tag)      qs.set('tag',      String(tag))
  if (onSale)   qs.set('on_sale', 'true')
  if (search)   qs.set('search', search)
  qs.set('_fields', 'id,name,slug,price,regular_price,sale_price,on_sale,average_rating,rating_count,images,categories,meta_data')
  return wcFetch<WCProduct[]>(`/wp-json/wc/v3/products?${qs.toString()}`)
}

export async function getAllPackages(
  params: Omit<GetPackagesParams, 'page' | 'perPage'> = {},
): Promise<WCProduct[]> {
  const all: WCProduct[] = []
  const MAX_PAGES = 20
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getPackages({ ...params, page, perPage: 100 })
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}

export async function getAllPackagesLite(
  params: Omit<GetPackagesParams, 'page' | 'perPage'> = {},
): Promise<PackageLite[]> {
  const { category, tag, onSale, search } = params
  const all: PackageLite[] = []
  const MAX_PAGES = 20

  for (let page = 1; page <= MAX_PAGES; page++) {
    const qs = new URLSearchParams({
      page: String(page),
      per_page: '100',
      status: 'publish',
      _fields: 'id,price,regular_price,package_days_duration',
    })
    if (category) qs.set('category', String(category))
    if (tag)      qs.set('tag',      String(tag))
    if (onSale)   qs.set('on_sale', 'true')
    if (search)   qs.set('search', search)

    const batch = await wcFetch<Array<{
      id: number
      price: string
      regular_price: string
      package_days_duration: string
    }>>(`/wp-json/wc/v3/products?${qs.toString()}`)

    for (const p of batch) {
      const duration = typeof p.package_days_duration === 'string' ? p.package_days_duration : ''
      all.push({
        id: p.id,
        price: parseFloat(p.price) || 0,
        regularPrice: parseFloat(p.regular_price) || 0,
        duration,
      })
    }

    if (batch.length < 100) break
  }

  return all
}

export async function getPackagesByIds(ids: number[]): Promise<WCProduct[]> {
  if (ids.length === 0) return []
  const qs = new URLSearchParams({
    include: ids.join(','),
    per_page: String(ids.length),
    status: 'publish',
    _fields: 'id,name,slug,price,regular_price,sale_price,on_sale,average_rating,rating_count,images,categories,meta_data',
  })
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
    '/wp-json/wp/v2/dt_places?per_page=100&_embed',
  )
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  try {
    const results = await wpFetch<Destination[]>(
      `/wp-json/wp/v2/dt_places?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`,
    )
    return results[0] ?? null
  } catch {
    return null
  }
}

// ── Collections ────────────────────────────────────────────────────────────────

export async function getCollections(): Promise<Collection[]> {
  const raw = await wpFetch<RawWPPost[]>(
    '/wp-json/wp/v2/collections?per_page=100',
  )
  return raw.map(normaliseCollection)
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const raw = await wpFetch<RawWPPost[]>(
    `/wp-json/wp/v2/collections?slug=${encodeURIComponent(slug)}`,
  )
  return raw[0] ? normaliseCollection(raw[0]) : null
}

export async function getActiveCollections(): Promise<Collection[]> {
  try {
    const all = await getCollections()
    return all
      .filter(c => c.is_active === true || c.is_active === 'true')
      .sort((a, b) => Number(a.collection_priority ?? 99) - Number(b.collection_priority ?? 99))
  } catch {
    return []
  }
}

export async function getDestinationImages(): Promise<string[]> {
  try {
    const res = await fetch(
      `${BASE}/wp-json/wp/v2/dt_places?per_page=20&_embed`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const places = await res.json()
    const images: string[] = []
    for (const place of places) {
      const media = place._embedded?.['wp:featuredmedia']
      if (media && Array.isArray(media) && media[0]?.source_url) {
        images.push(media[0].source_url)
      }
    }
    const filtered = images.filter(Boolean)
    console.log('Destination images loaded:', filtered.length, filtered)
    return filtered
  } catch (err) {
    console.error('getDestinationImages error:', err)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getHeroSlides(): Promise<any[]> {
  try {
    const res = await fetch(
      `${BASE}/wp-json/wp/v2/pages/7513?acf_format=standard`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const page = await res.json()
    const slides = page?.acf?.slider_images
    if (!Array.isArray(slides)) return []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return slides.filter((s: any) => s.image)
  } catch {
    return []
  }
}

export async function getDestinationGallery(galleryIds: number[]): Promise<string[]> {
  if (!galleryIds || galleryIds.length === 0) return []
  try {
    const ids = galleryIds.join(',')
    const res = await fetch(
      `${BASE}/wp-json/wp/v2/media?include=${ids}&per_page=100`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const media = await res.json() as Array<{ id: number; mime_type?: string; source_url?: string }>
    return media
      .filter((m) => m.mime_type?.startsWith('image/'))
      .map((m) => m.source_url ?? '')
      .filter(Boolean)
  } catch {
    return []
  }
}
