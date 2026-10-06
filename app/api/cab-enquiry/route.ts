import { NextRequest, NextResponse } from 'next/server'
import {
  GENERIC_FAILURE,
  MAX_BODY_BYTES,
  cabRateLimiter,
  getClientIp,
  handleCabEnquiry,
  saveCabEnquiry,
  sendCabEmail,
} from '@/lib/cab/enquiry-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const json = (status: number, body: { success: boolean; reference?: string; error?: string }) => NextResponse.json(body, { status })

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)

  try {
    // Size first, so an oversized body is never parsed.
    const declared = Number(request.headers.get('content-length'))
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return json(413, { success: false, error: 'That request is too large.' })
    }

    if (cabRateLimiter.isLimited(ip)) {
      console.log(`[cab-enquiry] rate limit hit ip=${ip}`)
      return json(429, { success: false, error: 'Too many requests. Please wait a few minutes or message us on WhatsApp.' })
    }

    const raw = await request.text()
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
      return json(413, { success: false, error: 'That request is too large.' })
    }

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return json(400, { success: false, error: 'Invalid request.' })
    }

    const result = await handleCabEnquiry(body, ip, {
      now: () => new Date(),
      save: (v) => saveCabEnquiry(v),
      mail: (email) => sendCabEmail(email),
      log: (m) => console.log(m),
      error: (m) => console.error(m),
    })
    return json(result.status, result.json)
  } catch (err) {
    // Never leak internals to the browser. The class name is enough for the log.
    console.error(`[cab-enquiry] unexpected failure ip=${ip}`, err instanceof Error ? err.name : 'error')
    return json(500, { success: false, error: GENERIC_FAILURE })
  }
}

// Only POST is accepted.
export function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405, headers: { Allow: 'POST' } })
}
