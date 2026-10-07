'use client'

import { useEffect, useRef, useState } from 'react'
import { inputStyle } from '@/components/shared/form/formStyles'
import { NAME_MAX, NOTES_MAX, validateDetails, type DetailErrors, type DetailField } from '@/lib/cab/payload'
import ReviewSummary, { type EditTarget } from './ReviewSummary'
import type { TripSummary } from './tripSummary'

interface Props {
  name: string
  phone: string
  email: string
  notes: string
  trap: string
  onField: (field: DetailField, value: string) => void
  onTrap: (value: string) => void
  summary: TripSummary
  onEdit: (target: EditTarget) => void
  // Called only when every field is valid.
  onSubmit: () => void
  sending: boolean
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

const FIELD_IDS: Record<DetailField, string> = { name: 'cab-name', phone: 'cab-phone', email: 'cab-email', notes: 'cab-notes' }
const FIELD_LABELS: Record<DetailField, string> = {
  name: 'Name',
  phone: 'Phone (WhatsApp preferred)',
  email: 'Email (optional)',
  notes: 'Notes (optional)',
}
const ORDER: DetailField[] = ['name', 'phone', 'email', 'notes']

const control = (invalid: boolean): React.CSSProperties => ({
  ...inputStyle,
  minHeight: 44,
  fontSize: 16,
  padding: '10px 12px',
  boxSizing: 'border-box',
  borderColor: invalid ? '#D90429' : '#E0EBE1',
})

export default function DetailsStep({ name, phone, email, notes, trap, onField, onTrap, summary, onEdit, onSubmit, sending }: Props) {
  const [touched, setTouched] = useState<Partial<Record<DetailField, boolean>>>({})
  const [attempts, setAttempts] = useState(0)
  const summaryRef = useRef<HTMLDivElement>(null)

  const values = { name, phone, email, notes }
  const errors: DetailErrors = validateDetails(values)
  const attempted = attempts > 0
  const shown = (f: DetailField) => (touched[f] || attempted ? errors[f] : undefined)
  const failedCount = Object.keys(errors).length

  // A failed submit moves focus to the error summary.
  useEffect(() => {
    if (attempts > 0 && failedCount > 0) summaryRef.current?.focus()
    // Only a new attempt should move focus, not every keystroke afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setAttempts((n) => n + 1)
    if (failedCount > 0) return
    onSubmit()
  }

  function describedBy(f: DetailField, extra?: string) {
    return [shown(f) ? `${FIELD_IDS[f]}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined
  }

  const common = (f: DetailField) => ({
    id: FIELD_IDS[f],
    className: 'cab-focus',
    'aria-invalid': shown(f) ? (true as const) : undefined,
    onBlur: () => setTouched((t) => ({ ...t, [f]: true })),
  })

  const err = (f: DetailField) =>
    shown(f) ? (
      <p id={`${FIELD_IDS[f]}-error`} style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: '#D90429' }}>
        {errors[f]}
      </p>
    ) : null

  const labelEl = (f: DetailField) => (
    <label htmlFor={FIELD_IDS[f]} style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A4A', lineHeight: '20px' }}>
      {FIELD_LABELS[f]}
    </label>
  )

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Spam trap. display none keeps it out of the accessibility tree and the tab order, and browser
          autofill skips hidden fields. The name is deliberately not a common autofill target such as
          "website" or "url", so a real customer can never fill it by accident. */}
      <div aria-hidden="true" style={{ display: 'none' }}>
        <input id="bv_trap" type="text" name="bv_trap" value={trap} onChange={(e) => onTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      {/* Announced politely when a submit fails. */}
      <div aria-live="polite" style={srOnly}>
        {attempted && failedCount > 0 ? `${failedCount} ${failedCount === 1 ? 'field needs' : 'fields need'} attention.` : ''}
      </div>

      {attempted && failedCount > 0 && (
        <div
          ref={summaryRef}
          id="cab-error-summary"
          tabIndex={-1}
          role="group"
          aria-labelledby="cab-error-summary-title"
          style={{ margin: '0 0 14px', padding: '12px 14px', border: '1.5px solid #D90429', borderRadius: 12, background: '#FFF5F6', outline: 'none' }}
        >
          <p id="cab-error-summary-title" style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#9E0220' }}>
            {failedCount === 1 ? 'One thing needs fixing before you continue' : `${failedCount} things need fixing before you continue`}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {ORDER.filter((f) => errors[f]).map((f) => (
              <li key={f}>
                <button
                  type="button"
                  onClick={() => document.getElementById(FIELD_IDS[f])?.focus()}
                  className="cab-focus"
                  style={{ minHeight: 44, padding: 0, background: 'none', border: 'none', color: '#9E0220', fontSize: 13, textAlign: 'left', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {FIELD_LABELS[f].replace(' (optional)', '')}: {errors[f]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          {labelEl('name')}
          <input
            {...common('name')}
            type="text"
            name="name"
            value={name}
            maxLength={NAME_MAX}
            autoComplete="name"
            aria-required="true"
            aria-describedby={describedBy('name')}
            onChange={(e) => onField('name', e.target.value)}
            style={control(Boolean(shown('name')))}
          />
          {err('name')}
        </div>

        <div>
          {labelEl('phone')}
          <input
            {...common('phone')}
            type="tel"
            name="phone"
            value={phone}
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            aria-describedby={describedBy('phone')}
            onChange={(e) => onField('phone', e.target.value)}
            style={control(Boolean(shown('phone')))}
          />
          {err('phone')}
        </div>

        <div>
          {labelEl('email')}
          <input
            {...common('email')}
            type="email"
            name="email"
            value={email}
            inputMode="email"
            autoComplete="email"
            aria-describedby={describedBy('email')}
            onChange={(e) => onField('email', e.target.value)}
            style={control(Boolean(shown('email')))}
          />
          {err('email')}
        </div>

        <div>
          {labelEl('notes')}
          <textarea
            {...common('notes')}
            name="notes"
            value={notes}
            rows={3}
            maxLength={NOTES_MAX}
            aria-describedby={describedBy('notes', 'cab-notes-count')}
            onChange={(e) => onField('notes', e.target.value)}
            style={{ ...control(Boolean(shown('notes'))), resize: 'vertical', minHeight: 88 }}
          />
          <p id="cab-notes-count" style={{ margin: '4px 0 0', fontSize: 12, color: notes.length >= NOTES_MAX ? '#D90429' : '#6B6B6B', textAlign: 'right' }}>
            {notes.length} / {NOTES_MAX}
          </p>
          {err('notes')}
        </div>
      </div>

      {/* There is no privacy page on the site yet, so this line has no link. */}
      <p style={{ margin: '12px 0 16px', fontSize: 12, lineHeight: 1.5, color: '#6B6B6B' }}>
        We use your phone number only to contact you about this request.
      </p>

      <ReviewSummary summary={summary} onEdit={onEdit} />

      <button
        type="submit"
        disabled={sending}
        aria-busy={sending}
        className="cab-focus cab-btn-primary"
        style={{
          marginTop: 16,
          width: '100%',
          minHeight: 52,
          borderRadius: 12,
          border: 'none',
          background: '#1E6B2E',
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: 700,
          cursor: sending ? 'wait' : 'pointer',
        }}
      >
        Find Cars
      </button>
      <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.5, color: '#4A4A4A', textAlign: 'center' }}>
        No payment now. Our team confirms your driver, vehicle and fare.
      </p>
    </form>
  )
}
