'use client'

import { useState } from 'react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'

interface Props {
  hotelName: string
}

export default function CheckAvailabilityButton({ hotelName }: Props) {
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(1)
  const [kids, setKids] = useState(0)
  const [infants, setInfants] = useState(0)
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  const canSubmit = name.trim().length > 0 && whatsapp.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const lines = [
      `Hi, I'm interested in *${hotelName}*.`,
      `Check-in: ${checkIn || 'Not specified'}`,
      `Check-out: ${checkOut || 'Not specified'}`,
      `Guests: ${adults} Adult(s), ${kids} Kid(s), ${infants} Infant(s)`,
      `Name: ${name}`,
      `WhatsApp: ${whatsapp}`,
      `Email: ${email || 'Not provided'}`,
    ]
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(waLink, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          fontWeight: 700,
          color: '#FFFFFF',
          background: '#1E6B2E',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        Check Availability
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '440px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                Check Availability
              </h3>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in">
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Check-out">
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={inputStyle} />
                </Field>
              </div>

              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '8px' }}>Guests</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Counter label="Adults" value={adults} min={1} onChange={setAdults} />
                  <Counter label="Kids" value={kids} min={0} onChange={setKids} />
                  <Counter label="Infants" value={infants} min={0} onChange={setInfants} />
                </div>
              </div>

              <Field label="Name *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="WhatsApp Number *">
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Email (optional)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  marginTop: '4px',
                  width: '100%',
                  padding: '13px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: canSubmit ? '#25D366' : '#A8D9BB',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const inputStyle = {
  width: '100%',
  fontSize: '13px',
  color: '#1A1A1A',
  border: '1px solid #E0EBE1',
  borderRadius: '8px',
  padding: '9px 10px',
  background: '#FFFFFF',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '12px', fontWeight: 600, color: '#4A4A4A', marginBottom: '6px' }}>{label}</p>
      {children}
    </div>
  )
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between" style={{ border: '1px solid #E0EBE1', borderRadius: '8px', padding: '8px 12px' }}>
      <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          style={counterBtnStyle}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', minWidth: '16px', textAlign: 'center' }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          style={counterBtnStyle}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

const counterBtnStyle = {
  width: '24px',
  height: '24px',
  borderRadius: '6px',
  border: '1px solid #E0EBE1',
  background: '#FFFFFF',
  color: '#1E6B2E',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
}
