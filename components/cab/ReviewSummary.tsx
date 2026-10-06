'use client'

import type { TripSummary } from './tripSummary'

export type EditTarget = 'trip' | 'route' | 'vehicle' | 'notes'

interface Props {
  summary: TripSummary
  // When given, each section shows an Edit button. Omitted on the confirmation.
  onEdit?: (target: EditTarget) => void
}

const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#6B6B6B', textTransform: 'uppercase' }
const line: React.CSSProperties = { margin: '2px 0 0', fontSize: 14, lineHeight: 1.45, color: '#1A1A1A' }

function Section({
  title,
  editLabel,
  onEdit,
  children,
}: {
  title: string
  editLabel: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderTop: '1px solid #DCEBDF' }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={label}>{title}</div>
        {children}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="cab-focus"
          style={{
            flexShrink: 0,
            minWidth: 56,
            minHeight: 44,
            padding: '0 12px',
            background: '#FFFFFF',
            border: '1px solid #C8D9CC',
            borderRadius: 10,
            color: '#1E6B2E',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      )}
    </div>
  )
}

export default function ReviewSummary({ summary, onEdit }: Props) {
  const edit = (t: EditTarget) => (onEdit ? () => onEdit(t) : undefined)
  return (
    <section aria-label="Review your request" style={{ background: '#F4FAF5', border: '1px solid #DCEBDF', borderRadius: 14, padding: '12px 14px 2px' }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>Review your request</h3>

      <Section title="Trip" editLabel="Edit trip type and ride time" onEdit={edit('trip')}>
        <p style={line}>{summary.tripLine}</p>
        {summary.returnLine && <p style={line}>{summary.returnLine}</p>}
        <p style={line}>Pickup time: {summary.rideLine}</p>
      </Section>

      <Section title="Route" editLabel="Edit route" onEdit={edit('route')}>
        {summary.stops.map((s) => (
          <p key={s.role} style={line}>
            <span style={{ color: '#6B6B6B' }}>{s.role}: </span>
            {s.label}
            {s.custom && <span style={{ color: '#6B6B6B' }}> (typed place)</span>}
          </p>
        ))}
        {summary.routeMeta && <p style={{ ...line, color: '#4A4A4A' }}>{summary.routeMeta}</p>}
      </Section>

      <Section title="Passengers and vehicle" editLabel="Edit passengers and vehicle" onEdit={edit('vehicle')}>
        <p style={line}>{summary.paxLine}</p>
        <p style={line}>{summary.vehicleLine}</p>
      </Section>

      {summary.notes !== '' && (
        <Section title="Notes" editLabel="Edit notes" onEdit={edit('notes')}>
          <p style={{ ...line, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{summary.notes}</p>
        </Section>
      )}
    </section>
  )
}
