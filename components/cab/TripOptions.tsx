'use client'

import { CalendarCheck } from 'lucide-react'
import {
  EARLY_PICKUP_CUTOFF_HOUR,
  MAX_DAYS_ROUND_TRIP,
  SUPPORT_HOURS_END,
  SUPPORT_HOURS_START,
} from '@/lib/cab/config'
import {
  formatDateShort,
  formatHour,
  isEarlyPickup,
  isOutsideSupportHours,
  nowInIst,
  parseIstIso,
  returnDate,
} from '@/lib/cab/time'
import RideTimePicker, { type PickupAt } from './RideTimePicker'

export type TripType = 'oneway' | 'round'

interface Props {
  tripType: TripType
  onTripType: (t: TripType) => void
  days: number
  onDays: (n: number) => void
  pickupAt: PickupAt
  onPickupAt: (v: PickupAt) => void
  now: Date | null
  onOpenPicker: () => void
  isMobile: boolean
}

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'

const noteStyle: React.CSSProperties = { margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: '#4A4A4A' }

export default function TripOptions({
  tripType,
  onTripType,
  days,
  onDays,
  pickupAt,
  onPickupAt,
  now,
  onOpenPicker,
  isMobile,
}: Props) {
  const slot = pickupAt === 'now' ? null : parseIstIso(pickupAt)
  const pickupDate = slot ? slot.date : now ? nowInIst(now).date : null
  const outside = now ? isOutsideSupportHours(now) : false
  const rideNowClosed = pickupAt === 'now' && outside
  const earlyNote = slot !== null && outside && isEarlyPickup(slot.time)
  const waText = slot
    ? `Hi! I would like an early cab pickup (before ${formatHour(EARLY_PICKUP_CUTOFF_HOUR)}) on ${formatDateShort(slot.date)}. Please assist me.`
    : ''

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        role="radiogroup"
        aria-label="Trip type"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 3, gap: 3, background: '#EEF3EF', borderRadius: 12 }}
      >
        {(
          [
            { id: 'oneway', label: 'One way' },
            { id: 'round', label: 'Round trip' },
          ] as const
        ).map((o) => {
          const selected = tripType === o.id
          return (
            <label
              key={o.id}
              className="cab-seg"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                background: selected ? '#FFFFFF' : 'transparent',
                color: selected ? '#1E6B2E' : '#4A4A4A',
                boxShadow: selected ? '0 1px 4px rgba(0, 0, 0, 0.14)' : 'none',
              }}
            >
              <input
                type="radio"
                name="cab-trip-type"
                value={o.id}
                checked={selected}
                onChange={() => onTripType(o.id)}
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0, pointerEvents: 'none' }}
              />
              {o.label}
            </label>
          )
        })}
      </div>

      {tripType === 'round' && (
        <div style={{ marginTop: 12 }}>
          <label htmlFor="cab-days" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A4A', lineHeight: '20px' }}>
            How many days do you need the car?
          </label>
          <select
            id="cab-days"
            className="cab-focus"
            value={days}
            onChange={(e) => onDays(Number(e.target.value))}
            style={{
              width: '100%',
              minHeight: 44,
              fontSize: 16,
              color: '#1A1A1A',
              border: '1px solid #E0EBE1',
              borderRadius: 8,
              padding: '8px 10px',
              background: '#FFFFFF',
              boxSizing: 'border-box',
            }}
          >
            {Array.from({ length: MAX_DAYS_ROUND_TRIP }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? '1 day (same day return)' : `${n} days`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <RideTimePicker value={pickupAt} onChange={onPickupAt} now={now} onOpen={onOpenPicker} isMobile={isMobile} />
      </div>

      <div role="status" aria-live="polite">
        {rideNowClosed && (
          <p style={noteStyle}>
            Our team is available from {formatHour(SUPPORT_HOURS_START)}. We will reach you then.
          </p>
        )}
        {earlyNote && (
          <p style={noteStyle}>
            Our team starts at {formatHour(SUPPORT_HOURS_START)}. For pickups before {formatHour(EARLY_PICKUP_CUTOFF_HOUR)}, please
            request by {formatHour(SUPPORT_HOURS_END)} the day before, or{' '}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cab-focus"
              style={{ display: 'inline-block', padding: '12px 0', color: '#1E6B2E', fontWeight: 600, textDecoration: 'underline' }}
            >
              message us on WhatsApp
            </a>
            .
          </p>
        )}
        {tripType === 'round' && pickupDate && (
          <p style={{ ...noteStyle, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#1A1A1A' }}>
            <CalendarCheck size={16} aria-hidden="true" style={{ color: '#1E6B2E', flexShrink: 0 }} />
            Return by {formatDateShort(returnDate(pickupDate, days))}
          </p>
        )}
      </div>
    </div>
  )
}
