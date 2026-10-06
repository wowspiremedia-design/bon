const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

async function payloadFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export type CabZone =
  | 'gateways'
  | 'siliguri-belt'
  | 'darjeeling-hills'
  | 'kalimpong-hills'
  | 'singalila'
  | 'dooars'
  | 'plains'

export type CabPlaceType =
  | 'airport'
  | 'station'
  | 'town'
  | 'village'
  | 'viewpoint'
  | 'attraction'
  | 'border'

export interface CabLocation {
  id: number
  name: string
  slug: string
  // Payload stores aliases as an array of { id, alias } rows.
  aliases: { id?: string; alias: string }[]
  zone: CabZone
  placeType: CabPlaceType
  latitude: number
  longitude: number
  canPickup: boolean
  canDrop: boolean
  canVia: boolean
  isPopular: boolean
  popularOrder: number | null
  roughRoad: boolean
  lastStretchNote: string | null
  verified: boolean
  isActive: boolean
  sortOrder: number
}

export interface CabVehicle {
  id: number
  model: string
  slug: string
  vehicleClass: string
  seats: number
  luggageNote: string | null
  roughRoadCapable: boolean
  orSimilar: boolean
  shortNote: string | null
  isActive: boolean
  sortOrder: number
}

interface CabListResponse<T> {
  docs: T[]
  totalDocs: number
  hasNextPage: boolean
}

export async function getCabLocations(): Promise<CabLocation[]> {
  const path = '/api/cab-locations?limit=200&where[isActive][equals]=true&sort=sortOrder'
  try {
    const res = await payloadFetch<CabListResponse<CabLocation>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return []
    }
    // A place without usable coordinates cannot be placed on the map or routed.
    return res.docs.filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude))
  } catch (err) {
    console.warn('getCabLocations failed, returning an empty list', err)
    return []
  }
}

export async function getCabVehicles(): Promise<CabVehicle[]> {
  const path = '/api/cab-vehicles?limit=50&where[isActive][equals]=true&sort=sortOrder'
  try {
    const res = await payloadFetch<CabListResponse<CabVehicle>>(path)
    if (!Array.isArray(res.docs)) {
      console.warn(`payloadFetch: expected a docs array from ${path}, got a non-array response`, res)
      return []
    }
    return res.docs
  } catch (err) {
    console.warn('getCabVehicles failed, returning an empty list', err)
    return []
  }
}
