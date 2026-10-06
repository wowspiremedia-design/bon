'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LngLat } from '@/lib/cab/geo'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const BRAND_GREEN = '#1E6B2E'
const DEFAULT_CENTER: LngLat = [88.4, 26.9]
const DEFAULT_ZOOM = 8
const DRAW_MS = 900

export interface MapPoint {
  lng: number
  lat: number
}
export interface MapViaPoint extends MapPoint {
  n: number
}
export interface MapRoute {
  key: string
  coordinates: LngLat[]
}
export interface MapPadding {
  top: number
  right: number
  bottom: number
  left: number
}

interface Props {
  pickup: MapPoint | null
  drop: MapPoint | null
  vias: MapViaPoint[]
  route: MapRoute | null
  // Draw a thin dotted straight line through the points (route preview failed).
  showFallbackLine: boolean
  // Null until the layout is known; no fit runs before then.
  padding: MapPadding | null
  isMobile: boolean
  // A soft pulse around the pickup marker while a request is being sent. The
  // animation itself is CSS and is switched off under reduced motion.
  pulse?: boolean
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const emptyCollection: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
const lineFeature = (coordinates: LngLat[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: coordinates.length >= 2 ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }] : [],
})

// Gradient on line-progress: green up to `progress`, transparent after it.
// MapLibre 5.24 has no line-trim-offset, so this is how the draw is animated.
const gradient = (progress: number) =>
  ['step', ['line-progress'], BRAND_GREEN, progress, 'rgba(30,107,46,0)'] as unknown as maplibregl.ExpressionSpecification

function markerEl(kind: 'pickup' | 'drop' | 'via', n?: number): HTMLDivElement {
  const el = document.createElement('div')
  if (kind === 'pickup') {
    Object.assign(el.style, { width: '20px', height: '20px', borderRadius: '50%', background: BRAND_GREEN, border: '3px solid #FFFFFF', boxShadow: '0 1px 5px rgba(0,0,0,0.45)' })
    el.setAttribute('aria-label', 'Pickup')
  } else if (kind === 'drop') {
    Object.assign(el.style, { width: '18px', height: '18px', background: '#1A1A1A', border: '3px solid #FFFFFF', boxShadow: '0 1px 5px rgba(0,0,0,0.45)' })
    el.setAttribute('aria-label', 'Drop')
  } else {
    el.textContent = String(n)
    Object.assign(el.style, {
      width: '26px', height: '26px', borderRadius: '50%', background: '#FFFFFF', border: `2px solid ${BRAND_GREEN}`,
      color: BRAND_GREEN, fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 5px rgba(0,0,0,0.35)',
    })
    el.setAttribute('aria-label', `Stop ${n}`)
  }
  return el
}

export default function CabMap({ pickup, drop, vias, route, showFallbackLine, padding, isMobile, pulse = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const attributionRef = useRef<maplibregl.AttributionControl | null>(null)
  const frameRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)

  // Create the map once.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          base: {
            type: 'raster',
            tiles: [`https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/512/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`],
            tileSize: 512,
            attribution: '© Mapbox © OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'base', type: 'raster', source: 'base' }],
      },
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      // Full-screen app map: plain drag and wheel gestures, no two-finger rule.
      cooperativeGestures: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right')

    // style.load does not wait for a rendered frame, unlike load.
    map.once('style.load', () => {
      map.addSource('fallback', { type: 'geojson', data: emptyCollection })
      map.addLayer({
        id: 'fallback-line',
        type: 'line',
        source: 'fallback',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#5C7A64', 'line-width': 3, 'line-dasharray': [0.1, 2] },
      })
      map.addSource('route', { type: 'geojson', data: emptyCollection, lineMetrics: true })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 5, 'line-gradient': gradient(1.01) },
      })
      setReady(true)
    })

    const observer = new ResizeObserver(() => map.resize())
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      attributionRef.current = null
      setReady(false)
    }
  }, [])

  // Attribution is always visible (not collapsed). It sits bottom right next
  // to the desktop panel, and top left on mobile where the sheet covers the
  // bottom of the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    if (attributionRef.current) map.removeControl(attributionRef.current)
    const control = new maplibregl.AttributionControl({ compact: false })
    map.addControl(control, isMobile ? 'top-left' : 'bottom-right')
    attributionRef.current = control
  }, [ready, isMobile])

  // Markers.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
    const add = (el: HTMLElement, p: MapPoint) =>
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map))
    if (pickup) add(markerEl('pickup'), pickup)
    vias.forEach((v) => add(markerEl('via', v.n), v))
    if (drop) add(markerEl('drop'), drop)
  }, [ready, pickup, drop, vias])

  // The pickup marker is always the first one added.
  useEffect(() => {
    const el = markersRef.current[0]?.getElement()
    if (!el || !pickup) return
    el.classList.toggle('cab-pulse', pulse)
  }, [ready, pulse, pickup, drop, vias])

  // Route line, with a one-off draw animation per new route.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    const source = map.getSource('route') as maplibregl.GeoJSONSource | undefined
    if (!source) return
    if (!route) {
      source.setData(emptyCollection)
      return
    }
    source.setData(lineFeature(route.coordinates))
    if (reducedMotion()) {
      map.setPaintProperty('route-line', 'line-gradient', gradient(1.01))
      return
    }
    const start = performance.now()
    map.setPaintProperty('route-line', 'line-gradient', gradient(0.0001))
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DRAW_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      map.setPaintProperty('route-line', 'line-gradient', gradient(t >= 1 ? 1.01 : Math.max(eased, 0.0001)))
      frameRef.current = t < 1 ? requestAnimationFrame(tick) : null
    }
    frameRef.current = requestAnimationFrame(tick)
  }, [ready, route])

  // Dotted straight line when the route preview failed.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const source = map.getSource('fallback') as maplibregl.GeoJSONSource | undefined
    if (!source) return
    if (!showFallbackLine) {
      source.setData(emptyCollection)
      return
    }
    const pts: LngLat[] = []
    if (pickup) pts.push([pickup.lng, pickup.lat])
    vias.forEach((v) => pts.push([v.lng, v.lat]))
    if (drop) pts.push([drop.lng, drop.lat])
    source.setData(lineFeature(pts))
  }, [ready, showFallbackLine, pickup, drop, vias])

  // Fit the view to the markers or the route, leaving room for the panel.
  const fitKey = route
    ? route.key
    : [pickup && `${pickup.lng},${pickup.lat}`, ...vias.map((v) => `${v.lng},${v.lat}`), drop && `${drop.lng},${drop.lat}`]
        .filter(Boolean)
        .join(';')
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || !padding) return
    const duration = reducedMotion() ? 0 : 600
    const points: LngLat[] = route
      ? route.coordinates
      : [
          ...(pickup ? [[pickup.lng, pickup.lat] as LngLat] : []),
          ...vias.map((v) => [v.lng, v.lat] as LngLat),
          ...(drop ? [[drop.lng, drop.lat] as LngLat] : []),
        ]
    try {
      // Every case goes through fitBounds. easeTo with a padding option stores
      // that padding on the map for good, and the next fitBounds then adds its
      // own on top, which overflows a small phone canvas. A single point or the
      // empty state uses a small box around it instead.
      let bounds: maplibregl.LngLatBounds
      if (points.length === 0) {
        bounds = new maplibregl.LngLatBounds([DEFAULT_CENTER[0] - 0.55, DEFAULT_CENTER[1] - 0.4], [DEFAULT_CENTER[0] + 0.55, DEFAULT_CENTER[1] + 0.4])
      } else if (points.length === 1) {
        bounds = new maplibregl.LngLatBounds([points[0][0] - 0.04, points[0][1] - 0.04], [points[0][0] + 0.04, points[0][1] + 0.04])
      } else {
        bounds = points.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(points[0], points[0]))
      }
      map.fitBounds(bounds, { padding, maxZoom: 13, duration })
    } catch (err) {
      // The padding can be larger than a very small map; skip the fit then.
      console.warn('Map fit skipped:', err instanceof Error ? err.message : 'unknown error')
    }
    // fitKey and the padding numbers describe every input that matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey, padding?.top, padding?.right, padding?.bottom, padding?.left])

  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: isMobile ? 0 : (padding?.left ?? 440),
          paddingBottom: isMobile ? (padding?.bottom ?? 0) : 0,
          background: '#EEF3EF',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 260, color: '#4A4A4A', padding: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>Map unavailable</p>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: '#6B6B6B' }}>
            You can still choose your pickup, stops and drop.
          </p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} role="application" aria-label="Map of your route" />
}
