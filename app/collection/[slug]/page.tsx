import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import {
  getCollectionBySlug,
  getCollectionCoverImage,
  getPackages,
  getCategoryPackageCounts,
  type Collection,
  type WCProduct,
} from '@/lib/api'
import { getDestinationSlugForCategory } from '@/lib/destinationCategoryLinks'
import { mapProduct } from '@/lib/mapProduct'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'
import DestinationCard, { type DestinationCardProps } from '@/components/home/DestinationCard'
import ShareCollectionButton from '@/components/collection/ShareCollectionButton'

// ── Package resolution (type_2 / direct package collections) ───────────────────

async function fetchAllPackagesForCollection(col: Collection): Promise<WCProduct[]> {
  let products: WCProduct[] = []

  const src = col.direct_package_collection
  if (src?.package_source_type === 'auto_category' && src.package_category?.length) {
    const entry = src.package_category[0]
    const catId = typeof entry === 'object' ? entry.term_id : entry
    if (catId) products = await getPackages({ category: catId, perPage: 100 })
  } else if (src?.package_source_type === 'auto_tag' && src.package_tag?.length) {
    const entry = src.package_tag[0]
    const tagId = typeof entry === 'object' ? entry.term_id : entry
    if (tagId) products = await getPackages({ tag: tagId, perPage: 100 })
  }

  return products
}

// ── Destination card resolution (type_1 / destination based collections) ───────

async function fetchDestinationCardsForCollection(col: Collection): Promise<DestinationCardProps[]> {
  if (!col.destinations?.length) return []

  const catIdByIndex: (number | null)[] = col.destinations.map((dest) => {
    const catEntry = dest.package_category?.[0]
    const catId = typeof catEntry === 'object' ? catEntry?.term_id : catEntry
    return catId ?? null
  })

  const validCatIds = catIdByIndex.filter((id): id is number => id !== null)
  const countMap = await getCategoryPackageCounts(validCatIds)

  const results = col.destinations.map((dest, i) => {
    const catId = catIdByIndex[i]
    if (!catId) return null

    const slug = getDestinationSlugForCategory(catId)
    if (!slug) return null

    const count = countMap[catId] ?? 0
    if (count === 0) return null

    return {
      name: dest.destination_title ?? '',
      image: dest.destination_image ?? '',
      slug,
      count,
    }
  })

  return results.filter((r): r is NonNullable<typeof r> => r !== null)
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const col = await getCollectionBySlug(slug)
  if (!col) return {}
  const title = col.collection_name
  const description = (col.collection_description || 'Discover a curated travel collection by Bon Voyagers.')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 160)
  return {
    title: `${title} | Bon Voyagers`,
    description,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const col = await getCollectionBySlug(slug)
  if (!col) notFound()

  const isDestinationBased = col.collection_type?.startsWith('type_1') ?? false

  const [coverImage, packages, destinations] = await Promise.all([
    getCollectionCoverImage(col),
    isDestinationBased
      ? Promise.resolve<PackageCardProps[]>([])
      : fetchAllPackagesForCollection(col).then((products) => products.map((p) => mapProduct(p))),
    isDestinationBased
      ? fetchDestinationCardsForCollection(col)
      : Promise.resolve<DestinationCardProps[]>([]),
  ])

  const descriptionParagraphs = (col.collection_description || '')
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <>
      {/* Hero */}
      <section className="relative w-full" style={{ height: '50vh', minHeight: '360px' }}>
        {coverImage && (
          <Image
            src={coverImage}
            alt={col.collection_name}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        )}

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75))' }}
        />

        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center"
          style={{ padding: '32px 24px' }}
        >
          <p
            className="uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em' }}
          >
            BON VOYAGERS COLLECTION
          </p>
          <h1
            className="font-display font-bold mb-4"
            style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.2 }}
          >
            {col.collection_name}
          </h1>
          <div className="mb-5" style={{ width: '48px', height: '2px', background: '#C8A96A' }} />
          <ShareCollectionButton title={col.collection_name} />
        </div>
      </section>

      {/* Description */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px clamp(16px, 4vw, 40px) 0' }}>
        <h2
          className="font-display font-bold text-center mb-6"
          style={{ color: '#1A1A1A', fontSize: 'clamp(24px, 3vw, 32px)' }}
        >
          Discover {col.collection_name}
        </h2>

        <div className="mx-auto text-center" style={{ maxWidth: '700px', color: '#6B7280', lineHeight: 1.8 }}>
          {descriptionParagraphs.length > 0 ? (
            descriptionParagraphs.map((paragraph, i) => (
              <p key={i} className="mb-4">
                {paragraph}
              </p>
            ))
          ) : (
            <p>Discover a curated travel collection by Bon Voyagers.</p>
          )}
        </div>
      </section>

      {/* Packages */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px clamp(16px, 4vw, 40px) 80px' }}>
        <div className="text-center mb-10">
          <h2
            className="font-display font-bold mb-2"
            style={{ color: '#1A1A1A', fontSize: 'clamp(24px, 3vw, 32px)' }}
          >
            Explore {col.collection_name} Packages
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>
            Curated journeys designed for comfort, authenticity, and adventure.
          </p>
        </div>

        {isDestinationBased ? (
          destinations.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No packages available in this collection yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations.map((dest) => (
                <DestinationCard key={dest.slug} {...dest} />
              ))}
            </div>
          )
        ) : packages.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            No packages available in this collection yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
