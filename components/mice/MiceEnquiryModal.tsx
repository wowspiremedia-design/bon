'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Building2, Calendar, Mail, MessageSquare, Phone, User, Users, X } from 'lucide-react'

// Self-contained trigger + dialog, same architecture as
// components/shared/EnquiryPopup.tsx (createPortal into document.body, same
// mounted/open-state/body-scroll-lock pattern) — but this component owns its
// own trigger button rather than being wrapped around a pre-existing one,
// since the hero button it replaces lives in a server component (app/mice/
// page.tsx) that can't hold client state itself. The button below is styled
// identically to the inert placeholder it replaces, so swapping it in is a
// visual no-op except that it now actually opens something.
export default function MiceEnquiryModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [travellerCount, setTravellerCount] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')

  const [mounted, setMounted] = useState(false)
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mirrors EnquiryPopup.tsx's own gate exactly: name + phone only, even
    // though Company Name / Company Email also carry the HTML `required`
    // attribute below (native constraint validation blocks the submit event
    // before this handler runs if those are empty — this is a same-shaped
    // belt-and-suspenders check, not a wider one).
    if (!name.trim() || !phone.trim()) {
      setFormError('Please fill in your name and phone number.')
      return
    }
    setFormError('')
    setStatus('sending')

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          companyName,
          eventType: 'MICE Enquiry',
          travelDate,
          travellerCount,
          message,
          website,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: '#1E6B2E',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '15px',
          padding: '14px 28px',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        Enquire Now
      </button>

      {open && mounted && createPortal(
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
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* ── Header ── */}
            <div
              className="relative"
              style={{
                background: 'linear-gradient(135deg, #1E6B2E 0%, #2E7D32 100%)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                padding: '24px',
              }}
            >
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute flex items-center justify-center"
                style={{
                  top: '16px',
                  right: '16px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <X size={16} />
              </button>

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                Corporate MICE Enquiry
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                Tell us about your event and our corporate travel team will get back to you with a tailored proposal.
              </p>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '24px' }}>
              {status === 'success' ? (
                <div
                  style={{
                    background: '#E8F5E9',
                    border: '1px solid #1E6B2E',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#1E6B2E',
                    fontWeight: 600,
                  }}
                >
                  Thanks! Your MICE enquiry has been sent. Our corporate travel team will reach out to you shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
                  />

                  <Field label="Your Name *" icon={<User size={14} />}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Company Name *" icon={<Building2 size={14} />}>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Company Email *" icon={<Mail size={14} />}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Phone (with country code) *" icon={<Phone size={14} />}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Travel Date (optional)" icon={<Calendar size={14} />}>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Traveller Count (optional)" icon={<Users size={14} />}>
                    <input
                      type="number"
                      min={1}
                      value={travellerCount}
                      onChange={(e) => setTravellerCount(e.target.value)}
                      placeholder="e.g. 25"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Message (optional)" icon={<MessageSquare size={14} />}>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' as const }}
                    />
                  </Field>

                  {formError && (
                    <p style={{ fontSize: '12px', color: '#D90429', fontWeight: 600 }}>{formError}</p>
                  )}
                  {status === 'error' && (
                    <p style={{ fontSize: '12px', color: '#D90429', fontWeight: 600 }}>
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{
                      width: '100%',
                      padding: '13px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: status === 'sending' ? '#8FBF9A' : '#1E6B2E',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Submit Enquiry'}
                  </button>
                </form>
              )}
            </div>
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
