import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllTaxonomyLookups } from '@/lib/hotels-api'
import { getFilteredHotels } from '@/lib/getFilteredHotels'
import { decodeHtmlEntities } from '@/lib/decodeHtmlEntities'
import HotelsClient, { type TaxonomyOptions } from '@/components/hotels/HotelsClient'

const SITE_URL = 'https://bonvoyagers.co'

export const metadata: Metadata = {
  title: 'All Hotels & Stays | Bon Voyagers',
  description: 'Browse every hotel and stay from Bon Voyagers. Filter by location, property type, amenities and price to find your perfect stay.',
}

function optionsFromLookup(lookup: Map<number, string>): string[] {
  return Array.from(lookup.values()).sort((a, b) => a.localeCompare(b))
}

export default async function AllHotelsPage() {
  const [lookups, initial] = await Promise.all([
    getAllTaxonomyLookups(),
    getFilteredHotels({ cursor: 1 }),
  ])

  const taxonomyOptions: TaxonomyOptions = {
    hotel_locations: optionsFromLookup(lookups.hotel_locations),
    hotel_property_category: optionsFromLookup(lookups.hotel_property_category),
    hotel_property_type: optionsFromLookup(lookups.hotel_property_type),
    hotel_amenities: optionsFromLookup(lookups.hotel_amenities),
    hotel_food_type: optionsFromLookup(lookups.hotel_food_type),
    hotel_view_type: optionsFromLookup(lookups.hotel_view_type),
    hotel_compatibility: optionsFromLookup(lookups.hotel_compatibility),
  }

  const totalCount = initial.totalCount

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Hotels', item: `${SITE_URL}/hotels` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'All Hotels & Stays',
        description: `Browse ${totalCount} hotels and stays across all destinations.`,
        url: `${SITE_URL}/hotels`,
      },
      {
        '@type': 'ItemList',
        itemListElement: initial.hotels.map((h, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/hotel/${h.slug}`,
          name: decodeHtmlEntities(h.title),
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
              <li style={{ color: '#888888' }}>Hotels</li>
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
            Hotels
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
        <HotelsClient
          taxonomyOptions={taxonomyOptions}
          initialHotels={initial.hotels}
          initialNextCursor={initial.nextCursor}
          initialHasMore={initial.hasMore}
          initialTotalCount={initial.totalCount}
        />
      </div>
    </>
  )
}
