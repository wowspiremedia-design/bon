'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, BedDouble, Users, Baby, PersonStanding, User, Mail, ChevronUp, ChevronDown } from 'lucide-react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'

interface Props {
  hotelName: string
}

function CounterControl({
  label,
  icon,
  value,
  onChange,
  min = 0,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-1">
      <span className="flex items-center gap-2 text-sm text-gray-700">
        {icon}
        {label}
      </span>

      {/* Desktop: side-by-side -/+ , unchanged style from before */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 flex items-center justify-center rounded-md border"
          style={{ borderColor: '#E0EBE1', color: '#1E6B2E' }}
        >
          −
        </button>
        <span className="w-6 text-center font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-md border"
          style={{ borderColor: '#E0EBE1', color: '#1E6B2E' }}
        >
          +
        </button>
      </div>

      {/* Mobile: compact stacked up/down arrows */}
      <div className="flex sm:hidden items-center gap-2">
        <span className="w-5 text-center font-semibold">{value}</span>
        <div className="flex flex-col rounded-md border overflow-hidden" style={{ borderColor: '#E0EBE1' }}>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            aria-label={`Increase ${label}`}
            className="flex items-center justify-center"
            style={{ width: '22px', height: '16px', color: '#1E6B2E' }}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            aria-label={`Decrease ${label}`}
            className="flex items-center justify-center border-t"
            style={{ width: '22px', height: '16px', color: '#1E6B2E', borderColor: '#E0EBE1' }}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckAvailabilityButton({ hotelName }: Props) {
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(1)
  const [kids, setKids] = useState(0)
  const [infants, setInfants] = useState(0)
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')

  const canSubmit = name.trim().length > 0 && whatsapp.trim().length > 0

  const [mounted, setMounted] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

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
    setShowExitConfirm(false)
  }

  function isFormEmpty() {
    return !name.trim() && !whatsapp.trim() && !checkIn && !checkOut
  }

  function handleCloseAttempt() {
    if (showExitConfirm) {
      setOpen(false)
      setShowExitConfirm(false)
    } else if (isFormEmpty()) {
      setShowExitConfirm(true)
    } else {
      setOpen(false)
    }
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
          background: 'linear-gradient(135deg, #1E6B2E 0%, #43A047 100%)',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        Check Availability
      </button>

      {open && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseAttempt}
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
              position: 'relative',
            }}
          >
            <div className={showExitConfirm ? 'opacity-30 pointer-events-none' : ''}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  Check Availability
                </h3>
                <button
                  aria-label="Close"
                  onClick={handleCloseAttempt}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Check-in" icon={<Calendar size={14} />}>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={inputStyle} />
                  </Field>
                  <Field label="Check-out" icon={<Calendar size={14} />}>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={inputStyle} />
                  </Field>
                </div>

                <div>
                  <CounterControl label="Rooms" icon={<BedDouble className="w-4 h-4" />} value={rooms} onChange={setRooms} min={1} />
                </div>

                <div>
                  <CounterControl label="Adults" icon={<Users className="w-4 h-4" />} value={adults} onChange={setAdults} min={1} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <CounterControl label="Kids" icon={<PersonStanding className="w-4 h-4" />} value={kids} onChange={setKids} min={0} />
                  <CounterControl label="Infants" icon={<Baby className="w-4 h-4" />} value={infants} onChange={setInfants} min={0} />
                </div>

                <Field label="Name *" icon={<User size={14} />}>
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

                <Field label="Email (optional)" icon={<Mail size={14} />}>
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

            {showExitConfirm && (
              <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                <div className="bg-white rounded-2xl shadow-xl px-6 py-8 text-center max-w-sm w-full" style={{ border: '1px solid #eee' }}>
                  <p className="text-lg font-medium mb-5">
                    Are you not interested to fill up the form? Simply chat with us.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to know more about *${hotelName}*.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-lg font-semibold text-white"
                      style={{ background: '#1E6B2E' }}
                      onClick={() => { setOpen(false); setShowExitConfirm(false) }}
                    >
                      Chat Now
                    </a>
                    <button
                      onClick={() => setShowExitConfirm(false)}
                      className="px-5 py-2.5 rounded-lg font-semibold text-white"
                      style={{ background: '#D64545' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
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

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-[6px]" style={{ fontSize: '12px', fontWeight: 600, color: '#4A4A4A', marginBottom: '6px' }}>
        {icon}
        {label}
      </p>
      {children}
    </div>
  )
}

