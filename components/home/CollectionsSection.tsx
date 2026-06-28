import CollectionRow from './CollectionRow'
import { getActiveCollections, getPackages, type Collection } from '@/lib/api'
import { mapProduct } from '@/lib/mapProduct'
import type { PackageCardProps } from '@/components/shared/PackageCard'

const ROW_BG = ['#FFFFFF', '#F9F7F4']

const COLLECTION_EMOJIS: Record<string, string> = {
  spiritual: '🕉️',
  honeymoon: '💑',
  himalaya:  '🏔️',
  weekend:   '🌅',
  adventure: '🧭',
  wildlife:  '🦁',
  beach:     '🌊',
  heritage:  '🏛️',
}

function getEmoji(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, emoji] of Object.entries(COLLECTION_EMOJIS)) {
    if (lower.includes(key)) return emoji
  }
  return '✦'
}

async function fetchPackagesForCollection(col: Collection): Promise<PackageCardProps[]> {
  try {
    let products: Awaited<ReturnType<typeof getPackages>> = []

    if (col.collection_type?.startsWith('type_2')) {
      const src = col.direct_package_collection
      if (src?.package_source_type === 'auto_category' && src.package_category?.length) {
        const entry = src.package_category[0]
        const catId = typeof entry === 'object' ? entry.term_id : entry
        if (catId) products = await getPackages({ category: catId, perPage: 8 })
      } else if (src?.package_source_type === 'auto_tag' && src.package_tag?.length) {
        const entry = src.package_tag[0]
        const tagId = typeof entry === 'object' ? entry.term_id : entry
        if (tagId) products = await getPackages({ tag: tagId, perPage: 8 })
      }
    } else if (col.collection_type?.startsWith('type_1')) {
      const catEntry = col.destinations?.[0]?.package_category?.[0]
      const catId = typeof catEntry === 'object' ? catEntry?.term_id : catEntry
      if (catId) products = await getPackages({ category: catId, perPage: 8 })
    }

    return products.map((p) => mapProduct(p))
  } catch {
    return []
  }
}

export default async function CollectionsSection() {
  const activeCollections = await getActiveCollections()

  const rows = await Promise.all(
    activeCollections.map(async (col) => ({
      col,
      packages: await fetchPackagesForCollection(col),
    }))
  )

  const validRows = rows.filter((r) => r.packages.length > 0)

  if (validRows.length === 0) return null

  return (
    <>
      {/* ── Section header ── */}
      <section className="pt-6 pb-10" style={{ background: '#FFFFFF' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 clamp(16px, 4vw, 40px)',
            textAlign: 'center',
          }}
        >
          {/* Small label */}
          <p
            className="mb-3 uppercase"
            style={{ color: '#1E6B2E', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em' }}
          >
            CURATED EXPERIENCES
          </p>

          {/* H2 with warm gold highlight */}
          <h2
            className="font-display mb-0"
            style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}
          >
            <span
              style={{
                background: '#FFF3D6',
                color: '#1A1A1A',
                borderRadius: '4px',
                padding: '2px 8px',
              }}
            >
              Bon Voyagers
            </span>
            {' '}Travel Collections
          </h2>

          {/* Gold divider */}
          <div
            className="mx-auto"
            style={{ width: '48px', height: '2px', background: '#C8A96A', borderRadius: '2px', margin: '16px auto' }}
          />

          {/* Subtitle */}
          <p
            className="mx-auto"
            style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, maxWidth: '520px' }}
          >
            Handpicked journeys crafted with intention. Immersive, elegant, and unforgettable.
          </p>
        </div>
      </section>

      {/* ── One row per collection ── */}
      {validRows.map(({ col, packages }, i) => (
        <CollectionRow
          key={col.id}
          name={col.collection_name}
          slug={col.collection_slug}
          description={col.collection_description}
          emoji={getEmoji(col.collection_name)}
          viewAllHref={`/collection/${col.collection_slug}`}
          packages={packages}
          bgColor={ROW_BG[i % 2]}
        />
      ))}
    </>
  )
}
