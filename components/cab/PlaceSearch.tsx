'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { CabLocation } from '@/lib/cab-api'
import { inputStyle } from '@/components/shared/form/formStyles'
import { ZONE_LABELS, ZONE_ORDER, waypointLabel, type Waypoint } from './types'

type Mode = 'pickup' | 'drop' | 'via'

interface Option {
  key: string
  kind: 'place' | 'custom'
  place?: CabLocation
  text?: string
  label: string
  hint?: string
}

interface Props {
  id: string
  label: string
  placeholder: string
  mode: Mode
  locations: CabLocation[]
  value: Waypoint | null
  onChange: (value: Waypoint | null) => void
  inputRef?: (el: HTMLInputElement | null) => void
  describedBy?: string
  invalid?: boolean
  required?: boolean
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

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Type-ahead over the loaded places. ARIA combobox: focus stays in the input,
// the highlighted option is announced through aria-activedescendant.
export default function PlaceSearch({
  id,
  label,
  placeholder,
  mode,
  locations,
  value,
  onChange,
  inputRef,
  describedBy,
  invalid,
  required,
}: Props) {
  const listId = `${id}-list`
  const inputEl = useRef<HTMLInputElement | null>(null)
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const allowed = useMemo(
    () => locations.filter((l) => (mode === 'pickup' ? l.canPickup : mode === 'drop' ? l.canDrop : l.canVia)),
    [locations, mode],
  )

  const q = editing ? norm(query) : ''
  const typed = editing ? query.trim() : ''

  const { chips, groups, customOption, options, matchCount } = useMemo(() => {
    const matches = q
      ? allowed.filter((l) => norm(l.name).includes(q) || l.aliases.some((a) => norm(a.alias).includes(q)))
      : allowed
    const sorted = q
      ? [...matches].sort((a, b) => Number(norm(b.name).startsWith(q)) - Number(norm(a.name).startsWith(q)))
      : matches
    const chipPlaces = q
      ? []
      : allowed.filter((l) => l.isPopular).sort((a, b) => (a.popularOrder ?? 99) - (b.popularOrder ?? 99))
    const toOption = (prefix: string) => (p: CabLocation): Option => ({
      key: `${prefix}-${p.id}`,
      kind: 'place',
      place: p,
      label: p.name,
      hint: ZONE_LABELS[p.zone],
    })
    const chipOptions = chipPlaces.map(toOption('chip'))
    const groupList = ZONE_ORDER.map((zone) => ({
      zone,
      label: ZONE_LABELS[zone],
      options: sorted.filter((p) => p.zone === zone).map(toOption('zone')),
    })).filter((g) => g.options.length > 0)
    const custom: Option | null =
      q && matches.length === 0
        ? { key: 'custom', kind: 'custom', text: typed, label: `Use "${typed}" as a custom place` }
        : null
    const flat: Option[] = [...chipOptions, ...groupList.flatMap((g) => g.options), ...(custom ? [custom] : [])]
    return { chips: chipOptions, groups: groupList, customOption: custom, options: flat, matchCount: matches.length }
  }, [allowed, q, typed])

  const optionId = (o: Option) => `${id}-opt-${o.key}`
  const display = editing ? query : waypointLabel(value)

  useEffect(() => {
    if (!open || active < 0) return
    const o = options[active]
    if (o) document.getElementById(optionId(o))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open])

  function select(o: Option) {
    if (o.kind === 'place' && o.place) onChange({ kind: 'place', place: o.place })
    else if (o.kind === 'custom' && o.text) onChange({ kind: 'custom', text: o.text })
    setEditing(false)
    setQuery('')
    setOpen(false)
    setActive(-1)
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setEditing(true)
    setQuery(text)
    setOpen(true)
    setActive(-1)
    if (text.trim() === '' && value) onChange(null)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(options.length ? 0 : -1)
      } else setActive((a) => Math.min(a + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (open) setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && options[active]) {
        e.preventDefault()
        select(options[active])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
        setActive(-1)
      } else if (editing) {
        setEditing(false)
        setQuery('')
      }
    }
  }

  function onBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
    setOpen(false)
    setEditing(false)
    setQuery('')
    setActive(-1)
  }

  function clear() {
    onChange(null)
    setEditing(false)
    setQuery('')
    setActive(-1)
    setOpen(true)
    inputEl.current?.focus()
  }

  const showClear = display.length > 0

  const renderOption = (o: Option, kind: 'chip' | 'row') => {
    const index = options.indexOf(o)
    const isActive = index === active
    const common = {
      id: optionId(o),
      role: 'option' as const,
      'aria-selected': isActive,
      onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
      onClick: () => select(o),
      onMouseEnter: () => setActive(index),
    }
    if (kind === 'chip') {
      return (
        <div
          key={o.key}
          {...common}
          style={{
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 16px',
            borderRadius: 22,
            border: `1px solid ${isActive ? '#1E6B2E' : '#C8D9CC'}`,
            background: isActive ? '#E8F5E9' : '#F4FAF5',
            color: '#1E6B2E',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {o.label}
        </div>
      )
    }
    return (
      <div
        key={o.key}
        {...common}
        style={{
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '6px 12px',
          background: isActive ? '#E8F5E9' : 'transparent',
          color: o.kind === 'custom' ? '#1E6B2E' : '#1A1A1A',
          fontSize: 15,
          fontWeight: o.kind === 'custom' ? 600 : 400,
          cursor: 'pointer',
        }}
      >
        <span>{o.label}</span>
        {o.hint && <span style={{ fontSize: 12, color: '#888888', flexShrink: 0 }}>{o.hint}</span>}
      </div>
    )
  }

  return (
    <div onBlur={onBlur}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A4A', lineHeight: '20px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          ref={(el) => {
            inputEl.current = el
            inputRef?.(el)
          }}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={open && active >= 0 && options[active] ? optionId(options[active]) : undefined}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="cab-focus"
          placeholder={placeholder}
          value={display}
          onChange={onInput}
          // An empty field opens its list on focus. A filled one stays closed when
          // focus arrives from code (after removing a stop, say) and opens on a
          // click, typing or ArrowDown instead.
          onFocus={() => {
            if (!value && !editing) setOpen(true)
          }}
          onClick={() => setOpen(true)}
          onKeyDown={onKeyDown}
          style={{
            ...inputStyle,
            minHeight: 44,
            fontSize: 16,
            padding: '10px 44px 10px 12px',
            borderColor: invalid ? '#D90429' : '#E0EBE1',
            boxSizing: 'border-box',
          }}
        />
        {showClear && (
          <button
            type="button"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={clear}
            className="cab-focus"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: '#6B6B6B',
              cursor: 'pointer',
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div role="status" aria-live="polite" style={srOnly}>
        {open && q ? `${matchCount} ${matchCount === 1 ? 'place' : 'places'} found` : ''}
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          // The list scrolls, which browsers make a tab stop. Focus stays in the input.
          tabIndex={-1}
          aria-label={`${label} suggestions`}
          style={{
            marginTop: 6,
            maxHeight: 300,
            overflowY: 'auto',
            border: '1px solid #E0EBE1',
            borderRadius: 10,
            background: '#FFFFFF',
            overscrollBehavior: 'contain',
          }}
        >
          {chips.length > 0 && (
            <div role="group" aria-label="Popular places" style={{ padding: '10px 12px 6px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888888', letterSpacing: '0.04em', marginBottom: 8 }} aria-hidden="true">
                Popular
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{chips.map((o) => renderOption(o, 'chip'))}</div>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.zone} role="group" aria-labelledby={`${id}-grp-${g.zone}`}>
              <div
                id={`${id}-grp-${g.zone}`}
                style={{ padding: '10px 12px 4px', fontSize: 11, fontWeight: 700, color: '#888888', letterSpacing: '0.04em' }}
              >
                {g.label}
              </div>
              {g.options.map((o) => renderOption(o, 'row'))}
            </div>
          ))}
          {customOption && <div role="group" aria-label="Custom place">{renderOption(customOption, 'row')}</div>}
          {options.length === 0 && (
            <div style={{ padding: '12px', fontSize: 14, color: '#6B6B6B' }}>No places available for this field.</div>
          )}
        </div>
      )}
    </div>
  )
}
