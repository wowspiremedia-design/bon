'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import {
  EARLY_PICKUP_CUTOFF_HOUR,
  SUPPORT_HOURS_END,
  SUPPORT_HOURS_START,
} from '@/lib/cab/config'
import { formatHour, isEarlyPickup, isOutsideSupportHours, parseIstIso } from '@/lib/cab/time'
import ReviewSummary from './ReviewSummary'
import { tripTextLines, type TripSummary } from './tripSummary'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'
const waLink = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-playfair)',
  fontSize: 24,
  fontWeight: 700,
  color: '#1A1A1A',
  lineHeight: 1.2,
  margin: '8px 0 10px',
  outline: 'none',
}

const primaryBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  minHeight: 52,
  borderRadius: 12,
  border: 'none',
  background: '#1E6B2E',
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
}

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  background: '#FFFFFF',
  color: '#1E6B2E',
  border: '1.5px solid #1E6B2E',
}

// Shown while the request is being sent. Two lines appear in order. The text is
// the only thing that changes under reduced motion; the dot animation is CSS.
export function SendingView() {
  const [second, setSecond] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSecond(true), 1200)
    return () => window.clearTimeout(t)
  }, [])

  const row = (text: string, done: boolean) => (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 36, fontSize: 15, color: '#1A1A1A' }}>
      <span
        aria-hidden="true"
        className={done ? undefined : 'cab-working-dot'}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: done ? '#1E6B2E' : '#DCEBDF',
          color: '#FFFFFF',
        }}
      >
        {done && <Check size={13} strokeWidth={3} />}
      </span>
      {text}
    </li>
  )

  return (
    <div>
      <h2 id="cab-step-heading" tabIndex={-1} style={headingStyle}>
        Sending your request
      </h2>
      <div role="status" aria-live="polite">
        <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
          {row('Sending your trip details', second)}
          {second && row('Alerting the Bon Voyagers cab team', false)}
        </ul>
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.5, color: '#6B6B6B' }}>Please keep this page open.</p>
    </div>
  )
}

export function SuccessView({
  reference,
  summary,
  customerName,
  phone,
  submittedAt,
  pickupAt,
  onAnother,
}: {
  reference: string
  summary: TripSummary
  customerName: string
  phone: string
  submittedAt: Date
  pickupAt: string
  onAnother: () => void
}) {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const resetTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopied('idle'), 3000)
  }

  const slot = pickupAt === 'now' ? null : parseIstIso(pickupAt)
  const outside = isOutsideSupportHours(submittedAt)
  const waText = [`Hi! My Bon Voyagers cab request reference is ${reference}.`, ...tripTextLines(summary), 'Please assist me.'].join('\n')
  const earlyWaText = slot
    ? `Hi! I would like an early cab pickup (before ${formatHour(EARLY_PICKUP_CUTOFF_HOUR)}). My request reference is ${reference}.`
    : ''

  // The first "what happens next" line depends on when the request was sent.
  let firstLine: React.ReactNode = `Our team will contact you on ${phone} as soon as possible.`
  if (pickupAt === 'now' && outside) {
    firstLine = `Our team is available from ${formatHour(SUPPORT_HOURS_START)}. We will reach you then.`
  } else if (slot && outside && isEarlyPickup(slot.time)) {
    firstLine = (
      <>
        Our team starts at {formatHour(SUPPORT_HOURS_START)}. For pickups before {formatHour(EARLY_PICKUP_CUTOFF_HOUR)}, please request by{' '}
        {formatHour(SUPPORT_HOURS_END)} the day before, or{' '}
        <a
          href={waLink(earlyWaText)}
          target="_blank"
          rel="noopener noreferrer"
          className="cab-focus"
          style={{ display: 'inline-block', padding: '12px 0', color: '#1E6B2E', fontWeight: 600, textDecoration: 'underline' }}
        >
          message us on WhatsApp
        </a>
        .
      </>
    )
  }

  return (
    <div>
      <h2 id="cab-step-heading" tabIndex={-1} style={headingStyle}>
        Request received
      </h2>

      <div style={{ padding: '12px 14px', background: '#F4FAF5', border: '1px solid #DCEBDF', borderRadius: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B' }}>Your reference</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.04em', color: '#1E6B2E', overflowWrap: 'anywhere' }}>{reference}</div>
          <button
            type="button"
            onClick={copy}
            className="cab-focus"
            style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', background: '#FFFFFF', border: '1px solid #C8D9CC', borderRadius: 10, color: '#1E6B2E', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            {copied === 'ok' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied === 'ok' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div role="status" aria-live="polite" style={{ minHeight: 18, fontSize: 12, color: '#4A4A4A' }}>
          {copied === 'ok' ? 'Reference copied.' : copied === 'fail' ? 'Could not copy. Please select the reference and copy it.' : ''}
        </div>
      </div>

      <p style={{ margin: '12px 0 14px', fontSize: 13, color: '#4A4A4A' }}>
        Contact: {customerName}, {phone}
      </p>

      <ReviewSummary summary={summary} />

      <h3 style={{ margin: '18px 0 6px', fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>What happens next</h3>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.55, color: '#1A1A1A' }}>
        <li>{firstLine}</li>
        <li>We confirm your driver, vehicle and fare.</li>
        <li>No payment is taken online.</li>
      </ul>

      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="cab-focus" style={primaryBtn}>
          <MessageCircle size={18} aria-hidden="true" />
          Message us on WhatsApp
        </a>
        <button type="button" onClick={onAnother} className="cab-focus" style={secondaryBtn}>
          Book another ride
        </button>
      </div>
    </div>
  )
}

export function ErrorView({
  summary,
  customerName,
  phone,
  message,
  onRetry,
}: {
  summary: TripSummary
  customerName: string
  phone: string
  message: string
  onRetry: () => void
}) {
  const waText = [
    'Hi! I could not send my cab request on the website.',
    ...tripTextLines(summary),
    `Name: ${customerName}`,
    `Phone: ${phone}`,
    'Please assist me.',
  ].join('\n')

  return (
    <div>
      <h2 id="cab-step-heading" tabIndex={-1} style={headingStyle}>
        We could not send your request
      </h2>
      <p role="alert" style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.5, color: '#1A1A1A' }}>
        Nothing was sent. Everything you entered is still here, so you can try again, or send the same details to us on WhatsApp.
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6B6B6B' }}>{message}</p>
      <div style={{ display: 'grid', gap: 10 }}>
        <button type="button" onClick={onRetry} className="cab-focus" style={primaryBtn}>
          Try again
        </button>
        <a href={waLink(waText)} target="_blank" rel="noopener noreferrer" className="cab-focus" style={secondaryBtn}>
          <MessageCircle size={18} aria-hidden="true" />
          Send on WhatsApp instead
        </a>
      </div>
    </div>
  )
}
