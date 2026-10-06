import { nowInIst, toIstIso } from './time'

// Shape of a cab request, matching the CabEnquiries collection in Payload.
// Custom text places have no coordinates, so those keys are left out for them.

export interface CabPlacePayload {
  name: string
  latitude?: number
  longitude?: number
}

export interface CabRequestPayload {
  customerName: string
  phone: string
  email?: string
  rideType: 'now' | 'later'
  // IST ISO string, for example 2026-10-08T09:30:00+05:30
  pickupAt: string
  tripType: 'one_way' | 'round_trip'
  days?: number
  pickup: CabPlacePayload
  dropoff: CabPlacePayload
  viaStops: CabPlacePayload[]
  passengers: number
  luggage: number
  // The model name, or the text "No preference".
  preferredVehicle: string
  notes?: string
  distanceKm?: number
  durationMinutes?: number
  pageUrl: string
  // Honeypot. Always sent; the server rejects the request when it is filled.
  website: string
}

// Structural copy of the picker's waypoint, so this file needs no component imports.
export type WaypointLike =
  | { kind: 'place'; place: { name: string; latitude: number; longitude: number } }
  | { kind: 'custom'; text: string }

export interface CabBookingState {
  now: Date
  name: string
  phone: string
  email: string
  notes: string
  website: string
  tripType: 'oneway' | 'round'
  days: number
  // "now", or an IST ISO string
  pickupAt: string
  pickup: WaypointLike | null
  drop: WaypointLike | null
  vias: { value: WaypointLike | null }[]
  passengers: number
  luggage: number
  // Model name, or null for no preference
  vehicleName: string | null
  distanceM: number | null
  durationS: number | null
  pageUrl: string
}

export const NAME_MAX = 100
export const NOTES_MAX = 1000
const PLACE_NAME_MAX = 150
const PAGE_URL_MAX = 300

// Strips spaces, hyphens, brackets and dots, keeps a leading +, and needs 7 to
// 15 digits. Returns the cleaned number, or null when it is not a valid phone.
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  const plus = trimmed.startsWith('+') ? '+' : ''
  const rest = plus ? trimmed.slice(1) : trimmed
  const digits = rest.replace(/[\s\-().]/g, '')
  if (!/^\d{7,15}$/.test(digits)) return null
  return plus + digits
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim())
}

export type DetailField = 'name' | 'phone' | 'email' | 'notes'
export type DetailErrors = Partial<Record<DetailField, string>>

export function validateDetails(v: { name: string; phone: string; email: string; notes: string }): DetailErrors {
  const errors: DetailErrors = {}
  const name = v.name.trim()
  if (name === '') errors.name = 'Please enter your name.'
  else if (name.length > NAME_MAX) errors.name = `Name must be ${NAME_MAX} characters or fewer.`
  if (v.phone.trim() === '') errors.phone = 'Please enter your phone number.'
  else if (normalizePhone(v.phone) === null) errors.phone = 'Enter a valid phone number with 7 to 15 digits.'
  if (v.email.trim() !== '' && !isValidEmail(v.email)) errors.email = 'Enter a valid email address, or leave it empty.'
  if (v.notes.length > NOTES_MAX) errors.notes = `Notes must be ${NOTES_MAX} characters or fewer.`
  return errors
}

function toPlace(w: WaypointLike): CabPlacePayload {
  if (w.kind === 'place') {
    return { name: w.place.name.slice(0, PLACE_NAME_MAX), latitude: w.place.latitude, longitude: w.place.longitude }
  }
  return { name: w.text.trim().slice(0, PLACE_NAME_MAX) }
}

// Pure. Expects a state that passed validation (pickup, drop and a valid phone).
export function buildCabPayload(s: CabBookingState): CabRequestPayload {
  if (!s.pickup || !s.drop) throw new Error('buildCabPayload needs a pickup and a drop')
  const phone = normalizePhone(s.phone)
  if (phone === null) throw new Error('buildCabPayload needs a valid phone number')

  const isNow = s.pickupAt === 'now'
  const nowParts = nowInIst(s.now)
  const payload: CabRequestPayload = {
    customerName: s.name.trim(),
    phone,
    rideType: isNow ? 'now' : 'later',
    pickupAt: isNow ? toIstIso(nowParts.date, nowParts.time) : s.pickupAt,
    tripType: s.tripType === 'round' ? 'round_trip' : 'one_way',
    pickup: toPlace(s.pickup),
    dropoff: toPlace(s.drop),
    viaStops: s.vias.flatMap((row) => (row.value ? [toPlace(row.value)] : [])),
    passengers: s.passengers,
    luggage: s.luggage,
    preferredVehicle: s.vehicleName ?? 'No preference',
    pageUrl: s.pageUrl.slice(0, PAGE_URL_MAX),
    website: s.website,
  }
  if (s.tripType === 'round') payload.days = s.days
  if (s.email.trim() !== '') payload.email = s.email.trim()
  if (s.notes.trim() !== '') payload.notes = s.notes.trim().slice(0, NOTES_MAX)
  if (s.distanceM !== null) payload.distanceKm = Math.round(s.distanceM / 100) / 10
  if (s.durationS !== null) payload.durationMinutes = Math.round(s.durationS / 60)
  return payload
}

