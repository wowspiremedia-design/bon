'use client'

import { useState } from 'react'

export interface FAQItem {
  question_label: string
  answer_label: string
}

export default function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {faqs.map((faq, i) => {
        const isOpen = i === openIndex
        return (
          <div
            key={i}
            style={{
              border: `1px solid ${isOpen ? '#C8E6C9' : '#E0EBE1'}`,
              borderRadius: '10px',
              overflow: 'hidden',
              background: isOpen ? '#F7FAF7' : '#FFFFFF',
              transition: 'border-color 0.2s, background 0.2s',
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
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', flex: 1 }}>
                {faq.question_label}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isOpen ? '#1E6B2E' : '#888888'}
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
                style={{ padding: '0 16px 16px 16px', fontSize: '14px', color: '#4A4A4A', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: faq.answer_label }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
