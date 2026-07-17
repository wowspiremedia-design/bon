import { NextRequest } from 'next/server'

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 30
const store = new Map<string, number[]>()

export function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const timestamps = store.get(key) || []
  const recent = timestamps.filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS) {
    store.set(key, recent)
    return true
  }
  recent.push(now)
  store.set(key, recent)
  return false
}
