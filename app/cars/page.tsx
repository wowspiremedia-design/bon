import type { Metadata } from 'next'
import CabBooking from '@/components/cab/CabBooking'
import { getCabLocations, getCabVehicles } from '@/lib/cab-api'

export const metadata: Metadata = {
  title: 'Book a Cab in North Bengal | Bon Voyagers',
  description:
    'Airport and station transfers, and trips across the hills, Dooars and Siliguri. Choose your route, stops and vehicle, and our team confirms your driver and fare.',
  alternates: { canonical: '/cars' },
}

export default async function CarsPage() {
  const [locations, vehicles] = await Promise.all([getCabLocations(), getCabVehicles()])
  return <CabBooking locations={locations} vehicles={vehicles} />
}
