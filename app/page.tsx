import HeroCarousel from '@/components/home/HeroCarousel'
import TrustStrip from '@/components/home/TrustStrip'
import FeaturedPackagesClient from '@/components/home/FeaturedPackagesClient'
import PopularDestinations from '@/components/home/PopularDestinations'
import CollectionsSection from '@/components/home/CollectionsSection'
import CTASection from '@/components/home/CTASection'
import { getPackages } from '@/lib/api'
import type { WCProduct } from '@/lib/api'
import type { PackageCardProps } from '@/components/shared/PackageCard'

// ── Helpers ────────────────────────────────────────────────────────────────────

function getBadge(product: WCProduct): PackageCardProps['badgeType'] {
  const regular = parseFloat(product.regular_price)
  const price = parseFloat(product.price)
  const discount = regular > 0 ? Math.round((1 - price / regular) * 100) : 0

  if (product.on_sale && discount > 20) return 'deal'

  const catNames = product.categories.map((c) => c.name.toLowerCase())
  if (catNames.some((n) => n.includes('honeymoon'))) return 'honeymoon'

  if (parseFloat(product.average_rating) >= 4.9) return 'bestseller'

  return null
}

function mapProduct(product: WCProduct, destination: string): PackageCardProps {
  const durationMeta = product.meta_data.find((m) => m.key === '_package_days_duration')
  const duration = typeof durationMeta?.value === 'string' ? durationMeta.value : ''

  const routeMeta = product.meta_data.find((m) => m.key === '_package_place')
  const route = typeof routeMeta?.value === 'string' ? routeMeta.value : undefined

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    image: product.images[0]?.src ?? '',
    price: parseFloat(product.price) || 0,
    regularPrice: parseFloat(product.regular_price) || 0,
    onSale: product.on_sale,
    duration,
    rating: parseFloat(product.average_rating) || 0,
    reviewCount: product.rating_count,
    destination,
    badgeType: getBadge(product),
    route,
  }
}

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 15,  label: 'Kashmir' },
  { id: 24,  label: 'Andaman' },
  { id: 122, label: 'Meghalaya' },
  { id: 22,  label: 'Ladakh' },
  { id: 25,  label: 'Bhutan' },
  { id: 101, label: 'Darjeeling' },
]

const TAB_LABELS = ['All', 'Kashmir', 'Andaman', 'Meghalaya', 'Ladakh', 'Bhutan', 'Darjeeling']

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function Home() {
  // Fetch 2 packages per category in parallel using numeric IDs
  const results = await Promise.all(
    CATEGORIES.map(({ id }) => getPackages({ category: id, perPage: 2 })),
  )

  // Combine: take up to 2 from each batch, deduplicate by id, cap at 12
  const seen = new Set<number>()
  const packages: PackageCardProps[] = []

  for (let i = 0; i < CATEGORIES.length; i++) {
    for (const product of results[i].slice(0, 2)) {
      if (!seen.has(product.id)) {
        seen.add(product.id)
        packages.push(mapProduct(product, CATEGORIES[i].label))
        if (packages.length === 12) break
      }
    }
    if (packages.length === 12) break
  }

  return (
    <>
      <HeroCarousel />
      <TrustStrip />
      <FeaturedPackagesClient packages={packages} tabs={TAB_LABELS} />
      <PopularDestinations />
      <CollectionsSection />
      <CTASection />
    </>
  )
}
