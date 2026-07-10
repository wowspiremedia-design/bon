'use client'

import { useState } from 'react'

export interface ItineraryDay {
  day_label: string
  day_title: string
  day_description: string
}

export default function ItineraryAccordion({ days }: { days: ItineraryDay[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {days.map((day, i) => {
        const isOpen = i === openIndex
        return (
          <div
            key={i}
            style={{
              borderLeft: `3px solid ${isOpen ? '#1E6B2E' : '#E0EBE1'}`,
              borderRadius: '0 8px 8px 0',
              background: isOpen ? '#F7FAF7' : '#FFFFFF',
              border: `1px solid ${isOpen ? '#C8E6C9' : '#E0EBE1'}`,
              borderLeftWidth: '3px',
              borderLeftColor: isOpen ? '#1E6B2E' : '#E0EBE1',
              transition: 'border-color 0.2s, background 0.2s',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '12px',
              }}
              aria-expanded={isOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isOpen ? '#FFFFFF' : '#1E6B2E',
                    background: isOpen ? '#1E6B2E' : '#E8F5E9',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day.day_label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day.day_title}
                </span>
              </div>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#888888"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isOpen && (
              <div
                style={{ padding: '0 16px 16px 16px', fontSize: '14px', color: '#4A4A4A', lineHeight: 1.7, whiteSpace: 'pre-line' }}
              >
                {day.day_description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
