import { NextRequest, NextResponse } from 'next/server'
import { getFilteredPayloadPackages, DURATION_BAND_KEYS, DEPARTURE_STATE_VALUES, type SortValue, type DepartureState } from '@/lib/payload-api'
import { getClientIp, isRateLimited } from '@/lib/apiRateLimit'

const VALID_SORTS: SortValue[] = ['popular', 'price_asc', 'price_desc', 'duration']
const MAX_LIST_VALUES = 50

function parseList(value: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_LIST_VALUES)
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request)
  if (isRateLimited(`packages:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const categories = (searchParams.get('categories') ?? '')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, MAX_LIST_VALUES)
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
  const experienceType = parseList(searchParams.get('experienceType'))
  const activities = parseList(searchParams.get('activities'))
  const bestSeason = parseList(searchParams.get('bestSeason'))
  const stateRaw = searchParams.get('state')
  const departureState: DepartureState | undefined =
    stateRaw !== null && (DEPARTURE_STATE_VALUES as readonly string[]).includes(stateRaw)
      ? (stateRaw as DepartureState)
      : undefined
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
      experienceType,
      activities,
      bestSeason,
      departureState,
      sort,
      cursor,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('packages route error:', err)
    return NextResponse.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  }
}
