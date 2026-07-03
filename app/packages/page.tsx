import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategories } from '@/lib/api'
import { getFilteredPackages } from '@/lib/getFilteredPackages'
import AllPackagesClient from '@/components/packages/AllPackagesClient'

const SITE_URL = 'https://bonvoyagers.co'

export const metadata: Metadata = {
  title: 'All Travel Packages | Bon Voyagers',
  description: 'Browse every curated travel package from Bon Voyagers. Filter by destination, price and duration to find your next trip.',
}

export default async function AllPackagesPage() {
  const [categories, initial] = await Promise.all([
    getCategories(),
    getFilteredPackages({ sort: 'popular', cursor: 1 }),
  ])

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
        />
      </div>
    </>
  )
}
