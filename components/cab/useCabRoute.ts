'use client'

import { useEffect, useRef, useState } from 'react'
import { coordinatesKey, decodePolyline, type LngLat } from '@/lib/cab/geo'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const DEBOUNCE_MS = 500
// Mapbox Directions accepts at most 25 coordinates per request.
const MAX_COORDINATES = 25
const CACHE_LIMIT = 30

export interface CabRoute {
  key: string
  coordinates: LngLat[]
  distanceM: number
  durationS: number
}

export type CabRouteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; route: CabRoute }
  | { status: 'error' }

// Requests a driving route for the given coordinates. Waits 500 ms after the
// last change, cancels any earlier request, and caches results by the
// coordinate list so going back to a previous route costs nothing.
export function useCabRoute(coords: LngLat[] | null): CabRouteState {
  const cache = useRef(new Map<string, CabRoute>())
  const [state, setState] = useState<CabRouteState>({ status: 'idle' })
  const usable = coords ? coords.slice(0, MAX_COORDINATES) : null
  const key = usable && usable.length >= 2 ? coordinatesKey(usable) : ''

  useEffect(() => {
    if (!key || !usable) {
      setState({ status: 'idle' })
      return
    }
    if (!MAPBOX_TOKEN) {
      setState({ status: 'error' })
      return
    }
    const cached = cache.current.get(key)
    if (cached) {
      setState({ status: 'ok', route: cached })
      return
    }

    // Show the loading state straight away, even during the 500 ms wait.
    setState({ status: 'loading' })
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const path = usable.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join(';')
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${path}?overview=full&geometries=polyline6&access_token=${MAPBOX_TOKEN}`
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`Directions HTTP ${res.status}`)
        const json = await res.json()
        const r = json && json.code === 'Ok' && json.routes && json.routes[0]
        if (!r || typeof r.geometry !== 'string') throw new Error('Directions returned no route')
        const route: CabRoute = {
          key,
          coordinates: decodePolyline(r.geometry, 6),
          distanceM: r.distance,
          durationS: r.duration,
        }
        if (cache.current.size >= CACHE_LIMIT) cache.current.delete(cache.current.keys().next().value as string)
        cache.current.set(key, route)
        setState({ status: 'ok', route })
      } catch (err) {
        if (controller.signal.aborted) return
        // The message never contains the token, but log only the text anyway.
        console.warn('Route preview unavailable:', err instanceof Error ? err.message : 'unknown error')
        setState({ status: 'error' })
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // usable is derived from key, so key is the only real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
