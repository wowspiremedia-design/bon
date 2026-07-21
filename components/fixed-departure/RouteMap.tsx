'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { RouteStop } from '@/lib/fixed-departure-api'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const ROUTE_LINE_COLOR = '#FF1493' // deep pink — reliably high-contrast against satellite imagery (land, water, vegetation)
const MARKER_SIZE_PX = 28
const MARKER_DECLUTTER_RADIUS_PX = 28
const MARKER_FAN_RADIUS_PX = 24

interface RouteMapProps {
  routeStops: RouteStop[]
}

// A gentle quadratic-bezier arc between two points, sampled into a polyline.
// Not geographically meaningful — just softens the straight segment visually.
function curvedSegment(p0: [number, number], p1: [number, number], segments = 16): [number, number][] {
  const dx = p1[0] - p0[0]
  const dy = p1[1] - p0[1]
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length === 0) return [p0]

  const midX = (p0[0] + p1[0]) / 2
  const midY = (p0[1] + p1[1]) / 2
  const CURVE_FACTOR = 0.15
  const controlX = midX + (-dy / length) * length * CURVE_FACTOR
  const controlY = midY + (dx / length) * length * CURVE_FACTOR

  const points: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * controlX + t ** 2 * p1[0]
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * controlY + t ** 2 * p1[1]
    points.push([x, y])
  }
  return points
}

function buildCurvedRoute(stops: RouteStop[]): [number, number][] {
  const coords: [number, number][] = []
  for (let i = 0; i < stops.length - 1; i++) {
    const p0: [number, number] = [stops[i].longitude, stops[i].latitude]
    const p1: [number, number] = [stops[i + 1].longitude, stops[i + 1].latitude]
    const segment = curvedSegment(p0, p1)
    // The end of one segment is the start of the next — don't duplicate it.
    coords.push(...(i === 0 ? segment : segment.slice(1)))
  }
  return coords
}

export default function RouteMap({ routeStops }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!MAPBOX_TOKEN) return
    if (routeStops.length === 0) return

    const markers: maplibregl.Marker[] = []

    // A minimal, hand-built style instead of Mapbox's hosted styles/v1 JSON:
    // Mapbox's hosted styles use `mapbox://` shorthand URLs for sources/sprite
    // that MapLibre has no built-in resolver for (confirmed: that protocol
    // string doesn't appear anywhere in the installed maplibre-gl bundle).
    // A raw v4 raster tile template is a real, directly-fetchable URL, so the
    // token can be embedded once here with no transformRequest step needed.
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: 'raster',
            tiles: [`https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=${MAPBOX_TOKEN}`],
            tileSize: 256,
            attribution: '© Mapbox © OpenStreetMap',
          },
        },
        layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
      },
      center: [routeStops[0].longitude, routeStops[0].latitude],
      zoom: 8,
    })
    mapRef.current = map

    // Scroll-wheel zoom stays off so scrolling the page doesn't get trapped
    // inside the map; drag-pan and the +/- controls remain available.
    map.scrollZoom.disable()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: true }), 'top-right')

    map.on('load', () => {
      // Route line, only meaningful with 2+ stops.
      if (routeStops.length >= 2) {
        map.addSource('route-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: buildCurvedRoute(routeStops),
            },
          },
        })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-line',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': ROUTE_LINE_COLOR, 'line-width': 4 },
        })
      }

      // Numbered stop markers, custom DOM element per stop.
      routeStops.forEach((stop, index) => {
        const el = document.createElement('div')
        el.textContent = String(index + 1)
        Object.assign(el.style, {
          width: `${MARKER_SIZE_PX}px`,
          height: `${MARKER_SIZE_PX}px`,
          borderRadius: '50%',
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontWeight: '700',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          cursor: 'pointer',
        })

        const popup = new maplibregl.Popup({ offset: 20 }).setText(stop.name)

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(popup)
          .addTo(map)

        markers.push(marker)
      })

      // Declutter markers that land on top of each other on screen: project
      // every stop's real lng/lat to pixel space, group the ones within
      // MARKER_DECLUTTER_RADIUS_PX of each other (transitively, via a simple
      // BFS over pairwise distance), and fan each such group's members out
      // around their shared point. Singletons are reset to their true
      // position, so stops naturally separate back out once zoomed in
      // enough that they're no longer crowded.
      const declutterMarkers = () => {
        const points = routeStops.map((stop) => map.project([stop.longitude, stop.latitude]))

        const visited = new Set<number>()
        const clusters: number[][] = []

        points.forEach((_, i) => {
          if (visited.has(i)) return
          const cluster = [i]
          visited.add(i)
          let frontier = [i]
          while (frontier.length > 0) {
            const next: number[] = []
            frontier.forEach((fi) => {
              points.forEach((point, j) => {
                if (visited.has(j)) return
                const dx = points[fi].x - point.x
                const dy = points[fi].y - point.y
                if (Math.sqrt(dx * dx + dy * dy) <= MARKER_DECLUTTER_RADIUS_PX) {
                  visited.add(j)
                  next.push(j)
                }
              })
            })
            cluster.push(...next)
            frontier = next
          }
          clusters.push(cluster)
        })

        clusters.forEach((cluster) => {
          if (cluster.length === 1) {
            const idx = cluster[0]
            const stop = routeStops[idx]
            markers[idx].setLngLat([stop.longitude, stop.latitude])
            return
          }

          const cx = cluster.reduce((sum, idx) => sum + points[idx].x, 0) / cluster.length
          const cy = cluster.reduce((sum, idx) => sum + points[idx].y, 0) / cluster.length

          // Scale the fan radius up for larger clusters so adjacent markers'
          // centers stay at least one marker-width apart (a fixed radius is
          // fine for 2-4 stops, but a 6-stop cluster fanned at a small fixed
          // radius still overlaps since more points share the same circle).
          const minSeparationRadius = (MARKER_SIZE_PX / 2) / Math.sin(Math.PI / cluster.length)
          const fanRadius = Math.max(MARKER_FAN_RADIUS_PX, minSeparationRadius)

          cluster.forEach((idx, i) => {
            const angle = (i / cluster.length) * Math.PI * 2 - Math.PI / 2
            const fx = cx + fanRadius * Math.cos(angle)
            const fy = cy + fanRadius * Math.sin(angle)
            markers[idx].setLngLat(map.unproject([fx, fy]))
          })
        })
      }

      map.on('move', declutterMarkers)
      map.on('zoom', declutterMarkers)

      // Fit bounds so every stop is visible on load, no manual zoom/pan needed.
      if (routeStops.length >= 2) {
        const bounds = routeStops.reduce(
          (b, stop) => b.extend([stop.longitude, stop.latitude]),
          new maplibregl.LngLatBounds(
            [routeStops[0].longitude, routeStops[0].latitude],
            [routeStops[0].longitude, routeStops[0].latitude],
          ),
        )
        map.fitBounds(bounds, { padding: 60, duration: 0 })
      } else {
        // A single stop has no meaningful bounds to fit — just center on it.
        map.setCenter([routeStops[0].longitude, routeStops[0].latitude])
        map.setZoom(12)
      }

      // Run once immediately so markers are already decluttered on first
      // paint, rather than waiting for the first move/zoom event.
      declutterMarkers()
    })

    return () => {
      markers.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
    }
  }, [routeStops])

  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#888888',
          fontSize: '14px',
          border: '1px solid #E0EBE1',
          borderRadius: '12px',
        }}
      >
        Map unavailable — missing Mapbox token.
      </div>
    )
  }

  if (routeStops.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">
      <div
        ref={containerRef}
        className="w-full lg:w-[65%]"
        style={{
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #E0EBE1',
        }}
      />

      <ol
        className="w-full lg:w-[35%]"
        style={{
          fontSize: '15px',
          color: '#4A4A4A',
          lineHeight: 1.8,
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {routeStops.map((stop, index) => (
          <li key={index} style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{index + 1}</span>
            <span>{stop.name}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
