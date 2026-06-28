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
    <section style={{ background: bgColor, padding: 'clamp(40px, 5vw, 56px) 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ── Row header ── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p
              className="mb-1"
              style={{ color: '#C8A96A', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              <span className="mr-2">{emoji}</span>BON COLLECTION
            </p>
            <h2
              className="font-display mb-2"
              style={{ fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}
            >
              {name}
            </h2>
            {description && (
              <p style={{ fontSize: '14px', color: '#666666', maxWidth: '480px', lineHeight: 1.5 }}>
                {description}
              </p>
            )}
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1 mt-3 font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{ color: '#1E6B2E', fontSize: '13px' }}
            >
              View all in this collection
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* Scroll arrows */}
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <button
              aria-label="Scroll left"
              onClick={() => scroll('left')}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `2px solid ${canLeft ? '#1E6B2E' : '#CCCCCC'}`,
                background: canLeft ? '#1E6B2E' : 'transparent',
                color: canLeft ? '#FFFFFF' : '#CCCCCC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canLeft ? 'pointer' : 'default',
                transition: 'all 0.2s',
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              ‹
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scroll('right')}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `2px solid ${canRight ? '#1E6B2E' : '#CCCCCC'}`,
                background: canRight ? '#1E6B2E' : 'transparent',
                color: canRight ? '#FFFFFF' : '#CCCCCC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canRight ? 'pointer' : 'default',
                transition: 'all 0.2s',
                fontSize: '16px',
                lineHeight: 1,
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* ── Scrollable cards track ── */}
        <div className="relative">
          {/* Left fade */}
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 z-10"
            style={{
              width: 48,
              background: `linear-gradient(to right, ${bgColor}, transparent)`,
              opacity: canLeft ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          />
          {/* Right fade */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 z-10"
            style={{
              width: 48,
              background: `linear-gradient(to left, ${bgColor}, transparent)`,
              opacity: canRight ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          />

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
                style={{ width: 'clamp(260px, 28vw, 320px)', flexShrink: 0 }}
              >
                <PackageCard {...pkg} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
