import { NextRequest, NextResponse } from 'next/server'
import { getPackagesByIds } from '@/lib/api'
import { mapProduct } from '@/lib/mapProduct'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids') ?? ''

  const ids = idsParam
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  try {
    const products = await getPackagesByIds(ids)
    return NextResponse.json(products.map((p) => mapProduct(p)))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
