import CollectionRow from './CollectionRow'
import { getActiveCollections, getPackages, getCategoryPackageCounts, type Collection } from '@/lib/api'
import { getDestinationSlugForCategory } from '@/lib/destinationCategoryLinks'
import { mapProduct } from '@/lib/mapProduct'
import type { PackageCardProps } from '@/components/shared/PackageCard'
import type { DestinationCardProps } from '@/components/home/DestinationCard'

const ROW_BG = ['#FFFFFF', '#F9F7F4']

function darkenHex(hex: string, amount = 0.15): string {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.max(0, Math.round(r * (1 - amount)))
  g = Math.max(0, Math.round(g * (1 - amount)))
  b = Math.max(0, Math.round(b * (1 - amount)))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

const COLLECTION_COLORS: { match: string; color: string }[] = [
  { match: 'suhani safar', color: '#FDCEDF' },
  { match: 'sanatan path', color: '#FFAA00' },
  { match: 'char dham path', color: '#ff9933' },
  { match: 'honeymoon diaries', color: '#FD7979' },
  { match: 'hidden hamlets', color: '#9AD872' },
  { match: 'kailash kora', color: '#A1E3F9' },
  { match: 'host of himalayas', color: '#B4E380' },
]

function getCollectionBg(name: string, fallbackIndex: number): string {
  const lower = name.toLowerCase()
  const found = COLLECTION_COLORS.find((c) => lower.includes(c.match))
  if (found) {
    const darker = darkenHex(found.color, 0.15)
    return `linear-gradient(135deg, ${found.color} 0%, ${darker} 100%)`
  }
  return ROW_BG[fallbackIndex % 2]
}

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

export default async function CollectionsSection() {
  const activeCollections = await getActiveCollections()

  const rows = await Promise.all(
    activeCollections.map(async (col) => {
      if (col.collection_type?.startsWith('type_1')) {
        return {
          col,
          packages: [] as PackageCardProps[],
          destinations: await fetchDestinationCardsForCollection(col),
        }
      }
      return {
        col,
        packages: await fetchPackagesForCollection(col),
        destinations: [] as DestinationCardProps[],
      }
    })
  )

  const validRows = rows.filter((r) => r.packages.length > 0 || r.destinations.length > 0)

  if (validRows.length === 0) return null

  return (
    <>
      {/* ── Section header ── */}
      <section className="pt-6 pb-6" style={{ background: '#FFFFFF' }}>
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
      {validRows.map(({ col, packages, destinations }, i) => (
        <CollectionRow
          key={col.id}
          name={col.collection_name}
          slug={col.collection_slug}
          description={col.collection_description}
          emoji={getEmoji(col.collection_name)}
          viewAllHref={`/collection/${col.collection_slug}`}
          packages={packages}
          cardType={destinations.length > 0 ? 'destination' : 'package'}
          destinations={destinations}
          bgColor={getCollectionBg(col.collection_name, i)}
        />
      ))}
    </>
  )
}
