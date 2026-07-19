import { DEPARTURE_STATE_VALUES, type DepartureState } from './payload-api'

function normalize(raw: string): string {
  return raw.trim().toLowerCase().replace(/['\s-]+/g, '_')
}

// Known real-world cf-region naming variants that don't normalize directly
// onto one of the 36 DEPARTURE_STATE_VALUES. Keys are the already-normalized
// form (same normalize() function applied), values are the canonical state.
const REGION_ALIASES: Record<string, DepartureState> = {
  orissa: 'odisha',
  pondicherry: 'puducherry',
  nct_of_delhi: 'delhi',
  national_capital_territory_of_delhi: 'delhi',
  'jammu_&_kashmir': 'jammu_and_kashmir',
  'andaman_&_nicobar_islands': 'andaman_and_nicobar_islands',
}

const DEPARTURE_STATE_SET: ReadonlySet<string> = new Set(DEPARTURE_STATE_VALUES)

export function normalizeCfRegion(rawRegion: string | null | undefined): DepartureState | null {
  if (!rawRegion) return null

  const normalized = normalize(rawRegion)

  if (DEPARTURE_STATE_SET.has(normalized)) {
    return normalized as DepartureState
  }

  return REGION_ALIASES[normalized] ?? null
}

export function detectDepartureState(
  rawCountry: string | null | undefined,
  rawRegion: string | null | undefined,
): DepartureState | null {
  if (rawCountry !== 'IN') return null
  if (!rawRegion) return null
  return normalizeCfRegion(rawRegion)
}

// e.g. 'west_bengal' -> 'West Bengal'
export function formatStateLabel(state: DepartureState): string {
  return state
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Tier 1: real cf-ipcity when available. Tier 2: a readable version of the
// resolved state name. Tier 3: 'Kolkata' if detection fully failed.
export function resolveDisplayCity(
  rawCity: string | null | undefined,
  state: DepartureState | null,
): string {
  if (rawCity) return rawCity
  if (state) return formatStateLabel(state)
  return 'Kolkata'
}
