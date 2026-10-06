'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Clock } from 'lucide-react'
import {
  buildDateChips,
  earliestSlot,
  formatSlot,
  formatTime,
  parseIstIso,
  slotsForDate,
  toIstIso,
} from '@/lib/cab/time'
import { RIDE_LATER_MIN_NOTICE_HOURS } from '@/lib/cab/config'

// "now", or an ISO string such as 2026-10-08T09:30:00+05:30.
export type PickupAt = 'now' | string

interface Props {
  value: PickupAt
  onChange: (value: PickupAt) => void
  // Null until the client has read the clock.
  now: Date | null
  // Called when the picker opens, so the parent can refresh `now`.
  onOpen: () => void
  isMobile: boolean
}

const ITEM_H = 44
const WHEEL_PAD = ITEM_H * 2

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function TimeWheel({ times, selected, onSelect }: { times: string[]; selected: string; onSelect: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const ignoreScrollUntil = useRef(0)
  const skipCenter = useRef(false)
  const mounted = useRef(false)
  const index = Math.max(0, times.indexOf(selected))

  const center = (i: number, smooth: boolean) => {
    const el = ref.current
    if (!el) return
    const top = i * ITEM_H
    if (Math.abs(el.scrollTop - top) < 1) return
    ignoreScrollUntil.current = performance.now() + (smooth ? 600 : 200)
    el.scrollTo({ top, behavior: smooth && !reducedMotion() ? 'smooth' : 'auto' })
  }

  // First paint: put the selected time in the middle without animating.
  useLayoutEffect(() => {
    center(index, false)
    mounted.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A choice made by key, click or date change moves the wheel. A choice that
  // came from scrolling the wheel itself does not, or it would fight the finger.
  useEffect(() => {
    if (!mounted.current) return
    if (skipCenter.current) {
      skipCenter.current = false
      return
    }
    center(index, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, times.length, times[0]])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function onScroll() {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (performance.now() < ignoreScrollUntil.current) return
      const el = ref.current
      if (!el) return
      const i = Math.min(times.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)))
      if (times[i] && times[i] !== selected) {
        skipCenter.current = true
        onSelect(times[i])
      }
    }, 130)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const move = (to: number) => {
      e.preventDefault()
      const next = Math.min(times.length - 1, Math.max(0, to))
      if (times[next]) onSelect(times[next])
    }
    if (e.key === 'ArrowDown') move(index + 1)
    else if (e.key === 'ArrowUp') move(index - 1)
    else if (e.key === 'PageDown') move(index + 4)
    else if (e.key === 'PageUp') move(index - 4)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(times.length - 1)
  }

  return (
    <div style={{ position: 'relative', height: ITEM_H * 5 }}>
      <div
        ref={ref}
        role="listbox"
        tabIndex={0}
        aria-label="Pickup time"
        aria-activedescendant={times[index] ? `cab-time-${times[index].replace(':', '')}` : undefined}
        className="cab-focus cab-wheel"
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        style={{
          height: '100%',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          overscrollBehavior: 'contain',
          paddingBlock: WHEEL_PAD,
          boxSizing: 'border-box',
          borderRadius: 10,
          border: '1px solid #E0EBE1',
          background: '#FFFFFF',
        }}
      >
        {times.map((t) => {
          const isSelected = t === selected
          return (
            <div
              key={t}
              id={`cab-time-${t.replace(':', '')}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(t)}
              style={{
                height: ITEM_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                fontSize: 16,
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? '#1E6B2E' : '#4A4A4A',
                cursor: 'pointer',
              }}
            >
              {formatTime(t)}
            </div>
          )
        })}
      </div>
      {/* Highlight band over the centred row, and a soft fade top and bottom. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 1,
          right: 1,
          top: WHEEL_PAD + 1,
          height: ITEM_H,
          background: 'rgba(30, 107, 46, 0.08)',
          borderTop: '1.5px solid #1E6B2E',
          borderBottom: '1.5px solid #1E6B2E',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 1,
          borderRadius: 9,
          pointerEvents: 'none',
          background: 'linear-gradient(#FFFFFF 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, #FFFFFF 100%)',
        }}
      />
    </div>
  )
}

function RideTimeForm({
  value,
  onChange,
  now,
  onDone,
  headingId,
}: {
  value: PickupAt
  onChange: (v: PickupAt) => void
  now: Date
  onDone: () => void
  headingId: string
}) {
  const slot = value === 'now' ? null : parseIstIso(value)
  const mode = slot ? 'later' : 'now'
  const chips = useMemo(() => buildDateChips(now), [now])
  const firstEnabled = chips.find((c) => !c.disabled)
  const times = useMemo(() => (slot ? slotsForDate(now, slot.date) : []), [now, slot?.date]) // eslint-disable-line react-hooks/exhaustive-deps
  const [dateError, setDateError] = useState<string | null>(null)
  const chipRow = useRef<HTMLDivElement>(null)

  // Keep the chosen date chip in view.
  useEffect(() => {
    const row = chipRow.current
    if (!row || !slot) return
    const chip = row.querySelector<HTMLElement>(`[data-date="${slot.date}"]`)
    if (!chip) return
    row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [slot?.date]) // eslint-disable-line react-hooks/exhaustive-deps

  function chooseLater() {
    const e = earliestSlot(now)
    onChange(toIstIso(e.date, e.time))
  }

  function chooseDate(date: string) {
    const options = slotsForDate(now, date)
    if (options.length === 0) {
      setDateError('No pickup times are left on that date.')
      return
    }
    setDateError(null)
    const keep = slot && options.includes(slot.time) ? slot.time : options[0]
    onChange(toIstIso(date, keep))
  }

  return (
    <div>
      <h2 id={headingId} style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
        Pickup time
      </h2>

      <div role="radiogroup" aria-labelledby={headingId} style={{ display: 'grid', gap: 2 }}>
        {[
          { id: 'now', label: 'Now' },
          { id: 'later', label: 'Schedule for later' },
        ].map((o) => (
          <label
            key={o.id}
            style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44, fontSize: 15, color: '#1A1A1A', cursor: 'pointer' }}
          >
            <input
              type="radio"
              name="cab-ride-mode"
              className="cab-focus"
              checked={mode === o.id}
              onChange={() => (o.id === 'now' ? onChange('now') : chooseLater())}
              style={{ width: 20, height: 20, accentColor: '#1E6B2E', margin: 0 }}
            />
            {o.label}
          </label>
        ))}
      </div>

      {mode === 'later' && slot && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4A4A4A', marginBottom: 6 }} id="cab-date-label">
            Date
          </div>
          <div
            ref={chipRow}
            role="group"
            aria-labelledby="cab-date-label"
            className="cab-chip-row"
            // One tab stop for the whole row. Arrow keys, Home and End move between dates.
            onKeyDown={(e) => {
              const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
              if (!keys.includes(e.key)) return
              const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
              const i = items.indexOf(document.activeElement as HTMLButtonElement)
              if (i < 0) return
              e.preventDefault()
              const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.min(items.length - 1, Math.max(0, i + (e.key === 'ArrowRight' ? 1 : -1)))
              items[next].focus()
            }}
            style={{ position: 'relative', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x proximity' }}
          >
            {chips.map((c) => {
              const selected = c.date === slot.date
              return (
                <button
                  key={c.date}
                  type="button"
                  data-date={c.date}
                  disabled={c.disabled}
                  aria-pressed={selected}
                  tabIndex={selected ? 0 : -1}
                  aria-label={`${c.label}${c.isToday ? ', today' : ''}${c.disabled ? ', no pickup times left' : ''}`}
                  onClick={() => chooseDate(c.date)}
                  className="cab-focus"
                  style={{
                    flex: '0 0 auto',
                    width: 62,
                    minHeight: 72,
                    scrollSnapAlign: 'start',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    borderRadius: 12,
                    border: `1.5px solid ${selected ? '#1E6B2E' : '#E0EBE1'}`,
                    background: selected ? '#1E6B2E' : '#FFFFFF',
                    color: selected ? '#FFFFFF' : '#1A1A1A',
                    opacity: c.disabled ? 0.4 : 1,
                    cursor: c.disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{c.isToday ? 'Today' : c.weekday}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{c.day}</span>
                  <span style={{ fontSize: 11 }}>{c.month}</span>
                </button>
              )
            })}
          </div>

          <label htmlFor="cab-date-input" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A4A', margin: '8px 0 4px' }}>
            Or pick a date
          </label>
          <input
            id="cab-date-input"
            type="date"
            className="cab-focus"
            value={slot.date}
            min={firstEnabled?.date}
            max={chips[chips.length - 1]?.date}
            onChange={(e) => {
              if (e.target.value) chooseDate(e.target.value)
            }}
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
          />
          {dateError && (
            <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: '#D90429', fontWeight: 600 }}>
              {dateError}
            </p>
          )}

          <div style={{ fontSize: 12, fontWeight: 600, color: '#4A4A4A', margin: '12px 0 6px' }}>Time</div>
          {times.length > 0 ? (
            <TimeWheel times={times} selected={slot.time} onSelect={(t) => onChange(toIstIso(slot.date, t))} />
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: '#6B6B6B' }}>No pickup times are left on this date.</p>
          )}
          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6B6B6B' }}>
            India time. Earliest pickup is {RIDE_LATER_MIN_NOTICE_HOURS} hours from now.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="cab-focus"
        style={{
          marginTop: 14,
          width: '100%',
          minHeight: 48,
          borderRadius: 12,
          border: 'none',
          background: '#1E6B2E',
          color: '#FFFFFF',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  )
}

export default function RideTimePicker({ value, onChange, now, onOpen, isMobile }: Props) {
  const [open, setOpen] = useState(false)
  const pillRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const slot = value === 'now' ? null : parseIstIso(value)
  const text = slot ? formatSlot(slot.date, slot.time) : 'Pickup now'

  function openPicker() {
    onOpen()
    setOpen(true)
  }
  function close() {
    setOpen(false)
    pillRef.current?.focus()
  }

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    el?.querySelector<HTMLElement>('input[type="radio"]:checked')?.focus()
    if (!isMobile) el?.scrollIntoView({ block: 'nearest' })
  }, [open, isMobile])

  // Close on a press outside the desktop popover. The mobile drawer has a scrim.
  useEffect(() => {
    if (!open || isMobile) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (dialogRef.current?.contains(t) || pillRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open, isMobile])

  // Stop the page behind a modal drawer from scrolling.
  useEffect(() => {
    if (!open || !isMobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, isMobile])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
      return
    }
    // The mobile drawer is modal, so Tab wraps inside it.
    if (e.key === 'Tab' && isMobile && dialogRef.current) {
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]'),
      ).filter((el) => el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const form = now ? (
    <RideTimeForm value={value} onChange={onChange} now={now} onDone={close} headingId="cab-ridetime-heading" />
  ) : null

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .cab-chip-row, .cab-wheel { scrollbar-width: thin; }
        .cab-popover { animation: cab-pop-in 0.16s ease-out; }
        .cab-drawer { animation: cab-drawer-in 0.26s ease-out; }
        .cab-scrim { animation: cab-fade-in 0.2s ease-out; }
        @keyframes cab-pop-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        @keyframes cab-drawer-in { from { transform: translateY(100%); } to { transform: none; } }
        @keyframes cab-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .cab-popover, .cab-drawer, .cab-scrim { animation: none; }
          .cab-chip-row, .cab-wheel { scroll-behavior: auto; }
        }
      `}</style>

      <button
        ref={pillRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : openPicker())}
        className="cab-focus"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 44,
          maxWidth: '100%',
          padding: '0 14px',
          borderRadius: 999,
          border: '1px solid #C8D9CC',
          background: '#F4FAF5',
          color: '#1A1A1A',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Clock size={16} aria-hidden="true" style={{ color: '#1E6B2E', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
        <ChevronDown size={16} aria-hidden="true" style={{ color: '#1E6B2E', flexShrink: 0 }} />
      </button>

      {open && form && !isMobile && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-labelledby="cab-ridetime-heading"
          onKeyDown={onKeyDown}
          className="cab-popover"
          style={{
            position: 'absolute',
            zIndex: 30,
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            padding: 16,
            background: '#FFFFFF',
            border: '1px solid #E0EBE1',
            borderRadius: 14,
            boxShadow: '0 10px 32px rgba(0, 0, 0, 0.16)',
          }}
        >
          {form}
        </div>
      )}

      {open && form && isMobile &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            <div
              className="cab-scrim"
              onClick={close}
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.45)' }}
            />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cab-ridetime-heading"
              onKeyDown={onKeyDown}
              className="cab-drawer"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                maxHeight: '90dvh',
                overflowY: 'auto',
                padding: '20px 16px calc(16px + env(safe-area-inset-bottom))',
                background: '#FFFFFF',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              {form}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
