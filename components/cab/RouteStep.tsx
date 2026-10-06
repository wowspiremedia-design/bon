'use client'

import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import type { CabLocation } from '@/lib/cab-api'
import { MAX_VIA_STOPS } from '@/lib/cab/config'
import PlaceSearch from './PlaceSearch'
import { sameWaypoint, waypointPlace, type ViaRow, type Waypoint } from './types'

interface Props {
  locations: CabLocation[]
  pickup: Waypoint | null
  drop: Waypoint | null
  vias: ViaRow[]
  onPickupChange: (w: Waypoint | null) => void
  onDropChange: (w: Waypoint | null) => void
  onViasChange: (rows: ViaRow[]) => void
  newUid: () => string
}

type PendingFocus =
  | { kind: 'input'; key: string }
  | { kind: 'add' }
  | { kind: 'move'; uid: string; dir: 'up' | 'down' }

// The label above each field is 20px and the input is 44px, so the marker
// centre on the rail sits at 20 + 22 = 42px from the top of a row.
const MARKER_Y = 42

function Rail({ kind, n, first, last }: { kind: 'pickup' | 'via' | 'drop' | 'line'; n?: number; first?: boolean; last?: boolean }) {
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    left: 13,
    width: 2,
    background: '#BFD3C4',
    top: first ? MARKER_Y : 0,
    ...(last ? { height: MARKER_Y } : { bottom: 0 }),
  }
  return (
    <div aria-hidden="true" style={{ position: 'relative', width: 28 }}>
      <div style={lineStyle} />
      {kind === 'pickup' && (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: MARKER_Y - 8,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#1E6B2E',
            border: '3px solid #FFFFFF',
            boxShadow: '0 0 0 1px #1E6B2E',
          }}
        />
      )}
      {kind === 'via' && (
        <div
          style={{
            position: 'absolute',
            left: 2,
            top: MARKER_Y - 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '2px solid #1E6B2E',
            color: '#1E6B2E',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {n}
        </div>
      )}
      {kind === 'drop' && (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: MARKER_Y - 8,
            width: 16,
            height: 16,
            background: '#1A1A1A',
            border: '3px solid #FFFFFF',
            boxShadow: '0 0 0 1px #1A1A1A',
          }}
        />
      )}
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#FFFFFF',
  border: '1px solid #E0EBE1',
  borderRadius: 10,
  color: '#1E6B2E',
  cursor: 'pointer',
}

export default function RouteStep({ locations, pickup, drop, vias, onPickupChange, onDropChange, onViasChange, newUid }: Props) {
  const inputEls = useRef(new Map<string, HTMLInputElement>())
  const buttonEls = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<PendingFocus | null>(null)

  const setInputRef = (key: string) => (el: HTMLInputElement | null) => {
    if (el) inputEls.current.set(key, el)
    else inputEls.current.delete(key)
  }
  const setButtonRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) buttonEls.current.set(key, el)
    else buttonEls.current.delete(key)
  }

  // Reordering moves DOM nodes and can drop focus, and removing a row removes
  // the focused element, so each action records where focus should land and
  // it is applied once React has committed the new list.
  useEffect(() => {
    const pf = pendingFocus.current
    if (!pf) return
    pendingFocus.current = null
    if (pf.kind === 'input') inputEls.current.get(pf.key)?.focus()
    else if (pf.kind === 'add') buttonEls.current.get('add')?.focus()
    else {
      const primary = buttonEls.current.get(`${pf.uid}:${pf.dir}`)
      const other = buttonEls.current.get(`${pf.uid}:${pf.dir === 'up' ? 'down' : 'up'}`)
      if (primary && !primary.disabled) primary.focus()
      else other?.focus()
    }
  }, [vias])

  function addVia() {
    if (vias.length >= MAX_VIA_STOPS) return
    const row: ViaRow = { uid: newUid(), value: null }
    pendingFocus.current = { kind: 'input', key: row.uid }
    onViasChange([...vias, row])
  }

  function removeVia(index: number) {
    const next = vias[index + 1] ?? vias[index - 1]
    pendingFocus.current = next ? { kind: 'input', key: next.uid } : { kind: 'add' }
    onViasChange(vias.filter((_, i) => i !== index))
  }

  function moveVia(index: number, dir: 'up' | 'down') {
    const target = dir === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= vias.length) return
    const rows = [...vias]
    ;[rows[index], rows[target]] = [rows[target], rows[index]]
    pendingFocus.current = { kind: 'move', uid: vias[index].uid, dir }
    onViasChange(rows)
  }

  function updateVia(index: number, value: Waypoint | null) {
    onViasChange(vias.map((r, i) => (i === index ? { ...r, value } : r)))
  }

  const sameError = sameWaypoint(pickup, drop)
  const pickupNote = waypointPlace(pickup)?.lastStretchNote
  const dropNote = waypointPlace(drop)?.lastStretchNote

  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Route">
      <li style={{ display: 'grid', gridTemplateColumns: '28px 1fr', columnGap: 8 }}>
        <Rail kind="pickup" first />
        <div style={{ paddingBottom: 14 }}>
          <PlaceSearch
            id="cab-pickup"
            label="Pickup"
            placeholder="Pickup place"
            mode="pickup"
            locations={locations}
            value={pickup}
            onChange={onPickupChange}
            inputRef={setInputRef('pickup')}
            required
            describedBy={pickupNote ? 'cab-pickup-note' : undefined}
          />
          {pickupNote && (
            <p id="cab-pickup-note" style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45, color: '#6B6B6B' }}>
              {pickupNote}
            </p>
          )}
        </div>
      </li>

      {vias.map((row, i) => {
        const note = waypointPlace(row.value)?.lastStretchNote
        return (
          <li key={row.uid} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', columnGap: 8 }}>
            <Rail kind="via" n={i + 1} />
            <div style={{ paddingBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <PlaceSearch
                    id={`cab-via-${row.uid}`}
                    label={`Stop ${i + 1}`}
                    placeholder="Stop on the way"
                    mode="via"
                    locations={locations}
                    value={row.value}
                    onChange={(v) => updateVia(i, v)}
                    inputRef={setInputRef(row.uid)}
                    describedBy={note ? `cab-via-${row.uid}-note` : undefined}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button
                  type="button"
                  ref={setButtonRef(`${row.uid}:up`)}
                  onClick={() => moveVia(i, 'up')}
                  disabled={i === 0}
                  aria-label={`Move stop ${i + 1} up`}
                  title="Move up"
                  className="cab-focus cab-icon-btn"
                  style={iconBtn}
                >
                  <ArrowUp size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  ref={setButtonRef(`${row.uid}:down`)}
                  onClick={() => moveVia(i, 'down')}
                  disabled={i === vias.length - 1}
                  aria-label={`Move stop ${i + 1} down`}
                  title="Move down"
                  className="cab-focus cab-icon-btn"
                  style={iconBtn}
                >
                  <ArrowDown size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeVia(i)}
                  aria-label={`Remove stop ${i + 1}`}
                  title="Remove stop"
                  className="cab-focus cab-icon-btn"
                  style={{ ...iconBtn, color: '#D90429' }}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {note && (
                <p id={`cab-via-${row.uid}-note`} style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45, color: '#6B6B6B' }}>
                  {note}
                </p>
              )}
            </div>
          </li>
        )
      })}

      <li style={{ display: 'grid', gridTemplateColumns: '28px 1fr', columnGap: 8 }}>
        <Rail kind="line" />
        <div style={{ paddingBottom: 14 }}>
          <button
            type="button"
            ref={setButtonRef('add')}
            onClick={addVia}
            disabled={vias.length >= MAX_VIA_STOPS}
            className="cab-focus"
            style={{
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 16px',
              background: '#FFFFFF',
              border: '1px dashed #1E6B2E',
              borderRadius: 10,
              color: '#1E6B2E',
              fontSize: 14,
              fontWeight: 600,
              cursor: vias.length >= MAX_VIA_STOPS ? 'not-allowed' : 'pointer',
              opacity: vias.length >= MAX_VIA_STOPS ? 0.5 : 1,
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Add a stop
          </button>
          {vias.length >= MAX_VIA_STOPS && (
            <p role="status" style={{ margin: '6px 0 0', fontSize: 12, color: '#6B6B6B' }}>
              You can add up to {MAX_VIA_STOPS} stops.
            </p>
          )}
        </div>
      </li>

      <li style={{ display: 'grid', gridTemplateColumns: '28px 1fr', columnGap: 8 }}>
        <Rail kind="drop" last />
        <div>
          <PlaceSearch
            id="cab-drop"
            label="Drop"
            placeholder="Drop place"
            mode="drop"
            locations={locations}
            value={drop}
            onChange={onDropChange}
            inputRef={setInputRef('drop')}
            required
            invalid={sameError}
            describedBy={[sameError ? 'cab-drop-error' : '', dropNote ? 'cab-drop-note' : ''].filter(Boolean).join(' ') || undefined}
          />
          {sameError && (
            <p id="cab-drop-error" role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: '#D90429', fontWeight: 600 }}>
              Pickup and drop must be different places.
            </p>
          )}
          {dropNote && (
            <p id="cab-drop-note" style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.45, color: '#6B6B6B' }}>
              {dropNote}
            </p>
          )}
        </div>
      </li>
    </ol>
  )
}
