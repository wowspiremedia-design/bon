import type { MetadataRoute } from 'next'
import { getDestinations, getCategories, getActiveCollections, getAllPackageSlugs } from '@/lib/payload-api'
import { getAllMappedPayloadHotels } from '@/lib/payload-hotels-api'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bonvoyagers.co'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL },
    { url: `${SITE_URL}/destinations` },
    { url: `${SITE_URL}/packages` },
    { url: `${SITE_URL}/collections` },
    { url: `${SITE_URL}/hotels` },
    { url: `${SITE_URL}/deals` },
    { url: `${SITE_URL}/about` },
    { url: `${SITE_URL}/contact` },
  ]

  try {
    const destinations = await getDestinations()
    entries.push(...destinations.map((dest) => ({ url: `${SITE_URL}/destination/${dest.slug}` })))
  } catch (err) {
    console.warn('sitemap: failed to fetch destinations', err)
  }

  try {
    const categories = await getCategories()
    entries.push(...categories.map((cat) => ({ url: `${SITE_URL}/packages/${cat.slug}` })))
  } catch (err) {
    console.warn('sitemap: failed to fetch categories', err)
  }

  try {
    const collections = await getActiveCollections()
    entries.push(...collections.map((col) => ({ url: `${SITE_URL}/collection/${col.slug}` })))
  } catch (err) {
    console.warn('sitemap: failed to fetch collections', err)
  }

  try {
    const hotels = await getAllMappedPayloadHotels()
    entries.push(...hotels.map((hotel) => ({ url: `${SITE_URL}/hotel/${hotel.slug}` })))
  } catch (err) {
    console.warn('sitemap: failed to fetch hotels', err)
  }

  try {
    const packages = await getAllPackageSlugs()
    entries.push(
      ...packages.map((pkg) => ({
        url: `${SITE_URL}/package/${pkg.slug}`,
        lastModified: new Date(pkg.updatedAt),
      })),
    )
  } catch (err) {
    console.warn('sitemap: failed to fetch packages', err)
  }

  return entries
}
