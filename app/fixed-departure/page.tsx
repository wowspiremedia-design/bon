import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { detectDepartureState, stateToSlug } from '@/lib/geoState'
import type { DepartureState } from '@/lib/payload-api'

// Same fallback used elsewhere in this project when geo-detection can't
// resolve a real Indian state (visitor outside India — e.g. Nepal, Europe —
// or the Cloudflare header is missing): West Bengal/Kolkata is this
// business's home base, matching resolveDisplayCity's own 'Kolkata' default.
const DEFAULT_STATE: DepartureState = 'west_bengal'

export default async function FixedDepartureIndexPage() {
  const headersList = await headers()
  const geoCountry = headersList.get('cf-ipcountry')
  const geoRegion = headersList.get('cf-region')
  const departureState = detectDepartureState(geoCountry, geoRegion) ?? DEFAULT_STATE

  redirect(`/fixed-departure/${stateToSlug(departureState)}`)
}
