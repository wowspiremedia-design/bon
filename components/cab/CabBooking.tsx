'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import type { CabLocation, CabVehicle } from '@/lib/cab-api'
import { RIDE_LATER_MIN_NOTICE_HOURS } from '@/lib/cab/config'
import { formatDistanceKm, formatDuration, type LngLat } from '@/lib/cab/geo'
import { isSlotAllowed, parseIstIso } from '@/lib/cab/time'
import { buildCabPayload, normalizePhone, type DetailField } from '@/lib/cab/payload'
import { remainingProgressMs } from '@/lib/cab/progress'
import { submitCabRequest } from '@/lib/cab/submit'
import { trackCabLead } from '@/lib/cab/meta'
import DetailsStep from './DetailsStep'
import { ErrorView, SendingView, SuccessView } from './BookingStatus'
import type { EditTarget } from './ReviewSummary'
import { summarizeTrip } from './tripSummary'
import RouteStep from './RouteStep'
import TripOptions, { type TripType } from './TripOptions'
import type { PickupAt } from './RideTimePicker'
import VehicleStep from './VehicleStep'
import { vehiclesForParty } from './vehicles'
import { useBottomSheet } from './useBottomSheet'
import { useCabRoute } from './useCabRoute'
import { sameWaypoint, waypointLabel, waypointPlace, type ViaRow, type Waypoint } from './types'
import type { MapPadding, MapPoint, MapViaPoint } from './CabMap'

// maplibre-gl touches window, so the map is loaded on the client only.
const CabMap = dynamic(() => import('./CabMap'), {
  ssr: false,
  loading: () => <div style={{ position: 'absolute', inset: 0, background: '#EEF3EF' }} aria-hidden="true" />,
})

interface Props {
  locations: CabLocation[]
  vehicles: CabVehicle[]
}

type Step = 1 | 2 | 3

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: 'Route' },
  { n: 2, label: 'Passengers and vehicle' },
  { n: 3, label: 'Your details' },
]

// The number as it will be sent, falling back to what was typed.
const phoneForDisplay = (p: string) => normalizePhone(p) ?? p.trim()

const placePoint = (w: Waypoint | null): MapPoint | null => {
  const p = waypointPlace(w)
  return p ? { lng: p.longitude, lat: p.latitude } : null
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

const headingStyle = (isMobile: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-playfair)',
  fontSize: isMobile ? 22 : 26,
  fontWeight: 700,
  color: '#1A1A1A',
  lineHeight: 1.2,
  margin: isMobile ? '4px 0 6px' : '8px 0 8px',
  outline: 'none',
})

export default function CabBooking({ locations, vehicles }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const uidCounter = useRef(0)
  const newUid = () => `v${++uidCounter.current}`

  const [step, setStep] = useState<Step>(1)
  const [pickup, setPickup] = useState<Waypoint | null>(null)
  const [drop, setDrop] = useState<Waypoint | null>(null)
  const [vias, setVias] = useState<ViaRow[]>([])
  const [tripType, setTripType] = useState<TripType>('oneway')
  const [days, setDays] = useState(1)
  const [pickupAt, setPickupAt] = useState<PickupAt>('now')
  const [passengers, setPassengers] = useState(2)
  const [luggage, setLuggage] = useState(0)
  // null means "No preference".
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [vehicleReset, setVehicleReset] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [layoutKnown, setLayoutKnown] = useState(false)
  const [height, setHeight] = useState<number | null>(null)
  // The current time, read on the client only (null during the server render).
  const [now, setNow] = useState<Date | null>(null)
  // The sheet height transition only runs once the pane height is measured, so it
  // does not animate from the default to the measured size on first load.
  const [animate, setAnimate] = useState(false)

  // Step 3: details, and the sending / success / error state machine.
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [trap, setTrap] = useState('') // spam trap, always empty for people
  const [phase, setPhase] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [reference, setReference] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null)
  // A synchronous lock, so a double click or double tap sends exactly once.
  const submittingRef = useRef(false)
  const mountedRef = useRef(true)
  // Where focus should land after a step change (used by the Edit buttons).
  const pendingFocus = useRef<string | null>(null)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (height === null || animate) return
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [height, animate])

  const sheet = useBottomSheet({ paneHeight: height ?? 600, enabled: isMobile, panelRef })

  // Fill the viewport below the header and announcement bar, so the page
  // itself does not need to scroll.
  useEffect(() => {
    const measure = () => {
      const el = sectionRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      setHeight(Math.max(480, Math.round(window.innerHeight - top)))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    setLayoutKnown(true)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // A ticking clock keeps the time messages right while the page stays open.
  // State only changes when the minute changes.
  const refreshNow = useCallback(() => {
    const next = new Date()
    setNow((prev) => (prev && Math.floor(prev.getTime() / 60000) === Math.floor(next.getTime() / 60000) ? prev : next))
  }, [])
  useEffect(() => {
    refreshNow()
    const id = window.setInterval(refreshNow, 30000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshNow()
    }
    window.addEventListener('focus', refreshNow)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', refreshNow)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refreshNow])

  // On each step change, scroll the panel to the top and put focus on the step
  // heading. Skipped on the first render.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    bodyRef.current?.scrollTo({ top: 0 })
    const selector = pendingFocus.current
    pendingFocus.current = null
    const target = selector ? document.querySelector<HTMLElement>(selector) : null
    if (target) {
      target.focus({ preventScroll: true })
      target.scrollIntoView({ block: 'nearest' })
    } else {
      document.getElementById('cab-step-heading')?.focus({ preventScroll: true })
    }
  }, [step, phase])

  const samePlace = sameWaypoint(pickup, drop)
  // Memoized so the map only redraws markers and the route when they change.
  const pickupPt = useMemo(() => placePoint(pickup), [pickup])
  const dropPt = useMemo(() => placePoint(drop), [drop])
  const viaPoints: MapViaPoint[] = useMemo(
    () =>
      vias.flatMap((row, i) => {
        const pt = placePoint(row.value)
        return pt ? [{ ...pt, n: i + 1 }] : []
      }),
    [vias],
  )

  // Only real places go to Directions; custom text is skipped.
  const routeCoords: LngLat[] | null = useMemo(() => {
    if (!pickupPt || !dropPt || samePlace) return null
    return [[pickupPt.lng, pickupPt.lat], ...viaPoints.map((v): LngLat => [v.lng, v.lat]), [dropPt.lng, dropPt.lat]]
  }, [pickupPt, dropPt, viaPoints, samePlace])

  const routeState = useCabRoute(routeCoords)
  const route = routeState.status === 'ok' ? routeState.route : null
  const hasCustom = [pickup, drop, ...vias.map((v) => v.value)].some((w) => w?.kind === 'custom')
  const roughRoute = [pickup, drop, ...vias.map((v) => v.value)].some((w) => waypointPlace(w)?.roughRoad === true)

  // Room the map keeps free for the panel: 440px on the left on desktop, and
  // the current sheet height at the bottom on mobile. Each has a small extra
  // margin so a marker never sits half hidden under the panel edge. Clamped so
  // the padding never exceeds the canvas, even with the sheet fully open. Null
  // until the layout (desktop or mobile) is known, so no fit runs with the
  // wrong one.
  const padding: MapPadding | null = useMemo(() => {
    if (!layoutKnown) return null
    if (!isMobile) return { top: 48, right: 48, bottom: 48, left: 440 + 28 }
    const h = height ?? 600
    const bottom = Math.min(sheet.heightPx + 36, h - 56)
    const top = Math.max(16, Math.min(72, h - bottom - 40))
    return { top, right: 28, left: 28, bottom }
  }, [layoutKnown, isMobile, height, sheet.heightPx])

  // Step 1 rules. The first unmet one is shown as the reason Continue is off.
  const slot = pickupAt === 'now' ? null : parseIstIso(pickupAt)
  const timeValid = pickupAt === 'now' || (slot !== null && now !== null && isSlotAllowed(now, slot.date, slot.time))
  const step1Reason = !pickup
    ? 'Choose a pickup place.'
    : !drop
      ? 'Choose a drop place.'
      : samePlace
        ? 'Pickup and drop must be different places.'
        : !timeValid
          ? `Choose a pickup time at least ${RIDE_LATER_MIN_NOTICE_HOURS} hours from now.`
          : null

  function changePassengers(n: number) {
    setPassengers(n)
    setVehicleReset(null)
    if (vehicleId === null) return
    // Nothing else is touched. Only a vehicle that no longer fits is dropped.
    if (!vehiclesForParty(vehicles, n).list.some((v) => v.id === vehicleId)) {
      const old = vehicles.find((v) => v.id === vehicleId)
      setVehicleId(null)
      setVehicleReset(`${old ? old.model : 'Your vehicle'} does not seat ${n} passengers, so we set No preference.`)
    }
  }

  function chooseVehicle(id: number | null) {
    setVehicleId(id)
    setVehicleReset(null)
  }

  const summaryLine = pickup && drop ? `${waypointLabel(pickup)} to ${waypointLabel(drop)}` : 'Plan your trip'
  const summaryMeta = route ? `Approx. ${formatDistanceKm(route.distanceM)}, ${formatDuration(route.durationS)}` : null
  const atPeek = isMobile && sheet.snap === 'peek'

  // The dots carry aria-current on the current step. Rendered in two places (desktop row and
  // phone top row); CSS shows one, and display none removes the other from the accessibility tree.
  const progressDots = (
    <ol aria-label="Progress" style={{ display: 'flex', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
      {STEPS.map((s) => (
        <li key={s.n} aria-current={s.n === step ? 'step' : undefined} style={{ display: 'flex' }}>
          <span
            aria-hidden="true"
            className="cab-dot"
            style={{ display: 'block', height: 8, width: s.n === step ? 22 : 8, borderRadius: 4, background: s.n <= step ? '#1E6B2E' : '#C8D9CC' }}
          />
          <span style={srOnly}>{`Step ${s.n} of 3: ${s.label}`}</span>
        </li>
      ))}
    </ol>
  )

  const chosenVehicle = vehicleId === null ? null : (vehicles.find((v) => v.id === vehicleId) ?? null)
  const summary = summarizeTrip({
    tripType,
    days,
    pickupAt,
    pickup,
    drop,
    vias,
    passengers,
    luggage,
    vehicle: chosenVehicle,
    notes,
    route: route ? { distanceM: route.distanceM, durationS: route.durationS } : null,
    now: submittedAt ?? now,
  })

  // The Edit buttons on the review card: go to the right step, keep all state,
  // and put focus on that step's first control.
  function goEdit(target: EditTarget) {
    const spec = {
      trip: { step: 1 as Step, selector: 'input[name="cab-trip-type"]:checked' },
      route: { step: 1 as Step, selector: '#cab-pickup' },
      vehicle: { step: 2 as Step, selector: 'input[inputmode="numeric"]' },
      notes: { step: 3 as Step, selector: '#cab-notes' },
    }[target]
    if (spec.step === step) {
      const el = document.querySelector<HTMLElement>(spec.selector)
      el?.focus()
      el?.scrollIntoView({ block: 'nearest' })
      return
    }
    pendingFocus.current = spec.selector
    setStep(spec.step)
  }

  function setDetail(field: DetailField, value: string) {
    if (field === 'name') setName(value)
    else if (field === 'phone') setPhone(value)
    else if (field === 'email') setEmail(value)
    else setNotes(value)
  }

  async function handleBook() {
    if (submittingRef.current) return
    submittingRef.current = true
    const startedAt = Date.now()
    const at = new Date()
    setSubmittedAt(at)
    setPhase('submitting')
    let result: Awaited<ReturnType<typeof submitCabRequest>>
    let payload: ReturnType<typeof buildCabPayload> | null = null
    try {
      payload = buildCabPayload({
        now: at,
        name,
        phone,
        email,
        notes,
        trap,
        tripType,
        days,
        pickupAt,
        pickup,
        drop,
        vias,
        passengers,
        luggage,
        vehicleName: chosenVehicle ? chosenVehicle.model : null,
        distanceM: route ? route.distanceM : null,
        durationS: route ? route.durationS : null,
        pageUrl: window.location.href,
      })
      result = await submitCabRequest(payload)
    } catch {
      result = { ok: false, error: 'Something went wrong while preparing your request' }
    }
    if (!mountedRef.current) return
    if (!result.ok) {
      // A failure shows straight away; only a success waits out the minimum time.
      submittingRef.current = false
      setSubmitError(result.error)
      setPhase('error')
      return
    }
    // The Meta event fires once, right after the sender confirms, and never on failure.
    if (payload) trackCabLead(payload)
    const wait = remainingProgressMs(startedAt, Date.now())
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    if (!mountedRef.current) return
    submittingRef.current = false
    setReference(result.reference)
    setPhase('success')
  }

  function bookAnother() {
    setPickup(null)
    setDrop(null)
    setVias([])
    setTripType('oneway')
    setDays(1)
    setPickupAt('now')
    setPassengers(2)
    setLuggage(0)
    setVehicleId(null)
    setVehicleReset(null)
    setName('')
    setPhone('')
    setEmail('')
    setNotes('')
    setTrap('')
    setReference(null)
    setSubmitError('')
    setSubmittedAt(null)
    pendingFocus.current = null
    setPhase('idle')
    setStep(1)
  }

  const showBar = phase === 'idle'

  const buttonBase: React.CSSProperties = {
    minHeight: 48,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    padding: '0 20px',
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Cab route planner"
      style={{
        position: 'relative',
        height: height ?? 'calc(100dvh - 150px)',
        minHeight: 480,
        overflow: 'hidden',
        background: '#EEF3EF',
      }}
    >
      <style>{`
        .cab-focus:focus-visible { outline: 3px solid #1E6B2E; outline-offset: 2px; }
        .cab-seg:has(input:focus-visible), .cab-card:has(input:focus-visible) { outline: 3px solid #1E6B2E; outline-offset: 2px; }
        .cab-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cab-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .cab-shimmer {
          background: linear-gradient(90deg, #EEF3EF 25%, #F8FBF8 50%, #EEF3EF 75%);
          background-size: 200% 100%;
          animation: cab-shimmer 1.2s ease-in-out infinite;
          border-radius: 10px;
        }
        @keyframes cab-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .cab-panel {
          position: absolute;
          z-index: 5;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }
        .cab-panel-main { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .cab-panel-body { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 20px 24px; }
        .cab-handle, .cab-topbar, .cab-bar-title { display: none; }
        .cab-dot { transition: width 0.25s ease, background-color 0.25s ease; }
        .cab-pulse { animation: cab-pulse 1.8s ease-out infinite; }
        @keyframes cab-pulse { 0% { box-shadow: 0 0 0 0 rgba(30, 107, 46, 0.5); } 100% { box-shadow: 0 0 0 26px rgba(30, 107, 46, 0); } }
        .cab-working-dot { animation: cab-working 1.2s ease-in-out infinite; }
        @keyframes cab-working { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
        @media (min-width: 769px) {
          .cab-panel { left: 16px; top: 16px; bottom: 16px; width: 420px; border-radius: 16px; }
        }
        @media (max-width: 768px) {
          .cab-panel { left: 0; right: 0; bottom: 0; height: var(--cab-sheet-h, 55%); border-radius: 20px 20px 0 0; }
          .cab-panel[data-animate="true"] { transition: height 0.3s ease; }
          .cab-panel[data-dragging="true"] { transition: none; }
          .cab-panel[data-snap="peek"] .cab-panel-main { visibility: hidden; }
          .cab-topbar { display: flex; align-items: center; flex-shrink: 0; }
          .cab-bar-title { display: block; }
          .cab-progress-desktop { display: none !important; }
          .cab-handle { display: flex; }
          .cab-panel-body { padding: 0 16px 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cab-shimmer { animation: none; }
          .cab-panel { transition: none !important; }
          .cab-dot { transition: none; }
          .cab-pulse, .cab-working-dot { animation: none; }
        }
      `}</style>

      <CabMap
        pickup={pickupPt}
        drop={dropPt}
        vias={viaPoints}
        route={route}
        showFallbackLine={routeState.status === 'error'}
        padding={padding}
        isMobile={isMobile}
        pulse={phase === 'submitting'}
      />

      <div
        ref={panelRef}
        className="cab-panel"
        data-snap={isMobile ? sheet.snap : undefined}
        data-dragging={sheet.dragging}
        data-animate={animate}
        style={{ ['--cab-sheet-h' as string]: `${sheet.heightPx}px` }}
      >
        {/* Phone sheet top row: the drag handle with the route summary, and the progress dots, in one compact row. */}
        <div className="cab-topbar">
          <button
            type="button"
            className="cab-handle cab-focus"
            {...sheet.handleProps}
            aria-expanded={sheet.snap !== 'peek'}
            aria-controls="cab-panel-main"
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 0,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              minHeight: 48,
              padding: '14px 8px 4px 16px',
              background: 'transparent',
              border: 'none',
              cursor: 'grab',
              textAlign: 'left',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            <span aria-hidden="true" style={{ position: 'absolute', top: 6, left: '50%', marginLeft: -20, width: 40, height: 4, borderRadius: 2, background: '#C8D9CC' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#1A1A1A', maxWidth: '100%' }}>
              <ChevronUp
                size={16}
                aria-hidden="true"
                style={{ flexShrink: 0, transform: sheet.snap === 'full' ? 'rotate(180deg)' : 'none', color: '#1E6B2E' }}
              />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summaryLine}</span>
            </span>
            {summaryMeta && sheet.snap === 'peek' && <span style={{ fontSize: 12, color: '#6B6B6B', paddingLeft: 22 }}>{summaryMeta}</span>}
            <span style={srOnly}>
              {`Trip panel is at ${sheet.snap} size. Press Enter to change size, or use the up and down arrow keys.`}
            </span>
          </button>
          <div style={{ padding: '0 16px 0 4px' }}>{progressDots}</div>
        </div>

        <div id="cab-panel-main" className="cab-panel-main" inert={atPeek}>
          {/* Desktop progress row. On phones the dots sit in the sheet's top row instead. */}
          <div className="cab-progress-desktop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 4px', flexShrink: 0 }}>
            <span aria-hidden="true" style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B' }}>
              Step {step} of 3: {STEPS[step - 1].label}
            </span>
            {progressDots}
          </div>

          <div ref={bodyRef} className="cab-panel-body">
            {step === 1 ? (
              <>
                <h1 id="cab-step-heading" tabIndex={-1} style={headingStyle(isMobile)}>
                  Book a cab in North Bengal
                </h1>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: '#4A4A4A', margin: '0 0 16px' }}>
                  Airport and station transfers, and trips across the hills, Dooars and Siliguri. Choose your route and stops
                  below. Our team confirms your driver and fare.
                </p>

                <TripOptions
                  tripType={tripType}
                  onTripType={setTripType}
                  days={days}
                  onDays={setDays}
                  pickupAt={pickupAt}
                  onPickupAt={setPickupAt}
                  now={now}
                  onOpenPicker={refreshNow}
                  isMobile={isMobile}
                />

                <RouteStep
                  locations={locations}
                  pickup={pickup}
                  drop={drop}
                  vias={vias}
                  onPickupChange={setPickup}
                  onDropChange={setDrop}
                  onViasChange={setVias}
                  newUid={newUid}
                />

                <div role="status" aria-live="polite" style={{ marginTop: 18 }}>
                  {routeState.status === 'loading' && (
                    <div aria-label="Calculating route" style={{ display: 'flex', gap: 10 }}>
                      <div className="cab-shimmer" style={{ flex: 1, height: 58 }} />
                      <div className="cab-shimmer" style={{ flex: 1, height: 58 }} />
                    </div>
                  )}
                  {routeState.status === 'ok' && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1, background: '#F4FAF5', border: '1px solid #DCEBDF', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, color: '#6B6B6B' }}>Distance (approx.)</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1E6B2E' }}>{formatDistanceKm(routeState.route.distanceM)}</div>
                      </div>
                      <div style={{ flex: 1, background: '#F4FAF5', border: '1px solid #DCEBDF', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, color: '#6B6B6B' }}>Drive time (approx.)</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1E6B2E' }}>{formatDuration(routeState.route.durationS)}</div>
                      </div>
                    </div>
                  )}
                  {routeState.status === 'error' && (
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#4A4A4A' }}>
                      Route preview unavailable, your request still works.
                    </p>
                  )}
                  {routeState.status === 'idle' && !samePlace && (
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#6B6B6B' }}>
                      Choose a pickup and a drop to see the route.
                    </p>
                  )}
                </div>

                {hasCustom && (
                  <p style={{ margin: '12px 0 0', fontSize: 12, lineHeight: 1.5, color: '#6B6B6B' }}>
                    Custom places are kept as text only. They are not drawn on the map or counted in the route.
                  </p>
                )}
              </>
            ) : (
              <>
                {/* The page keeps one h1 in the document on every step. */}
                <h1 style={srOnly}>Book a cab in North Bengal</h1>
                {(step === 2 || phase === 'idle') && (
                  <h2 id="cab-step-heading" tabIndex={-1} style={headingStyle(isMobile)}>
                    {step === 2 ? 'Passengers and vehicle' : 'Your details'}
                  </h2>
                )}
                {step === 2 && (
                  <>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: '#4A4A4A', margin: '0 0 16px' }}>
                      {summaryLine}
                      {summaryMeta ? `. ${summaryMeta}` : ''}
                    </p>
                    <VehicleStep
                      vehicles={vehicles}
                      passengers={passengers}
                      onPassengers={changePassengers}
                      luggage={luggage}
                      onLuggage={setLuggage}
                      vehicleId={vehicleId}
                      onVehicle={chooseVehicle}
                      roughRoute={roughRoute}
                      resetNote={vehicleReset}
                    />
                  </>
                )}
                {step === 3 && phase === 'idle' && (
                  <DetailsStep
                    name={name}
                    phone={phone}
                    email={email}
                    notes={notes}
                    trap={trap}
                    onField={setDetail}
                    onTrap={setTrap}
                    summary={summary}
                    onEdit={goEdit}
                    onSubmit={handleBook}
                    sending={false}
                  />
                )}
                {step === 3 && phase === 'submitting' && <SendingView />}
                {step === 3 && phase === 'success' && reference && (
                  <SuccessView
                    reference={reference}
                    summary={summary}
                    customerName={name.trim()}
                    phone={phoneForDisplay(phone)}
                    submittedAt={submittedAt ?? new Date()}
                    pickupAt={pickupAt}
                    onAnother={bookAnother}
                  />
                )}
                {step === 3 && phase === 'error' && (
                  <ErrorView
                    summary={summary}
                    customerName={name.trim()}
                    phone={phoneForDisplay(phone)}
                    message={submitError}
                    onRetry={() => setPhase('idle')}
                  />
                )}
              </>
            )}
          </div>

          {/* Sticky action bar: it sits outside the scrolling body, so it is always in view. */}
          <div style={{ display: showBar ? undefined : 'none', flexShrink: 0, padding: '10px 16px 12px', borderTop: '1px solid #E0EBE1', background: '#FFFFFF' }}>
            <p className="cab-bar-title" aria-hidden="true" style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#4A4A4A' }}>
              Step {step} of 3: {STEPS[step - 1].label}
            </p>
            <div role="status" aria-live="polite">
              {step === 1 && step1Reason && (
                <p style={{ margin: '0 0 8px', fontSize: 12, lineHeight: 1.4, color: '#6B6B6B' }}>{step1Reason}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {step > 1 && (
                <button
                  type="button"
                  className="cab-focus"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  style={{ ...buttonBase, background: '#FFFFFF', color: '#1E6B2E', border: '1.5px solid #1E6B2E' }}
                >
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  type="button"
                  className="cab-focus cab-btn-primary"
                  disabled={step === 1 && step1Reason !== null}
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  style={{ ...buttonBase, flex: 1, background: '#1E6B2E', color: '#FFFFFF', border: 'none' }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
