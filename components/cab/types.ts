import type { CabLocation, CabZone } from '@/lib/cab-api'

// A chosen stop is either a real place from the list (has coordinates) or
// custom text the customer typed (no coordinates, never drawn or routed).
export type Waypoint =
  | { kind: 'place'; place: CabLocation }
  | { kind: 'custom'; text: string }

// A via row keeps a stable uid so React and focus survive reordering.
export interface ViaRow {
  uid: string
  value: Waypoint | null
}

export const ZONE_ORDER: CabZone[] = [
  'gateways',
  'siliguri-belt',
  'darjeeling-hills',
  'kalimpong-hills',
  'singalila',
  'dooars',
  'plains',
]

export const ZONE_LABELS: Record<CabZone, string> = {
  gateways: 'Airports and stations',
  'siliguri-belt': 'Siliguri area',
  'darjeeling-hills': 'Darjeeling hills',
  'kalimpong-hills': 'Kalimpong hills',
  singalila: 'Singalila',
  dooars: 'Dooars',
  plains: 'Plains',
}

export function waypointLabel(w: Waypoint | null): string {
  if (!w) return ''
  return w.kind === 'place' ? w.place.name : w.text
}

export function waypointPlace(w: Waypoint | null): CabLocation | null {
  return w && w.kind === 'place' ? w.place : null
}

export function sameWaypoint(a: Waypoint | null, b: Waypoint | null): boolean {
  if (!a || !b) return false
  if (a.kind === 'place' && b.kind === 'place') return a.place.id === b.place.id
  if (a.kind === 'custom' && b.kind === 'custom') {
    return a.text.trim().toLowerCase() === b.text.trim().toLowerCase()
  }
  return false
}
