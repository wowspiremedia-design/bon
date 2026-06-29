'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import PackageCard from '@/components/shared/PackageCard'
import type { PackageCardProps } from '@/components/shared/PackageCard'

interface CollectionRowProps {
  name: string
  slug: string
  description: string
  emoji: string
  viewAllHref: string
  packages: PackageCardProps[]
  bgColor: string
}

export default function CollectionRow({
  name,
  slug,
  description,
  emoji,
  viewAllHref,
  packages,
  bgColor,
}: CollectionRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' })
    setTimeout(updateArrows, 350)
  }

  return (
    <section style={{ background: bgColor, padding: '48px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ── Row header ── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p
              className="mb-2 uppercase"
              style={{ color: '#C8A96A', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em' }}
            >
              <span className="mr-2" style={{ fontSize: '24px' }}>{emoji}</span>BON COLLECTION
            </p>
            <h2
              className="font-display mb-2"
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.2,
                borderLeft: '3px solid #C8A96A',
                paddingLeft: '12px',
              }}
            >
              {name}
            </h2>
            {description && (
              <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '480px', lineHeight: 1.6 }}>
                {description}
              </p>
            )}
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 mt-3 font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{ color: '#1E6B2E', fontSize: '14px' }}
            >
              View all in this collection
              <span>→</span>
            </Link>
          </div>

        </div>

        {/* ── Scrollable cards track ── */}
        <div className="relative flex items-center px-6">

          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute left-0 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 hover:bg-[#1E6B2E] hover:text-white hover:border-[#1E6B2E] flex items-center justify-center transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            onScroll={updateArrows}
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '4px',
            }}
          >
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                style={{ width: 'clamp(220px, 72vw, 320px)', flexShrink: 0 }}
              >
                <PackageCard {...pkg} />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute right-0 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 hover:bg-[#1E6B2E] hover:text-white hover:border-[#1E6B2E] flex items-center justify-center transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

        </div>

      </div>
    </section>
  )
}
