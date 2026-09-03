'use client'

import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { MiceFaq } from '@/lib/mice-api'

// A fourth, deliberately distinct treatment from the three sections above it
// (TrustList's plain icon-circle rows, ServiceList's gold-border grid,
// LinkedinGallery's framed mosaic): numbered gold chips instead of icons,
// and — unlike either of those, which are static once rendered — this one
// is interactive, expanding one answer at a time.
//
// Measured max-height (via each answer's own scrollHeight), not the
// grid-template-rows 0fr→1fr trick: that trick never resolved past 0px in
// real testing here (confirmed with polled computed-style samples over a
// full second — not a timing race, the browser just never expanded the
// row), so this uses the older, universally-supported max-height
// transition instead.
export default function FaqAccordion({ faqs }: { faqs: MiceFaq[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  return (
    <div style={{ border: '1px solid #F0E4C8', borderRadius: '10px', overflow: 'hidden' }}>
      {faqs.map((faq, i) => {
        const isOpen = openId === faq.id
        const contentHeight = contentRefs.current[faq.id]?.scrollHeight ?? 0
        return (
          <div key={faq.id} style={{ borderBottom: i < faqs.length - 1 ? '1px solid #F0E4C8' : 'none' }}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="flex items-center gap-3 w-full text-left"
              style={{
                padding: '16px 18px',
                background: isOpen ? '#FFFBF2' : '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#FFF3D6',
                  color: '#A8893A',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1, fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                color="#A8893A"
                style={{
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 250ms ease',
                }}
              />
            </button>

            <div
              style={{
                maxHeight: isOpen ? `${contentHeight}px` : '0px',
                overflow: 'hidden',
                transition: 'max-height 280ms ease',
              }}
            >
              <div ref={(el) => { contentRefs.current[faq.id] = el }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#4A4A4A',
                    lineHeight: 1.65,
                    padding: '0 18px 18px 47px',
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
