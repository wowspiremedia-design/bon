import { NextRequest, NextResponse } from 'next/server'
import { DURATION_BAND_KEYS, DEPARTURE_STATE_VALUES, type DepartureState } from '@/lib/payload-api'
import { getFilteredFixedDeparturePackages, type FixedDepartureSortValue, type FixedDeparturePackage } from '@/lib/fixed-departure-api'
import { getClientIp, isRateLimited } from '@/lib/apiRateLimit'

const VALID_TYPES: FixedDeparturePackage['type'][] = ['domestic', 'international']
const VALID_SORTS: FixedDepartureSortValue[] = ['popular', 'price_asc', 'price_desc', 'departure_soonest', 'duration']
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
  if (isRateLimited(`fixed-departure:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const typeRaw = searchParams.get('type')
  const type = (VALID_TYPES as string[]).includes(typeRaw ?? '')
    ? (typeRaw as FixedDeparturePackage['type'])
    : undefined
  const packageType = parseList(searchParams.get('packageType'))
  const stateRaw = searchParams.get('departureState')
  const departureState: DepartureState | undefined =
    stateRaw !== null && (DEPARTURE_STATE_VALUES as readonly string[]).includes(stateRaw)
      ? (stateRaw as DepartureState)
      : undefined
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
  const sort: FixedDepartureSortValue = (VALID_SORTS as string[]).includes(sortRaw) ? (sortRaw as FixedDepartureSortValue) : 'popular'
  const cursorRaw = searchParams.get('cursor')
  const cursor = cursorRaw !== null ? Math.max(1, parseInt(cursorRaw, 10) || 1) : 1

  try {
    const result = await getFilteredFixedDeparturePackages({
      type,
      packageType,
      departureState,
      minPrice,
      maxPrice,
      duration,
      sort,
      cursor,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('fixed-departure route error:', err)
    return NextResponse.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  }
}
