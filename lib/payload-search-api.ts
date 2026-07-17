import { resolveMediaUrl, type PayloadListResponse } from './payload-api'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

async function payloadFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export type SearchResultType = 'destination' | 'hotel' | 'package'

export interface SearchResultItem {
  type: SearchResultType
  id: number
  slug: string
  title: string
  image: string
  subtitle: string
}

export interface SearchGroup {
  items: SearchResultItem[]
  total: number
}

export interface SearchResult {
  destinations: SearchGroup
  hotels: SearchGroup
  packages: SearchGroup
}

interface RawDestination {
  id: number
  title: string
  slug: string
  excerpt: string
  featuredImage: { url: string } | null
}

interface RawHotel {
  id: number
  title: string
  slug: string
  address: string
  overview: string
  gallery: { url: string }[]
}

interface RawPackage {
  id: number
  title: string
  slug: string
  duration: string
  price: number
  images: { url: string }[]
}

function likeQuery(fields: string[], q: string): string {
  return fields
    .map((field, i) => `where[or][${i}][${field}][like]=${encodeURIComponent(q)}`)
    .join('&')
}

export async function searchDestinations(q: string, limit: number, cursor = 1): Promise<SearchGroup> {
  const path = `/api/destinations?${likeQuery(['title', 'excerpt'], q)}&limit=${limit}&page=${cursor}`
  const res = await payloadFetch<PayloadListResponse<RawDestination>>(path)
  if (!Array.isArray(res.docs)) return { items: [], total: 0 }
  return {
    total: res.totalDocs,
    items: res.docs.map((d) => ({
      type: 'destination' as const,
      id: d.id,
      slug: d.slug,
      title: d.title,
      image: resolveMediaUrl(d.featuredImage?.url) ?? '',
      subtitle: d.excerpt,
    })),
  }
}

export async function searchHotels(q: string, limit: number, cursor = 1): Promise<SearchGroup> {
  const path = `/api/hotels?${likeQuery(['title', 'address', 'overview'], q)}&limit=${limit}&page=${cursor}`
  const res = await payloadFetch<PayloadListResponse<RawHotel>>(path)
  if (!Array.isArray(res.docs)) return { items: [], total: 0 }
  return {
    total: res.totalDocs,
    items: res.docs.map((h) => ({
      type: 'hotel' as const,
      id: h.id,
      slug: h.slug,
      title: h.title,
      image: resolveMediaUrl(h.gallery[0]?.url) ?? '',
      subtitle: h.address,
    })),
  }
}

export async function searchPackages(q: string, limit: number, cursor = 1): Promise<SearchGroup> {
  const path = `/api/packages?${likeQuery(['title', 'seoDescription'], q)}&limit=${limit}&page=${cursor}`
  const res = await payloadFetch<PayloadListResponse<RawPackage>>(path)
  if (!Array.isArray(res.docs)) return { items: [], total: 0 }
  return {
    total: res.totalDocs,
    items: res.docs.map((p) => ({
      type: 'package' as const,
      id: p.id,
      slug: p.slug,
      title: p.title,
      image: resolveMediaUrl(p.images[0]?.url) ?? '',
      subtitle: p.duration,
    })),
  }
}

export async function searchAll(q: string, previewLimit: number): Promise<SearchResult> {
  const [destinations, hotels, packages] = await Promise.all([
    searchDestinations(q, previewLimit),
    searchHotels(q, previewLimit),
    searchPackages(q, previewLimit),
  ])
  return { destinations, hotels, packages }
}
