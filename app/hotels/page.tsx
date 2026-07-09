import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllLocations, getFilteredPayloadHotels, formatEnumLabel, formatAmenityLabel } from '@/lib/payload-hotels-api'
import HotelsClient, { type TaxonomyOptions } from '@/components/hotels/HotelsClient'

const SITE_URL = 'https://bonvoyagers.co'

export const metadata: Metadata = {
  title: 'All Hotels & Stays | Bon Voyagers',
  description: 'Browse every hotel and stay from Bon Voyagers. Filter by location, property type, amenities and price to find your perfect stay.',
}

// Real known enum values from the Hotels collection schema (Payload has no
// taxonomy lookup for these, they are plain snake_case strings on the doc).
const PROPERTY_CATEGORIES = ['economy', 'elite', 'heritage', 'luxury', 'premium']
const PROPERTY_TYPES = ['hotel', 'homestay', 'resort', 'bungalow', 'tented_camp']
const AMENITIES = [
  'wifi', 'ac', 'room_heater', 'geyser_hot_water', 'television', 'balcony',
  'parking', 'room_service', 'restaurant', 'travel_desk_tour_assistance',
  'bonfire', 'kids_play_area', 'elevator', 'power_backup',
]
const FOOD_TYPES = ['jain_food', 'non_veg', 'pure_veg']
const VIEW_TYPES = [
  'mountain_view', 'snow_peak_view', 'valley_view', 'sea_view', 'river_view',
  'lake_view', 'garden_view', 'forest_view', 'pool_view', 'city_view',
  'courtyard_view', 'standard_view',
]
const COMPATIBILITY = ['couple_friendly', 'local_id_friendly', 'pets_allowed']

function formatOptions(values: string[]): string[] {
  return values.map(formatEnumLabel).sort((a, b) => a.localeCompare(b))
}

function formatAmenityOptions(values: string[]): string[] {
  return values.map(formatAmenityLabel).sort((a, b) => a.localeCompare(b))
}

export default async function AllHotelsPage() {
  const [locations, initial] = await Promise.all([
    getAllLocations(),
    getFilteredPayloadHotels({ cursor: 1 }),
  ])

  const taxonomyOptions: TaxonomyOptions = {
    hotel_locations: locations,
    hotel_property_category: formatOptions(PROPERTY_CATEGORIES),
    hotel_property_type: formatOptions(PROPERTY_TYPES),
    hotel_amenities: formatAmenityOptions(AMENITIES),
    hotel_food_type: formatAmenityOptions(FOOD_TYPES),
    hotel_view_type: formatOptions(VIEW_TYPES),
    hotel_compatibility: formatOptions(COMPATIBILITY),
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
          name: h.title,
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
