'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import PackageCard from '@/components/shared/PackageCard'
import type { PackageCardProps } from '@/components/shared/PackageCard'
import DestinationCard from './DestinationCard'
import type { DestinationCardProps } from './DestinationCard'

interface CollectionRowProps {
  name: string
  slug: string
  description: string
  emoji: string
  viewAllHref: string
  packages: PackageCardProps[]
  bgColor: string
  cardType?: 'package' | 'destination'
  destinations?: DestinationCardProps[]
}

export default function CollectionRow({
  name,
  slug,
  description,
  emoji,
  viewAllHref,
  packages,
  bgColor,
  cardType = 'package',
  destinations = [],
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
    const firstCard = el.firstElementChild as HTMLElement | null
    const cardWidth = firstCard ? firstCard.offsetWidth : 320
    const gap = 20
    const distance = cardWidth + gap
    el.scrollBy({ left: dir === 'left' ? -distance : distance, behavior: 'smooth' })
    setTimeout(updateArrows, 350)
  }

  return (
    <section style={{ background: bgColor, padding: '32px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ── Row header ── */}
        <div className="mb-6">
          <div className="mb-2">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
              style={{ backgroundColor: 'rgba(255,255,255,0.55)', color: '#1A1A1A' }}
            >
              BON COLLECTION
            </span>
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 flex-1 min-w-0">
              <h2
                className="font-display border-b-2 sm:border-b-0 sm:border-l-[3px] border-[#C8A96A] pb-1 sm:pb-0 sm:pl-3 inline-block sm:inline"
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  lineHeight: 1.2,
                }}
              >
                {name}
              </h2>
              {description && (
                <p
                  className="hidden sm:block truncate min-w-0"
                  style={{ fontSize: '14px', color: '#1A1A1A' }}
                >
                  {description}
                </p>
              )}
            </div>

            <Link
              href={viewAllHref}
              className="shrink-0 ml-auto inline-flex items-center gap-1 font-semibold transition-opacity duration-200 hover:opacity-75 whitespace-nowrap"
              style={{ color: '#1E6B2E', fontSize: '14px' }}
            >
              View All
              <span>↗</span>
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
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {cardType === 'destination'
              ? destinations.map((dest) => (
                  <div
                    key={dest.slug}
                    style={{ width: 'clamp(220px, 72vw, 320px)', flexShrink: 0, scrollSnapAlign: 'start' }}
                  >
                    <DestinationCard {...dest} />
                  </div>
                ))
              : packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    style={{ width: 'clamp(220px, 72vw, 320px)', flexShrink: 0, scrollSnapAlign: 'start' }}
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
