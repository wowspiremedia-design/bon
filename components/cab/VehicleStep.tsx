'use client'

import { Briefcase, Car, Check, Info, Users } from 'lucide-react'
import type { CabVehicle } from '@/lib/cab-api'
import CounterControl from '@/components/shared/form/CounterControl'
import VehicleIcon from './VehicleIcon'
import { MAX_LUGGAGE, MAX_PASSENGERS, vehiclesForParty } from './vehicles'

interface Props {
  vehicles: CabVehicle[]
  passengers: number
  onPassengers: (n: number) => void
  luggage: number
  onLuggage: (n: number) => void
  // null means "No preference".
  vehicleId: number | null
  onVehicle: (id: number | null) => void
  // True when any chosen place is flagged as a rough village road.
  roughRoute: boolean
  // Set when a vehicle choice was dropped because the party got larger.
  resetNote: string | null
}

const NOTE_BASE: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
  margin: '0 0 10px',
  padding: '10px 12px',
  borderRadius: 10,
  fontSize: 13,
  lineHeight: 1.5,
}

function Note({ children, tone = 'plain' }: { children: React.ReactNode; tone?: 'plain' | 'care' }) {
  return (
    <p
      style={{
        ...NOTE_BASE,
        background: tone === 'care' ? '#FFF7E6' : '#F4FAF5',
        border: `1px solid ${tone === 'care' ? '#F0DDB0' : '#DCEBDF'}`,
        color: tone === 'care' ? '#6B4E00' : '#2F4A35',
      }}
    >
      <Info size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </p>
  )
}

function VehicleCard({
  value,
  selected,
  onSelect,
  icon,
  title,
  children,
}: {
  value: string
  selected: boolean
  onSelect: () => void
  icon: React.ReactNode
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <label
      className="cab-card"
      data-selected={selected}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '60px 1fr 24px',
        columnGap: 12,
        alignItems: 'center',
        minHeight: 64,
        padding: '10px 12px',
        borderRadius: 12,
        border: `${selected ? 2 : 1}px solid ${selected ? '#1E6B2E' : '#E0EBE1'}`,
        // The border grows by 1px when selected, so the padding gives it back.
        margin: selected ? 0 : 1,
        background: selected ? '#F4FAF5' : '#FFFFFF',
        cursor: 'pointer',
      }}
    >
      <input
        type="radio"
        name="cab-vehicle"
        value={value}
        checked={selected}
        onChange={onSelect}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0, pointerEvents: 'none' }}
      />
      <span aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', color: '#1E6B2E' }}>
        {icon}
      </span>
      <span style={{ minWidth: 0 }}>{title}{children}</span>
      <span
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: selected ? '#1E6B2E' : 'transparent',
          border: selected ? 'none' : '1.5px solid #C8D9CC',
          color: '#FFFFFF',
        }}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </label>
  )
}

export default function VehicleStep({
  vehicles,
  passengers,
  onPassengers,
  luggage,
  onLuggage,
  vehicleId,
  onVehicle,
  roughRoute,
  resetNote,
}: Props) {
  const { list, needsMore } = vehiclesForParty(vehicles, passengers)
  const chosen = vehicleId === null ? null : list.find((v) => v.id === vehicleId) ?? null
  const roughWarning = roughRoute && chosen !== null && !chosen.roughRoadCapable

  return (
    <div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        <CounterControl
          large
          label="Passengers"
          icon={<Users size={18} aria-hidden="true" />}
          value={passengers}
          onChange={onPassengers}
          min={1}
          max={MAX_PASSENGERS}
        />
        <CounterControl
          large
          label="Luggage (bags)"
          icon={<Briefcase size={18} aria-hidden="true" />}
          value={luggage}
          onChange={onLuggage}
          min={0}
          max={MAX_LUGGAGE}
        />
      </div>

      <fieldset style={{ border: 'none', margin: 0, padding: 0, minWidth: 0 }}>
        <legend style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', padding: 0, marginBottom: 10 }}>Vehicle</legend>

        <div role="status" aria-live="polite">
          {needsMore && <Note>For groups this size our team arranges more than one vehicle.</Note>}
          {resetNote && <Note>{resetNote}</Note>}
          {roughWarning && <Note tone="care">This route includes rough village roads. A rugged SUV is recommended.</Note>}
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <VehicleCard
            value="none"
            selected={vehicleId === null}
            onSelect={() => onVehicle(null)}
            icon={<Car size={28} strokeWidth={1.6} />}
            title={<span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>No preference</span>}
          >
            <span style={{ display: 'block', fontSize: 13, color: '#4A4A4A', marginTop: 2 }}>We will suggest the best fit</span>
          </VehicleCard>

          {list.map((v) => (
            <VehicleCard
              key={v.id}
              value={String(v.id)}
              selected={vehicleId === v.id}
              onSelect={() => onVehicle(v.id)}
              icon={<VehicleIcon vehicleClass={v.vehicleClass} />}
              title={
                <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                  {v.model}
                  {v.orSimilar && <span style={{ fontWeight: 400, color: '#6B6B6B' }}> or similar</span>}
                </span>
              }
            >
              <span style={{ display: 'block', fontSize: 13, color: '#4A4A4A', marginTop: 2 }}>
                {v.seats} seats
                {v.luggageNote ? `, ${v.luggageNote}` : ''}
              </span>
              {v.shortNote && <span style={{ display: 'block', fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{v.shortNote}</span>}
              {v.roughRoadCapable && (
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: 6,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#E8F5E9',
                    color: '#1E6B2E',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Suited to rough roads
                </span>
              )}
            </VehicleCard>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
