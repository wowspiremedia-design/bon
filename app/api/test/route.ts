import { NextResponse } from 'next/server'
import { getPackages } from '@/lib/api'

export async function GET() {
  const packages = await getPackages({ perPage: 1 })
  const first = packages[0]

  if (!first) {
    return NextResponse.json({ ok: false, message: 'No packages found' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    id: first.id,
    slug: first.slug,
    name: first.name,
    price: first.price,
    regular_price: first.regular_price,
    sale_price: first.sale_price,
    on_sale: first.on_sale,
    meta_data: first.meta_data,
  })
}
