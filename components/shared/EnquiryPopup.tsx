'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  X,
  Star,
  ShieldCheck,
  Phone,
  MessageCircle,
  User,
  Mail,
  MessageSquare,
} from 'lucide-react'

interface Props {
  packageTitle: string
  duration?: string
  price: number
  regularPrice: number
  packageId: number
  imageUrl?: string
  waNumber: string
}

const NEXT_STEPS = [
  'Dedicated travel expert assigned',
  'Personalised itinerary prepared',
  'Best available package pricing',
  'Instant WhatsApp assistance',
]

export default function EnquiryPopup({
  packageTitle,
  duration,
  price,
  regularPrice,
  packageId,
  imageUrl,
  waNumber,
}: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')

  const [mounted, setMounted] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
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

  function isFormEmpty() {
    return !name.trim() && !phone.trim() && !email.trim() && !message.trim()
  }

  function handleCloseAttempt() {
    if (showExitConfirm) {
      setOpen(false)
      setShowExitConfirm(false)
    } else if (!isFormEmpty()) {
      setShowExitConfirm(true)
    } else {
      setOpen(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      setFormError('Please fill in your name and mobile number.')
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
          message,
          packageTitle,
          price,
          regularPrice,
          packageId,
          website,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  function handleWhatsAppClick() {
    const lines = [
      `Hi! I'm interested in ${packageTitle}.`,
      ...(name.trim() ? [`My name is ${name}.`] : []),
    ]
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join(' '))}`
    window.open(waLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          padding: '13px',
          fontSize: '15px',
          fontWeight: 700,
          color: '#FFFFFF',
          background: '#D90429',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
        }}
      >
        Enquire Now
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
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <div className={showExitConfirm ? 'opacity-30 pointer-events-none' : ''}>

              {/* ── Hero header ── */}
              <div
                className="relative overflow-hidden"
                style={{
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px',
                  padding: '24px',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  backgroundImage: imageUrl
                    ? `url(${imageUrl})`
                    : 'linear-gradient(135deg, #1E6B2E 0%, #43A047 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                  }}
                />

                {/* Top-left pill */}
                <div
                  className="absolute flex items-center gap-[6px]"
                  style={{
                    top: '16px',
                    left: '16px',
                    background: 'rgba(255,255,255,0.18)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Sparkles size={13} />
                  Free Travel Consultation
                </div>

                {/* Top-right close button */}
                <button
                  aria-label="Close"
                  onClick={handleCloseAttempt}
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

                <div className="relative" style={{ zIndex: 1 }}>
                  {/* Rating / traveller pills */}
                  <div className="flex flex-wrap gap-2" style={{ marginBottom: '12px' }}>
                    <span
                      className="flex items-center gap-[4px]"
                      style={{
                        background: 'rgba(255,255,255,0.18)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <Star size={11} fill="#FFFFFF" />
                      4.8 Rating
                    </span>
                    <span
                      style={{
                        background: 'rgba(255,255,255,0.18)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      500,000+ Travellers
                    </span>
                  </div>

                  {/* Headline */}
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.3,
                      marginBottom: '6px',
                      textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                    }}
                  >
                    {packageTitle}{duration ? ` | ${duration}` : ''}
                  </h3>

                  {/* Subtitle */}
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                    Get expert recommendations, personalised itineraries and the best available offers for your dream holiday.
                  </p>
                </div>
              </div>

              {/* ── Body ── */}
              <div style={{ padding: '24px' }}>

                {/* Trust strip */}
                <div className="grid grid-cols-3 gap-2" style={{ marginBottom: '20px' }}>
                  <div className="flex flex-col items-center text-center gap-1" style={{ fontSize: '11px', color: '#4A4A4A' }}>
                    <ShieldCheck size={18} color="#1E6B2E" />
                    Verified Experts
                  </div>
                  <div className="flex flex-col items-center text-center gap-1" style={{ fontSize: '11px', color: '#4A4A4A' }}>
                    <Star size={18} color="#1E6B2E" />
                    Best Price
                  </div>
                  <div className="flex flex-col items-center text-center gap-1" style={{ fontSize: '11px', color: '#4A4A4A' }}>
                    <Phone size={18} color="#1E6B2E" />
                    Fast Response
                  </div>
                </div>

                {/* What Happens Next */}
                <div
                  style={{
                    background: '#FDF0EE',
                    border: '1px solid #F5D9D4',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    marginBottom: '20px',
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '10px' }}>
                    What Happens Next?
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {NEXT_STEPS.map((step) => (
                      <li key={step} className="flex items-start gap-2" style={{ fontSize: '13px', color: '#4A4A4A' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

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
                    Thanks! Your enquiry has been sent. Our travel expert will reach out to you shortly.
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

                    <Field label="Your Full Name *" icon={<User size={14} />}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Mobile Number *" icon={<Phone size={14} />}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Email Address (optional)" icon={<Mail size={14} />}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Tell us your travel requirements... (optional)" icon={<MessageSquare size={14} />}>
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
                        Something went wrong. Please try again or chat with us on WhatsApp.
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
                        background: status === 'sending' ? '#EB8C9C' : '#D90429',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {status === 'sending' ? 'Sending...' : 'Get My Custom Itinerary'}
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppClick}
                      className="flex items-center justify-center gap-2"
                      style={{
                        width: '100%',
                        padding: '13px',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#1E6B2E',
                        background: '#FFFFFF',
                        border: '2px solid #1E6B2E',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <MessageCircle size={16} />
                      Chat Instantly On WhatsApp
                    </button>
                  </form>
                )}
              </div>
            </div>

            {showExitConfirm && (
              <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
                <div className="bg-white rounded-2xl shadow-xl px-6 py-8 text-center max-w-sm w-full" style={{ border: '1px solid #eee' }}>
                  <p className="text-lg font-medium mb-5">
                    Are you not interested to fill up the form? Simply chat with us.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'd like to know more about ${packageTitle}.`)}`}
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
