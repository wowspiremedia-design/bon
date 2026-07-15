'use client'

import Link from 'next/link'
import { useState } from 'react'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'

interface Props {
  packages: PackageCardProps[]
  tabs: string[]
}

export default function FeaturedPackagesClient({ packages, tabs }: Props) {
  const [activeTab, setActiveTab] = useState('All')

  const filtered =
    activeTab === 'All'
      ? packages
      : packages.filter((p) => p.destination === activeTab)

  return (
    <section style={{ background: '#FFFFFF' }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          padding: 'clamp(40px, 5vw, 56px) clamp(16px, 4vw, 40px)',
        }}
      >
        {/* ── Section header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p
              className="mb-2"
              style={{
                color: '#1E6B2E',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Popular Packages
            </p>
            <h2
              className="font-display mb-2"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: '#1A1A1A' }}
            >
              Top Packages From Kolkata
            </h2>
            <p style={{ fontSize: '14px', color: '#6B6B6B' }}>
              Handpicked journeys curated by our travel experts
            </p>
          </div>

          <Link
            href="/packages"
            className="flex-shrink-0 font-semibold transition-colors duration-200 hover:opacity-75"
            style={{ color: '#1E6B2E', fontSize: '14px' }}
          >
            View All →
          </Link>
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const isActive = tab === activeTab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-shrink-0 transition-colors duration-200"
                style={{
                  borderRadius: '9999px',
                  padding: '7px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isActive ? '#1E6B2E' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B6B6B',
                  border: isActive ? '1px solid #1E6B2E' : '1px solid #E0EBE1',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* ── Cards grid ── */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: '24px' }}
        >
          {filtered.map((pkg) => (
            <PackageCard key={pkg.id} {...pkg} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-16" style={{ color: '#888888', fontSize: '14px' }}>
            No packages found for this destination.
          </p>
        )}
      </div>
    </section>
  )
}
