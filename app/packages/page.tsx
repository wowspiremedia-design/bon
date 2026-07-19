import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  getCategories,
  getFilteredPayloadPackages,
  getPackagesByCategory,
  getPackagesByDepartureState,
  DEPARTURE_STATE_VALUES,
  type DepartureState,
} from '@/lib/payload-api'
import { formatStateLabel } from '@/lib/geoState'
import AllPackagesClient from '@/components/packages/AllPackagesClient'

const SITE_URL = 'https://bonvoyagers.co'

export const metadata: Metadata = {
  title: 'India Tour Packages 2026 | Bon Voyagers',
  description: 'Explore handpicked India tour packages 2026. Domestic, international, best prices, direct booking.',
  alternates: { canonical: '/packages' },
}

export default async function AllPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; city?: string }>
}) {
  const { state: stateRaw, city: cityRaw } = await searchParams
  const departureState: DepartureState | undefined =
    stateRaw !== undefined && (DEPARTURE_STATE_VALUES as readonly string[]).includes(stateRaw)
      ? (stateRaw as DepartureState)
      : undefined

  const [categoriesRaw, initial, heroPackages] = await Promise.all([
    getCategories(),
    getFilteredPayloadPackages({ departureState, sort: 'popular', cursor: 1 }),
    departureState ? getPackagesByDepartureState(departureState, 1) : Promise.resolve([]),
  ])

  const heroPackage = heroPackages[0] ?? null
  const heroImageUrl = heroPackage?.images[0]?.url
  const heroCity = departureState ? (cityRaw || formatStateLabel(departureState)) : ''

  const categories = await Promise.all(
    categoriesRaw.map(async (cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: (await getPackagesByCategory(cat.id, 1, 1)).totalDocs,
    })),
  )

  const totalCount = initial.totalCount

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Packages', item: `${SITE_URL}/packages` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'All Travel Packages',
        description: `Browse ${totalCount} curated travel packages across all destinations.`,
        url: `${SITE_URL}/packages`,
      },
      {
        '@type': 'ItemList',
        itemListElement: initial.packages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/package/${p.slug}`,
          name: p.title,
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0EBE1' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '10px clamp(16px, 4vw, 40px)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li><Link href="/" style={{ color: '#1E6B2E', fontWeight: 500 }}>Home</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li style={{ color: '#888888' }}>Packages</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Hero banner ── */}
      {departureState ? (
        <section className="relative w-full" style={{ height: '50vh', minHeight: '360px' }}>
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt={heroCity}
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
            <h1
              className="font-display font-bold mb-3"
              style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.2 }}
            >
              Best Tour Packages from {heroCity}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
              Book the most affordable tour packages from {heroCity} today.
            </p>
          </div>
        </section>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #0D3B1E 0%, #1E6B2E 100%)',
            padding: 'clamp(20px, 3vw, 28px) clamp(16px, 4vw, 40px)',
          }}
        >
          <div className="mx-auto" style={{ maxWidth: '1280px' }}>
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.2,
                margin: 0,
                fontFamily: 'var(--font-playfair)',
              }}
            >
              All Travel Packages
            </h1>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) 80px',
        }}
      >
        <AllPackagesClient
          categories={categories}
          initialPackages={initial.packages}
          initialNextCursor={initial.nextCursor}
          initialHasMore={initial.hasMore}
          initialTotalCount={initial.totalCount}
          lockedState={departureState}
        />
      </div>
    </>
  )
}
