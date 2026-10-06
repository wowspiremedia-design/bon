import type { CabVehicle } from '@/lib/cab-api'
import { formatDistanceKm, formatDuration } from '@/lib/cab/geo'
import { formatDateShort, formatSlot, nowInIst, parseIstIso, returnDate } from '@/lib/cab/time'
import { waypointLabel, type ViaRow, type Waypoint } from './types'

export interface TripSummaryInput {
  tripType: 'oneway' | 'round'
  days: number
  // "now", or an IST ISO string
  pickupAt: string
  pickup: Waypoint | null
  drop: Waypoint | null
  vias: ViaRow[]
  passengers: number
  luggage: number
  vehicle: CabVehicle | null
  notes: string
  route: { distanceM: number; durationS: number } | null
  // The clock the summary is read against (needed for "Now" return dates).
  now: Date | null
}

export interface SummaryStop {
  role: 'Pickup' | 'Drop' | `Stop ${number}`
  label: string
  custom: boolean
}

export interface TripSummary {
  tripLine: string
  returnLine: string | null
  rideLine: string
  stops: SummaryStop[]
  routeMeta: string | null
  paxLine: string
  vehicleLine: string
  notes: string
}

export function vehicleLabel(v: CabVehicle | null): string {
  return v ? `${v.model}${v.orSimilar ? ' or similar' : ''}` : 'No preference'
}

export function summarizeTrip(i: TripSummaryInput): TripSummary {
  const slot = i.pickupAt === 'now' ? null : parseIstIso(i.pickupAt)
  const pickupDate = slot ? slot.date : i.now ? nowInIst(i.now).date : null
  const stops: SummaryStop[] = []
  if (i.pickup) stops.push({ role: 'Pickup', label: waypointLabel(i.pickup), custom: i.pickup.kind === 'custom' })
  i.vias.forEach((row, n) => {
    if (row.value) stops.push({ role: `Stop ${n + 1}`, label: waypointLabel(row.value), custom: row.value.kind === 'custom' })
  })
  if (i.drop) stops.push({ role: 'Drop', label: waypointLabel(i.drop), custom: i.drop.kind === 'custom' })
  return {
    tripLine: i.tripType === 'round' ? `Round trip, ${i.days} ${i.days === 1 ? 'day' : 'days'}` : 'One way',
    returnLine: i.tripType === 'round' && pickupDate ? `Return by ${formatDateShort(returnDate(pickupDate, i.days))}` : null,
    rideLine: slot ? formatSlot(slot.date, slot.time) : 'Now',
    stops,
    routeMeta: i.route ? `Approx. ${formatDistanceKm(i.route.distanceM)}, ${formatDuration(i.route.durationS)}` : null,
    paxLine: `${i.passengers} ${i.passengers === 1 ? 'passenger' : 'passengers'}, ${i.luggage} ${i.luggage === 1 ? 'bag' : 'bags'}`,
    vehicleLine: vehicleLabel(i.vehicle),
    notes: i.notes.trim(),
  }
}

// One readable line for a WhatsApp message: "A to B via X, Y".
export function routeLine(s: TripSummary): string {
  const first = s.stops[0]?.label ?? ''
  const last = s.stops[s.stops.length - 1]?.label ?? ''
  const mid = s.stops.slice(1, -1).map((x) => x.label)
  return `${first} to ${last}${mid.length ? ` via ${mid.join(', ')}` : ''}`
}

export function tripTextLines(s: TripSummary): string[] {
  return [
    `Route: ${routeLine(s)}`,
    `${s.tripLine}${s.returnLine ? `, ${s.returnLine.toLowerCase()}` : ''}`,
    `Pickup: ${s.rideLine}`,
    `${s.paxLine}. Vehicle: ${s.vehicleLine}`,
  ]
}
