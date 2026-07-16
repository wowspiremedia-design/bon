import { NextRequest, NextResponse } from 'next/server'
import { getPackageBySlug } from '@/lib/payload-api'
import { KAILASH_BROCHURE_SLUGS } from '@/lib/kailashBrochureSlugs'

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 10
const rateLimitStore = new Map<string, number[]>()

function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitStore.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent)
    return true
  }
  recent.push(now)
  rateLimitStore.set(ip, recent)
  return false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const clientIp = getClientIp(request)

  if (isRateLimited(clientIp)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { slug } = await params

  if (!KAILASH_BROCHURE_SLUGS.includes(slug)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const pkg = await getPackageBySlug(slug)
  if (!pkg || !pkg.brochure) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 })
  }

  const pdfRes = await fetch(pkg.brochure.url)
  if (!pdfRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch brochure.' }, { status: 502 })
  }

  const pdfBuffer = await pdfRes.arrayBuffer()
  const filename = pkg.brochure.url.split('/').pop() || `${slug}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.byteLength),
    },
  })
}
