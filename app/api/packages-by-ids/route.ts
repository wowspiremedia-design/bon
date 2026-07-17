import { NextRequest, NextResponse } from 'next/server'
import { getPackagesByIds, type PayloadPackage } from '@/lib/payload-api'
import type { PackageCardProps } from '@/components/shared/PackageCard'
import { getClientIp, isRateLimited } from '@/lib/apiRateLimit'

const MAX_IDS = 100

function mapPayloadPackageToCard(pkg: PayloadPackage): PackageCardProps {
  const discount = pkg.regularPrice > 0
    ? Math.round((1 - pkg.price / pkg.regularPrice) * 100)
    : 0
  const catNames = pkg.category.map((c) => c.name.toLowerCase())
  const badgeType: PackageCardProps['badgeType'] = pkg.onSale && discount > 20
    ? 'deal'
    : catNames.some((n) => n.includes('honeymoon'))
      ? 'honeymoon'
      : null
  const destination = (pkg.category[0]?.name ?? '').replace(' Packages', '').trim()
  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    image: pkg.images[0]?.url ?? '',
    price: pkg.price,
    regularPrice: pkg.regularPrice,
    onSale: pkg.onSale,
    duration: pkg.duration,
    rating: 0,
    reviewCount: 0,
    destination,
    badgeType,
    route: pkg.route,
  }
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request)
  if (isRateLimited(`packages-by-ids:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids') ?? ''
  const ids = idsParam
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, MAX_IDS)

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  try {
    const products = await getPackagesByIds(ids)
    return NextResponse.json(products.map(mapPayloadPackageToCard))
  } catch (err) {
    console.error('packages-by-ids route error:', err)
    return NextResponse.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  }
}
