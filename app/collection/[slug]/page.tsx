import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import {
  getCollectionBySlug,
  getCollectionCoverImage,
  getCollectionPackages,
  getPackagesByCategoryLite,
  type PayloadCollection,
  type PayloadPackage,
} from '@/lib/payload-api'
import { lexicalToHtml } from '@/lib/lexicalToHtml'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'
import DestinationCard, { type DestinationCardProps } from '@/components/home/DestinationCard'
import ShareCollectionButton from '@/components/collection/ShareCollectionButton'

// ── Mapping ──────────────────────────────────────────────────────────────────

function mapPayloadPackageToCard(pkg: PayloadPackage): PackageCardProps {
  const discount = pkg.regularPrice > 0
    ? Math.round((1 - pkg.price / pkg.regularPrice) * 100)
    : 0

  const catNames = pkg.category.map((c) => c.name.toLowerCase())
  const badgeType: PackageCardProps['badgeType'] = pkg.onSale && discount > 20
    ? 'deal'
    : catNames.some((n) => n.includes('honeymoon'))
      ? 'honeymoon'
      : null

  const destination = (pkg.category[0]?.name ?? '').replace(' Packages', '').trim()

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

// ── Destination card resolution (destination_based collections) ───────────────

async function fetchDestinationCardsForCollection(col: PayloadCollection): Promise<DestinationCardProps[]> {
  const results = await Promise.all(
    col.destinations.map(async (dest) => {
      if (!dest.packageCategory) return null
      const lite = await getPackagesByCategoryLite(dest.packageCategory.id)
      const count = lite.length
      if (count === 0) return null

      return {
        name: dest.title,
        image: dest.featuredImage?.url ?? '',
        slug: dest.slug,
        count,
      }
    }),
  )

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
  const title = col.name
  const description = (lexicalToHtml(col.description) || 'Discover a curated travel collection by Bon Voyagers.')
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

  const isDestinationBased = col.collectionType === 'destination_based'

  const [coverImage, packages, destinations] = await Promise.all([
    getCollectionCoverImage(col),
    isDestinationBased
      ? Promise.resolve<PackageCardProps[]>([])
      : getCollectionPackages(col).then((products) => products.map((p) => mapPayloadPackageToCard(p))),
    isDestinationBased
      ? fetchDestinationCardsForCollection(col)
      : Promise.resolve<DestinationCardProps[]>([]),
  ])

  const descriptionHtml = lexicalToHtml(col.description)

  return (
    <>
      {/* Hero */}
      <section className="relative w-full" style={{ height: '50vh', minHeight: '360px' }}>
        {coverImage && (
          <Image
            src={coverImage}
            alt={col.name}
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
            {col.name}
          </h1>
          <div className="mb-5" style={{ width: '48px', height: '2px', background: '#C8A96A' }} />
          <ShareCollectionButton title={col.name} />
        </div>
      </section>

      {/* Description */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px clamp(16px, 4vw, 40px) 0' }}>
        <h2
          className="font-display font-bold text-center mb-6"
          style={{ color: '#1A1A1A', fontSize: 'clamp(24px, 3vw, 32px)' }}
        >
          Discover {col.name}
        </h2>

        <div className="mx-auto text-center [&_p]:mb-4" style={{ maxWidth: '700px', color: '#6B7280', lineHeight: 1.8 }}>
          {descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
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
            Explore {col.name} Packages
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
