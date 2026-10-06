import { MAX_VIA_STOPS } from './config'
import { normalizePhone } from './payload'
import { formatDateShort, formatSlot, nowInIst, parseIstIso, returnDate, toIstIso } from './time'

// Server-side logic for POST /api/cab-enquiry. Everything here is exported and
// testable without a running server. The route file stays thin.
//
// Nothing from the request is trusted: every field is re-validated and
// re-cleaned, and every value is HTML-escaped before it reaches an email.

// Keep in sync with TO_ADDRESSES in app/api/enquiry/route.ts.
export const TO_ADDRESSES = 'info@bonvoyagers.co, suhani@bonvoyagers.co, roy@bonvoyagers.co, bonvoyagers10@gmail.com'

export const MAX_BODY_BYTES = 20 * 1024
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
export const RATE_LIMIT_MAX = 5
export const SAVE_TIMEOUT_MS = 8000

const REFERENCE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Rough bounding box of North Bengal and Sikkim. Points outside it are dropped.
const LAT_RANGE: [number, number] = [24.6, 27.3]
const LNG_RANGE: [number, number] = [87.7, 89.9]
const LATER_MAX_PAST_MS = 10 * 60 * 1000
const LATER_MAX_AHEAD_MS = 61 * 24 * 60 * 60 * 1000

// ---------- small helpers (own copies; the older enquiry route keeps its own) ----------

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// A finite number from a number or a numeric string, otherwise null.
export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'string' && value.trim() === '') return null
  if (typeof value !== 'number' && typeof value !== 'string') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// Single-line text: CR and LF become spaces, other control characters go, runs of spaces collapse.
export function cleanLine(value: string): string {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/g, '')
    .replace(/ {2,}/g, ' ')
    .trim()
}

// Multi-line text (notes): line breaks are kept as \n, other control characters go.
export function cleanMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u2028\u2029]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function getClientIp(headers: { get(name: string): string | null }): string {
  const cf = headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export function generateReference(now: Date, rand: () => number = Math.random): string {
  const { date } = nowInIst(now)
  const yymmdd = date.slice(2).replace(/-/g, '')
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += REFERENCE_CHARS[Math.floor(rand() * REFERENCE_CHARS.length)]
  return `BVC-${yymmdd}-${suffix}`
}

// ---------- rate limiter ----------

export interface RateLimiter {
  // Returns true when this request is over the limit. A limited request is not counted.
  isLimited(ip: string, nowMs?: number): boolean
  size(): number
}

export function createRateLimiter(windowMs = RATE_LIMIT_WINDOW_MS, max = RATE_LIMIT_MAX): RateLimiter {
  const store = new Map<string, number[]>()
  let lastSweep = 0
  const sweep = (nowMs: number) => {
    for (const [ip, stamps] of store) {
      const recent = stamps.filter((t) => nowMs - t < windowMs)
      if (recent.length === 0) store.delete(ip)
      else store.set(ip, recent)
    }
    lastSweep = nowMs
  }
  return {
    isLimited(ip, nowMs = Date.now()) {
      if (nowMs - lastSweep > windowMs || store.size > 5000) sweep(nowMs)
      const recent = (store.get(ip) ?? []).filter((t) => nowMs - t < windowMs)
      if (recent.length >= max) {
        store.set(ip, recent)
        return true
      }
      recent.push(nowMs)
      store.set(ip, recent)
      return false
    },
    size: () => store.size,
  }
}

// The route's own store, separate from the older enquiry route.
export const cabRateLimiter = createRateLimiter()

// ---------- validation ----------

export interface ValidPlace {
  name: string
  latitude?: number
  longitude?: number
}

export interface ValidCabEnquiry {
  customerName: string
  phone: string
  email?: string
  rideType: 'now' | 'later'
  pickupAt: string
  tripType: 'one_way' | 'round_trip'
  days?: number
  pickup: ValidPlace
  dropoff: ValidPlace
  viaStops: ValidPlace[]
  passengers: number
  luggage: number
  preferredVehicle: string
  notes?: string
  distanceKm?: number
  durationMinutes?: number
  pageUrl?: string
}

export type ValidationResult = { ok: true; value: ValidCabEnquiry } | { ok: false; error: string }

const fail = (error: string): ValidationResult => ({ ok: false, error })
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function integerIn(raw: unknown, min: number, max: number): number | null {
  const n = toFiniteNumber(raw)
  return n !== null && Number.isInteger(n) && n >= min && n <= max ? n : null
}

function readPlace(raw: unknown, label: string): { place: ValidPlace } | { error: string } {
  if (!isObject(raw)) return { error: `Please choose a ${label}.` }
  if (typeof raw.name !== 'string') return { error: `Please choose a ${label}.` }
  const name = cleanLine(raw.name)
  if (name.length < 1 || name.length > 150) return { error: `The ${label} name must be 1 to 150 characters.` }
  const place: ValidPlace = { name }
  // Coordinates are optional (typed places have none). A half or out-of-range pair is dropped.
  const lat = toFiniteNumber(raw.latitude)
  const lng = toFiniteNumber(raw.longitude)
  if (lat !== null && lng !== null && lat >= LAT_RANGE[0] && lat <= LAT_RANGE[1] && lng >= LNG_RANGE[0] && lng <= LNG_RANGE[1]) {
    place.latitude = lat
    place.longitude = lng
  }
  return { place }
}

export function validateCabEnquiry(body: unknown, now: Date): ValidationResult {
  if (!isObject(body)) return fail('Invalid request.')

  // name
  if (typeof body.customerName !== 'string') return fail('Please enter your name.')
  const customerName = cleanLine(body.customerName)
  if (customerName.length < 1 || customerName.length > 100) return fail('Please enter your name (up to 100 characters).')

  // phone
  if (typeof body.phone !== 'string') return fail('Please enter a valid phone number with 7 to 15 digits.')
  const phone = normalizePhone(body.phone)
  if (phone === null) return fail('Please enter a valid phone number with 7 to 15 digits.')

  // email (optional). A line break in an email is a header injection attempt, so it is rejected, not cleaned.
  let email: string | undefined
  if (body.email !== undefined && body.email !== null && body.email !== '') {
    if (typeof body.email !== 'string' || /[\r\n]/.test(body.email)) return fail('Please enter a valid email address.')
    const e = body.email.trim()
    if (e.length > 254 || !EMAIL_PATTERN.test(e)) return fail('Please enter a valid email address.')
    if (e !== '') email = e
  }

  // ride and trip
  if (body.rideType !== 'now' && body.rideType !== 'later') return fail('Invalid ride type.')
  if (body.tripType !== 'one_way' && body.tripType !== 'round_trip') return fail('Invalid trip type.')
  let days: number | undefined
  if (body.tripType === 'round_trip') {
    const d = integerIn(body.days, 1, 15)
    if (d === null) return fail('Days must be a whole number from 1 to 15.')
    days = d
  }

  // pickup time, always stored as an India time ISO string
  let pickupAt: string
  if (body.rideType === 'now') {
    const p = nowInIst(now)
    pickupAt = toIstIso(p.date, p.time)
  } else {
    if (typeof body.pickupAt !== 'string' || !body.pickupAt.includes('T')) return fail('Please choose a valid pickup time.')
    const ms = Date.parse(body.pickupAt)
    if (!Number.isFinite(ms)) return fail('Please choose a valid pickup time.')
    if (ms < now.getTime() - LATER_MAX_PAST_MS) return fail('That pickup time has already passed.')
    if (ms > now.getTime() + LATER_MAX_AHEAD_MS) return fail('Pickup time is too far ahead. Please choose a date within 60 days.')
    const p = nowInIst(new Date(ms))
    pickupAt = toIstIso(p.date, p.time)
  }

  // places
  const pickup = readPlace(body.pickup, 'pickup place')
  if ('error' in pickup) return fail(pickup.error)
  const dropoff = readPlace(body.dropoff, 'drop place')
  if ('error' in dropoff) return fail(dropoff.error)
  const rawVias = body.viaStops === undefined || body.viaStops === null ? [] : body.viaStops
  if (!Array.isArray(rawVias)) return fail('Invalid stops.')
  if (rawVias.length > MAX_VIA_STOPS) return fail(`You can add up to ${MAX_VIA_STOPS} stops.`)
  const viaStops: ValidPlace[] = []
  for (let i = 0; i < rawVias.length; i++) {
    const via = readPlace(rawVias[i], `stop ${i + 1}`)
    if ('error' in via) return fail(via.error)
    viaStops.push(via.place)
  }

  // party
  const passengers = integerIn(body.passengers, 1, 60)
  if (passengers === null) return fail('Passengers must be a whole number from 1 to 60.')
  const luggage = body.luggage === undefined || body.luggage === null || body.luggage === '' ? 0 : integerIn(body.luggage, 0, 60)
  if (luggage === null) return fail('Luggage must be a whole number from 0 to 60.')

  let preferredVehicle = 'No preference'
  if (body.preferredVehicle !== undefined && body.preferredVehicle !== null && body.preferredVehicle !== '') {
    if (typeof body.preferredVehicle !== 'string') return fail('Invalid vehicle.')
    const v = cleanLine(body.preferredVehicle)
    if (v.length > 80) return fail('The vehicle name is too long.')
    if (v !== '') preferredVehicle = v
  }

  let notes: string | undefined
  if (body.notes !== undefined && body.notes !== null && body.notes !== '') {
    if (typeof body.notes !== 'string') return fail('Invalid notes.')
    const n = cleanMultiline(body.notes)
    if (n.length > 1000) return fail('Notes must be 1000 characters or fewer.')
    if (n !== '') notes = n
  }

  // route preview figures (approximate, optional)
  let distanceKm: number | undefined
  if (body.distanceKm !== undefined && body.distanceKm !== null && body.distanceKm !== '') {
    const d = toFiniteNumber(body.distanceKm)
    if (d === null || d < 0 || d > 3000) return fail('Invalid distance.')
    distanceKm = d
  }
  let durationMinutes: number | undefined
  if (body.durationMinutes !== undefined && body.durationMinutes !== null && body.durationMinutes !== '') {
    const d = toFiniteNumber(body.durationMinutes)
    if (d === null || d < 0 || d > 5000) return fail('Invalid duration.')
    durationMinutes = d
  }

  let pageUrl: string | undefined
  if (body.pageUrl !== undefined && body.pageUrl !== null && body.pageUrl !== '') {
    if (typeof body.pageUrl !== 'string') return fail('Invalid page address.')
    const u = cleanLine(body.pageUrl)
    if (u.length > 300) return fail('Invalid page address.')
    if (u !== '') pageUrl = u
  }

  const value: ValidCabEnquiry = {
    customerName,
    phone,
    rideType: body.rideType,
    pickupAt,
    tripType: body.tripType,
    pickup: pickup.place,
    dropoff: dropoff.place,
    viaStops,
    passengers,
    luggage,
    preferredVehicle,
  }
  if (email) value.email = email
  if (days !== undefined) value.days = days
  if (notes) value.notes = notes
  if (distanceKm !== undefined) value.distanceKm = distanceKm
  if (durationMinutes !== undefined) value.durationMinutes = durationMinutes
  if (pageUrl) value.pageUrl = pageUrl
  return { ok: true, value }
}

// ---------- saving a copy in Payload ----------

// The CabEnquiries body. status and internalNotes are never sent.
export function buildPayloadBody(v: ValidCabEnquiry): Record<string, unknown> {
  const body: Record<string, unknown> = {
    customerName: v.customerName,
    phone: v.phone,
    rideType: v.rideType,
    pickupAt: v.pickupAt,
    tripType: v.tripType,
    pickup: v.pickup,
    dropoff: v.dropoff,
    viaStops: v.viaStops,
    passengers: v.passengers,
    luggage: v.luggage,
    preferredVehicle: v.preferredVehicle,
  }
  if (v.email) body.email = v.email
  if (v.days !== undefined) body.days = v.days
  if (v.notes) body.notes = v.notes
  if (v.distanceKm !== undefined) body.distanceKm = v.distanceKm
  if (v.durationMinutes !== undefined) body.durationMinutes = v.durationMinutes
  if (v.pageUrl) body.pageUrl = v.pageUrl
  return body
}

export interface SaveResult {
  saved: boolean
  reference?: string
}

export async function saveCabEnquiry(
  v: ValidCabEnquiry,
  fetchFn: typeof fetch = fetch,
  warn: (message: string) => void = (m) => console.warn(m),
): Promise<SaveResult> {
  // Read at call time so a changed environment is picked up without a rebuild.
  const key = process.env.CAB_ENQUIRY_WRITE_KEY
  if (!key) {
    warn('[cab-enquiry] save skipped: no write key configured')
    return { saved: false }
  }
  const base = process.env.CAB_PAYLOAD_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS)
  try {
    const res = await fetchFn(`${base}/api/cab-enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cab-write-key': key },
      body: JSON.stringify(buildPayloadBody(v)),
      signal: controller.signal,
      cache: 'no-store',
    })
    if (res.status !== 201) {
      warn(`[cab-enquiry] save failed: HTTP ${res.status}`)
      return { saved: false }
    }
    const data = (await res.json().catch(() => null)) as { doc?: { reference?: unknown } } | null
    const reference = data?.doc?.reference
    return { saved: true, reference: typeof reference === 'string' && reference.startsWith('BVC-') ? reference : undefined }
  } catch (err) {
    // Error class only, never the message: it can contain the request URL.
    warn(`[cab-enquiry] save failed: ${err instanceof Error ? err.name : 'error'}`)
    return { saved: false }
  } finally {
    clearTimeout(timer)
  }
}

// ---------- email ----------

export function waDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`
  return digits
}

export function mapsDirectionsUrl(v: ValidCabEnquiry): string | null {
  const pt = (p: ValidPlace) => (p.latitude !== undefined && p.longitude !== undefined ? `${p.latitude},${p.longitude}` : null)
  const origin = pt(v.pickup)
  const destination = pt(v.dropoff)
  if (!origin || !destination) return null
  const waypoints = v.viaStops.map(pt).filter((x): x is string => x !== null)
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
  if (waypoints.length) url += `&waypoints=${waypoints.join('%7C')}`
  return url
}

export interface CabEmail {
  subject: string
  html: string
  text: string
  replyTo?: string
}

function describePickup(v: ValidCabEnquiry): { ride: string; subjectTag: string; date: string } {
  const slot = parseIstIso(v.pickupAt)
  if (v.rideType === 'now') {
    return {
      ride: slot ? `Now (request received ${formatSlot(slot.date, slot.time)} India time)` : 'Now',
      subjectTag: 'RIDE NOW',
      date: slot ? slot.date : '',
    }
  }
  const when = slot ? formatSlot(slot.date, slot.time) : v.pickupAt
  return { ride: `Later: ${when} India time`, subjectTag: `RIDE LATER ${when}`, date: slot ? slot.date : '' }
}

export function buildCabEmail(v: ValidCabEnquiry, reference: string, saved: boolean): CabEmail {
  const pickupInfo = describePickup(v)
  const subject = cleanLine(`[${pickupInfo.subjectTag}] Cab request ${reference}: ${v.pickup.name} to ${v.dropoff.name}`).slice(0, 200)

  const placeText = (p: ValidPlace) => (p.latitude === undefined ? `${p.name} (typed place, no map point)` : p.name)
  const trip =
    v.tripType === 'round_trip'
      ? `Round trip, ${v.days} ${v.days === 1 ? 'day' : 'days'}${pickupInfo.date ? `, return by ${formatDateShort(returnDate(pickupInfo.date, v.days ?? 1))}` : ''}`
      : 'One way'
  const route: [string, string][] = [['Pickup', placeText(v.pickup)]]
  v.viaStops.forEach((s, i) => route.push([`Stop ${i + 1}`, placeText(s)]))
  route.push(['Drop', placeText(v.dropoff)])
  const approx =
    v.distanceKm !== undefined || v.durationMinutes !== undefined
      ? [
          v.distanceKm !== undefined ? `${v.distanceKm} km` : null,
          v.durationMinutes !== undefined ? `${Math.floor(v.durationMinutes / 60)} h ${Math.round(v.durationMinutes % 60)} min` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : null
  const maps = mapsDirectionsUrl(v)
  const wa = `https://wa.me/${waDigits(v.phone)}`

  // Plain text part
  const textLines = [
    `Cab request ${reference}`,
    '',
    `Ride: ${pickupInfo.ride}`,
    `Trip: ${trip}`,
    '',
    'Route:',
    ...route.map(([k, val]) => `  ${k}: ${val}`),
    approx ? `Approx. ${approx} (from the route preview)` : '',
    '',
    `Passengers: ${v.passengers}`,
    `Luggage (bags): ${v.luggage}`,
    `Vehicle preference: ${v.preferredVehicle}`,
    v.notes ? `Notes: ${v.notes}` : '',
    '',
    `Customer: ${v.customerName}`,
    `Phone: ${v.phone}`,
    `WhatsApp: ${wa}`,
    v.email ? `Email: ${v.email}` : 'Email: not provided',
    v.pageUrl ? `Page: ${v.pageUrl}` : '',
    '',
    `Saved in Payload: ${saved ? 'yes' : 'no'}`,
    maps ? `Directions: ${maps}` : '',
  ].filter((l, i, arr) => !(l === '' && arr[i - 1] === ''))

  // HTML part. Every value goes through escapeHtml.
  const row = (k: string, val: string) =>
    `<tr><td style="width:130px;padding:4px 12px 4px 0;color:#6B6B6B;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0;color:#1A1A1A">${val}</td></tr>`
  const e = escapeHtml
  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1A1A1A;max-width:640px">',
    `<h2 style="margin:0 0 4px;color:#1E6B2E">Cab request ${e(reference)}</h2>`,
    `<p style="margin:0 0 14px;color:#6B6B6B">${e(pickupInfo.ride)}</p>`,
    '<table style="border-collapse:collapse;width:100%">',
    row('Trip', e(trip)),
    ...route.map(([k, val]) => row(k, e(val))),
    approx ? row('Approx.', `${e(approx)} (route preview)`) : '',
    row('Passengers', String(v.passengers)),
    row('Luggage (bags)', String(v.luggage)),
    row('Vehicle', e(v.preferredVehicle)),
    v.notes ? row('Notes', e(v.notes).replace(/\n/g, '<br>')) : '',
    '</table>',
    '<hr style="border:none;border-top:1px solid #E0EBE1;margin:14px 0">',
    '<table style="border-collapse:collapse;width:100%">',
    row('Customer', e(v.customerName)),
    row('Phone', `<a href="tel:${e(v.phone)}">${e(v.phone)}</a>`),
    row('WhatsApp', `<a href="${e(wa)}">${e(wa)}</a>`),
    row('Email', v.email ? `<a href="mailto:${e(v.email)}">${e(v.email)}</a>` : 'Not provided'),
    v.pageUrl ? row('Page', e(v.pageUrl)) : '',
    row('Saved in Payload', saved ? 'yes' : 'no'),
    '</table>',
    maps ? `<p style="margin:14px 0 0"><a href="${e(maps)}">Open directions in Google Maps</a></p>` : '',
    '<p style="margin:14px 0 0;color:#6B6B6B;font-size:12px">Submitted from the Bon Voyagers cab page</p>',
    '</div>',
  ]
    .filter(Boolean)
    .join('')

  return { subject, html, text: textLines.join('\n'), ...(v.email ? { replyTo: v.email } : {}) }
}

export type MailMode = 'smtp' | 'dev-preview' | 'unavailable'

// With full SMTP settings the mail is sent. Without them, development only logs a
// preview; production treats it as an email failure.
export function resolveMailMode(env: Record<string, string | undefined>, nodeEnv: string | undefined): MailMode {
  const complete = Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM)
  if (complete) return 'smtp'
  return nodeEnv === 'production' ? 'unavailable' : 'dev-preview'
}

// Returns true when the email went out (or, in development with no SMTP settings, was previewed in the log).
export async function sendCabEmail(
  email: CabEmail,
  log: (message: string) => void = (m) => console.log(m),
): Promise<boolean> {
  const env = process.env
  const mode = resolveMailMode(env, env.NODE_ENV)
  if (mode === 'unavailable') return false
  try {
    const nodemailer = (await import('nodemailer')).default
    const message = {
      from: `"Bon Voyagers Enquiry" <${env.SMTP_FROM ?? 'enquiry@localhost'}>`,
      to: TO_ADDRESSES,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(email.replyTo ? { replyTo: email.replyTo } : {}),
    }
    if (mode === 'dev-preview') {
      const transporter = nodemailer.createTransport({ jsonTransport: true })
      await transporter.sendMail(message)
      log(`[cab-enquiry] EMAIL PREVIEW (not sent) subject=${email.subject}`)
      log(`[cab-enquiry] EMAIL PREVIEW reply-to=${email.replyTo ?? 'none'}`)
      log(`[cab-enquiry] EMAIL PREVIEW text:\n${email.text}`)
      return true
    }
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: env.SMTP_SECURE === 'true',
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10000,
      socketTimeout: 15000,
    })
    await transporter.sendMail(message)
    return true
  } catch (err) {
    console.warn(`[cab-enquiry] email failed: ${err instanceof Error ? err.name : 'error'}`)
    return false
  }
}

// ---------- the whole request ----------

export interface Deps {
  now: () => Date
  save: (v: ValidCabEnquiry) => Promise<SaveResult>
  mail: (email: CabEmail) => Promise<boolean>
  log: (message: string) => void
  error: (message: string) => void
}

export interface HandlerResult {
  status: number
  json: { success: boolean; reference?: string; error?: string }
}

export const GENERIC_FAILURE = 'We could not send your request. Please try again, or message us on WhatsApp.'

// Honeypot, validation, save, email and the outcome rule. Returns what the route should answer.
export async function handleCabEnquiry(body: unknown, ip: string, deps: Deps): Promise<HandlerResult> {
  const now = deps.now()

  // A filled honeypot gets the success shape and nothing else happens.
  if (isObject(body) && typeof body.website === 'string' && body.website.trim() !== '') {
    deps.log(`[cab-enquiry] honeypot ip=${ip}`)
    return { status: 200, json: { success: true, reference: generateReference(now) } }
  }

  const checked = validateCabEnquiry(body, now)
  if (!checked.ok) return { status: 400, json: { success: false, error: checked.error } }
  const v = checked.value

  const save = await deps.save(v)
  const reference = save.saved && save.reference ? save.reference : generateReference(now)
  const email = buildCabEmail(v, reference, save.saved)
  const emailed = await deps.mail(email)

  deps.log(`[cab-enquiry] ref=${reference} saved=${save.saved ? 'yes' : 'no'} emailed=${emailed ? 'yes' : 'no'} ip=${ip}`)

  if (!save.saved && !emailed) {
    return { status: 500, json: { success: false, error: GENERIC_FAILURE } }
  }
  if (save.saved && !emailed) deps.error(`CAB EMAIL FAILED, saved only: ${reference}`)
  if (!save.saved && emailed) deps.log(`[cab-enquiry] WARNING copy not saved, email sent: ${reference}`)
  return { status: 200, json: { success: true, reference } }
}
