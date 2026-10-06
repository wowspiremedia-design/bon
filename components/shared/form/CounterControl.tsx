'use client'

import { useId, useState } from 'react'
import { ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react'

// Plus/minus stepper with a compact stacked-arrows version on mobile, copied
// verbatim from components/hotels/CheckAvailabilityButton.tsx.
//
// Additive options, both off by default so the original look and behaviour are
// unchanged: `max` caps the value (default unlimited), and `large` switches to
// a single layout with 44px labelled buttons and a typeable number field.
export function CounterControl({
  label,
  icon,
  value,
  onChange,
  min = 0,
  max = Infinity,
  large = false,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  large?: boolean
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const inputId = useId()
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  if (large) {
    const btn: React.CSSProperties = {
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      border: '1px solid #E0EBE1',
      borderRadius: 10,
      color: '#1E6B2E',
      cursor: 'pointer',
    }
    return (
      <div className="flex items-center justify-between gap-3 flex-1">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-gray-700">
          {icon}
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1E6B2E] disabled:opacity-40 disabled:cursor-not-allowed"
            style={btn}
            aria-label={`Decrease ${label}`}
            disabled={value <= min}
            onClick={() => onChange(clamp(value - 1))}
          >
            <Minus size={18} aria-hidden="true" />
          </button>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1E6B2E]"
            value={draft ?? String(value)}
            onChange={(e) => {
              const text = e.target.value.replace(/[^0-9]/g, '').slice(0, 3)
              setDraft(text)
              if (text !== '') onChange(clamp(parseInt(text, 10)))
            }}
            onBlur={() => setDraft(null)}
            style={{
              width: 56,
              height: 44,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: '#1A1A1A',
              border: '1px solid #E0EBE1',
              borderRadius: 10,
              background: '#FFFFFF',
            }}
          />
          <button
            type="button"
            className="focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#1E6B2E] disabled:opacity-40 disabled:cursor-not-allowed"
            style={btn}
            aria-label={`Increase ${label}`}
            disabled={value >= max}
            onClick={() => onChange(clamp(value + 1))}
          >
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

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
          onClick={() => onChange(Math.min(max, value + 1))}
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
            onClick={() => onChange(Math.min(max, value + 1))}
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

export default CounterControl
