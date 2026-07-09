import { NextRequest, NextResponse } from 'next/server'
import { getFilteredPayloadPackages, DURATION_BAND_KEYS, type SortValue } from '@/lib/payload-api'

const VALID_SORTS: SortValue[] = ['popular', 'price_asc', 'price_desc', 'duration']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const categories = (searchParams.get('categories') ?? '')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)

  const minPriceRaw = searchParams.get('minPrice')
  const maxPriceRaw = searchParams.get('maxPrice')
  const minPriceNum = minPriceRaw !== null ? Number(minPriceRaw) : undefined
  const maxPriceNum = maxPriceRaw !== null ? Number(maxPriceRaw) : undefined
  const minPrice = minPriceNum !== undefined && Number.isFinite(minPriceNum) ? minPriceNum : undefined
  const maxPrice = maxPriceNum !== undefined && Number.isFinite(maxPriceNum) ? maxPriceNum : undefined

  const duration = (searchParams.get('duration') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is typeof DURATION_BAND_KEYS[number] =>
      (DURATION_BAND_KEYS as readonly string[]).includes(s),
    )

  const sortRaw = searchParams.get('sort') ?? 'popular'
  const sort: SortValue = (VALID_SORTS as string[]).includes(sortRaw) ? (sortRaw as SortValue) : 'popular'

  const cursorRaw = searchParams.get('cursor')
  const cursor = cursorRaw !== null ? Math.max(1, parseInt(cursorRaw, 10) || 1) : 1

  try {
    const result = await getFilteredPayloadPackages({
      categories,
      minPrice,
      maxPrice,
      duration,
      sort,
      cursor,
    })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
