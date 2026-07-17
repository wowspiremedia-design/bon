import { NextRequest, NextResponse } from 'next/server'
import { getFilteredPayloadHotels } from '@/lib/payload-hotels-api'
import { getClientIp, isRateLimited } from '@/lib/apiRateLimit'

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
  if (isRateLimited(`hotels:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') ?? undefined
  const propertyCategory = searchParams.get('propertyCategory') ?? undefined
  const propertyType = searchParams.get('propertyType') ?? undefined
  const amenities = parseList(searchParams.get('amenities'))
  const foodType = parseList(searchParams.get('foodType'))
  const viewType = parseList(searchParams.get('viewType'))
  const compatibility = parseList(searchParams.get('compatibility'))
  const minPriceRaw = searchParams.get('minPrice')
  const maxPriceRaw = searchParams.get('maxPrice')
  const minPriceNum = minPriceRaw !== null ? Number(minPriceRaw) : undefined
  const maxPriceNum = maxPriceRaw !== null ? Number(maxPriceRaw) : undefined
  const minPrice = minPriceNum !== undefined && Number.isFinite(minPriceNum) ? minPriceNum : undefined
  const maxPrice = maxPriceNum !== undefined && Number.isFinite(maxPriceNum) ? maxPriceNum : undefined
  const cursorRaw = searchParams.get('cursor')
  const cursor = cursorRaw !== null ? Math.max(1, parseInt(cursorRaw, 10) || 1) : 1

  try {
    const result = await getFilteredPayloadHotels({
      location,
      propertyCategory,
      propertyType,
      amenities,
      foodType,
      viewType,
      compatibility,
      minPrice,
      maxPrice,
      cursor,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('hotels route error:', err)
    return NextResponse.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  }
}
