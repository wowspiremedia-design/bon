import type { CabVehicle } from '@/lib/cab-api'

export const MAX_PASSENGERS = 60
export const MAX_LUGGAGE = 60

// Active vehicles that seat the party, in the order Payload returns them
// (sortOrder). When the party is larger than every vehicle, only the largest
// is listed and `needsMore` is true: the team arranges more than one vehicle.
export function vehiclesForParty(vehicles: CabVehicle[], passengers: number): { list: CabVehicle[]; needsMore: boolean } {
  const active = vehicles.filter((v) => v.isActive)
  if (active.length === 0) return { list: [], needsMore: false }
  const fits = active.filter((v) => v.seats >= passengers)
  if (fits.length > 0) return { list: fits, needsMore: false }
  const largest = Math.max(...active.map((v) => v.seats))
  return { list: active.filter((v) => v.seats === largest), needsMore: true }
}
