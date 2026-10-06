// Small geometry helpers for the cab page. No imports, so a plain script can
// load this file directly for checks.

// [longitude, latitude], the order MapLibre and Mapbox both use.
export type LngLat = [number, number]

// Decodes an encoded polyline into [lng, lat] pairs. Mapbox Directions with
// geometries=polyline6 uses precision 6. Google style polylines use 5.
export function decodePolyline(encoded: string, precision = 6): LngLat[] {
  const factor = 10 ** precision
  const points: LngLat[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    for (let axis = 0; axis < 2; axis++) {
      let result = 0
      let shift = 0
      let byte: number
      do {
        if (index >= encoded.length) return points
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const delta = result & 1 ? ~(result >> 1) : result >> 1
      if (axis === 0) lat += delta
      else lng += delta
    }
    points.push([lng / factor, lat / factor])
  }
  return points
}

// "74.9 km"
export function formatDistanceKm(meters: number): string {
  const km = meters / 1000
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

// "3 h 37 min" or "45 min"
export function formatDuration(seconds: number): string {
  const totalMin = Math.max(1, Math.round(seconds / 60))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

// Stable cache key for a list of coordinates (5 decimals is about 1 m).
export function coordinatesKey(coords: LngLat[]): string {
  return coords.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';')
}
