import HeroCarousel from '@/components/home/HeroCarousel'
import TrustStrip from '@/components/home/TrustStrip'
import FeaturedPackagesClient from '@/components/home/FeaturedPackagesClient'
import PopularDestinations from '@/components/home/PopularDestinations'
import CollectionsSection from '@/components/home/CollectionsSection'
import CTASection from '@/components/home/CTASection'
import { getPackages, getCategories } from '@/lib/api'
import type { WCProduct } from '@/lib/api'
import type { PackageCardProps } from '@/components/shared/PackageCard'

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

function mapProduct(product: WCProduct): PackageCardProps {
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
    destination: product.categories[0]?.name ?? '',
    badgeType: getBadge(product),
    route,
  }
}

export default async function Home() {
  const [products, categories] = await Promise.all([
    getPackages({ perPage: 9 }),
    getCategories(),
  ])

  const packages = products.map(mapProduct)

  const tabs = [
    'All',
    ...categories
      .filter((c) => c.count > 0)
      .slice(0, 6)
      .map((c) => c.name),
  ]

  return (
    <>
      <HeroCarousel />
      <TrustStrip />
      <FeaturedPackagesClient packages={packages} tabs={tabs} />
      <PopularDestinations />
      <CollectionsSection />
      <CTASection />
    </>
  )
}
