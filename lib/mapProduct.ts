import type { WCProduct } from './api'
import type { PackageCardProps } from '@/components/shared/PackageCard'

export function getBadge(product: WCProduct): PackageCardProps['badgeType'] {
  const regular = parseFloat(product.regular_price)
  const price = parseFloat(product.price)
  const discount = regular > 0 ? Math.round((1 - price / regular) * 100) : 0

  if (product.on_sale && discount > 20) return 'deal'

  const catNames = product.categories.map((c) => c.name.toLowerCase())
  if (catNames.some((n) => n.includes('honeymoon'))) return 'honeymoon'

  if (parseFloat(product.average_rating) >= 4.9) return 'bestseller'

  return null
}

export function mapProduct(product: WCProduct, destinationOverride?: string): PackageCardProps {
  const durationMeta = product.meta_data.find((m) => m.key === '_package_days_duration')
  const duration = typeof durationMeta?.value === 'string' ? durationMeta.value : ''

  const routeMeta = product.meta_data.find((m) => m.key === '_package_place')
  const route = typeof routeMeta?.value === 'string' ? routeMeta.value : undefined

  const destination =
    destinationOverride ??
    (product.categories[0]?.name ?? '').replace(' Packages', '').trim()

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
