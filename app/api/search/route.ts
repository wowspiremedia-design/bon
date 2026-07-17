import { NextRequest, NextResponse } from 'next/server'
import { searchAll, searchDestinations, searchHotels, searchPackages } from '@/lib/payload-search-api'
import { getClientIp, isRateLimited } from '@/lib/apiRateLimit'

const PREVIEW_LIMIT = 8
const EXPAND_LIMIT = 20
const MAX_QUERY_LENGTH = 100
const MIN_QUERY_LENGTH = 2

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request)
  if (isRateLimited(`search:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const qRaw = (searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH)
  const type = searchParams.get('type')
  const cursorRaw = searchParams.get('cursor')
  const cursor = cursorRaw !== null ? Math.max(1, parseInt(cursorRaw, 10) || 1) : 1

  if (qRaw.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({
      destinations: { items: [], total: 0 },
      hotels: { items: [], total: 0 },
      packages: { items: [], total: 0 },
    })
  }

  try {
    if (type === 'destinations') return NextResponse.json({ destinations: await searchDestinations(qRaw, EXPAND_LIMIT, cursor) })
    if (type === 'hotels') return NextResponse.json({ hotels: await searchHotels(qRaw, EXPAND_LIMIT, cursor) })
    if (type === 'packages') return NextResponse.json({ packages: await searchPackages(qRaw, EXPAND_LIMIT, cursor) })

    return NextResponse.json(await searchAll(qRaw, PREVIEW_LIMIT))
  } catch (err) {
    console.error('search route error:', err)
    return NextResponse.json({ error: 'Something went wrong, please try again.' }, { status: 500 })
  }
}
