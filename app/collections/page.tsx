import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getActiveCollections, getCollectionCoverImage } from '@/lib/payload-api'

export const metadata: Metadata = {
  title: 'Curated Travel Collections | Bon Voyagers',
  description:
    'Explore curated travel collections by Bon Voyagers - spiritual journeys, luxury escapes, weekend getaways, and once-in-a-lifetime experiences.',
  alternates: { canonical: '/collections' },
}

export default async function CollectionsPage() {
  const activeCollections = await getActiveCollections()

  const withImages = await Promise.all(
    activeCollections.map(async (col) => ({
      col,
      image: await getCollectionCoverImage(col),
    }))
  )

  const validCollections = withImages.filter(
    (c): c is { col: typeof c.col; image: string } => c.image !== null
  )

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <div className="text-center mx-auto mb-12" style={{ maxWidth: '600px' }}>
        <h1
          className="font-display font-bold mb-4"
          style={{ fontSize: '40px', color: '#1A1A1A', lineHeight: 1.2 }}
        >
          Curated Travel Collections
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px', lineHeight: 1.6 }}>
          Discover journeys crafted with purpose, from spiritual paths to luxury escapes.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
        {validCollections.map(({ col, image }) => (
          <Link
            key={col.id}
            href={`/collection/${col.slug}`}
            className="group relative block overflow-hidden rounded-[20px] transition-transform duration-300 ease-out hover:scale-[1.02]"
            style={{ aspectRatio: '4 / 3' }}
          >
            <Image
              src={image}
              alt={col.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />

            {/* Dark gradient overlay for text readability */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                height: '33%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))',
              }}
            />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
              <h2
                className="font-display"
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 'clamp(20px, 2.5vw, 24px)',
                  lineHeight: 1.2,
                  marginBottom: '6px',
                }}
              >
                {col.name}
              </h2>
              <span style={{ color: '#D64545', fontSize: '14px', fontWeight: 600 }}>
                Explore Collection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
