import type { CabRequestPayload } from './payload'

// The real sender. POSTs the request to /api/cab-enquiry, which saves a copy in
// Payload and emails the team. The browser never talks to Payload.

export type SubmitResult = { ok: true; reference: string } | { ok: false; error: string }

const TIMEOUT_MS = 25000
const SIM_DELAY_MS = 1500

const GENERIC_ERROR = 'Something went wrong on our side.'
const RATE_LIMIT_ERROR = 'Too many requests. Please wait a few minutes or message us on WhatsApp.'

export async function submitCabRequest(payload: CabRequestPayload): Promise<SubmitResult> {
  // Test hook, never active in a production build: ?cabsim=fail shows the error screen.
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    if (new URLSearchParams(window.location.search).get('cabsim') === 'fail') {
      await new Promise((resolve) => setTimeout(resolve, SIM_DELAY_MS))
      return { ok: false, error: 'Simulated failure (cabsim=fail)' }
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch('/api/cab-enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => null)) as { success?: unknown; reference?: unknown; error?: unknown } | null

    if (res.status === 200 && data && data.success === true && typeof data.reference === 'string' && data.reference.startsWith('BVC-')) {
      return { ok: true, reference: data.reference }
    }
    if (res.status === 429) return { ok: false, error: RATE_LIMIT_ERROR }
    if (res.status === 400 && data && typeof data.error === 'string' && data.error !== '') return { ok: false, error: data.error }
    return { ok: false, error: GENERIC_ERROR }
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'AbortError'
    return { ok: false, error: timedOut ? 'The request took too long.' : GENERIC_ERROR }
  } finally {
    clearTimeout(timer)
  }
}
