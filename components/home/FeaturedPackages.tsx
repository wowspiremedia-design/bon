'use client'

import Link from 'next/link'
import { useState } from 'react'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'

const PACKAGES: PackageCardProps[] = [
  {
    id: 1,
    title: 'Rewarding 7 Days Kashmir Tour Package | Premium Valley Escape',
    slug: 'kashmir-premium-valley',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/10/kashmir.jpg',
    price: 59499,
    regularPrice: 72499,
    onSale: true,
    duration: '7 Days 6 Nights',
    rating: 4.9,
    reviewCount: 128,
    destination: 'Kashmir',
    badgeType: 'bestseller',
  },
  {
    id: 2,
    title: 'Pristine 5 Days Andaman Honeymoon Package | Beach Paradise',
    slug: 'andaman-honeymoon-paradise',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2018/12/andaman.jpg',
    price: 43199,
    regularPrice: 48999,
    onSale: true,
    duration: '5 Days 4 Nights',
    rating: 4.8,
    reviewCount: 89,
    destination: 'Andaman',
    badgeType: 'honeymoon',
  },
  {
    id: 3,
    title: 'Epic 6 Days Meghalaya Tour | Living Root Bridges and Waterfalls',
    slug: 'meghalaya-living-roots',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/09/10-2-150x150.webp',
    price: 29249,
    regularPrice: 38999,
    onSale: true,
    duration: '6 Days 5 Nights',
    rating: 5.0,
    reviewCount: 64,
    destination: 'Meghalaya',
    badgeType: 'deal',
  },
  {
    id: 4,
    title: 'Majestic 8 Days Ladakh Adventure | Pangong and Nubra Valley',
    slug: 'ladakh-pangong-nubra',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/11/ladakh-package.jpg',
    price: 67499,
    regularPrice: 89999,
    onSale: true,
    duration: '8 Days 7 Nights',
    rating: 5.0,
    reviewCount: 47,
    destination: 'Ladakh',
    badgeType: 'luxury',
  },
  {
    id: 5,
    title: 'Breathtaking 5 Days Bhutan Tour Package | Kingdom of Happiness',
    slug: 'bhutan-kingdom-happiness',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/09/Best-Europe-Trip-Package054-150x150.webp',
    price: 52999,
    regularPrice: 62999,
    onSale: true,
    duration: '5 Days 4 Nights',
    rating: 4.7,
    reviewCount: 93,
    destination: 'Bhutan',
    badgeType: 'bestseller',
  },
  {
    id: 6,
    title: 'Serene 4 Days Darjeeling Tour | Tea Gardens and Tiger Hill Sunrise',
    slug: 'darjeeling-tea-tiger-hill',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/08/manali-package-7-150x150.webp',
    price: 18999,
    regularPrice: 24999,
    onSale: true,
    duration: '4 Days 3 Nights',
    rating: 4.8,
    reviewCount: 156,
    destination: 'Darjeeling',
    badgeType: 'budget',
  },
]

const TABS = ['All', 'Kashmir', 'Andaman', 'Meghalaya', 'Ladakh', 'Bhutan', 'Darjeeling']

export default function FeaturedPackages() {
  const [activeTab, setActiveTab] = useState('All')

  const filtered =
    activeTab === 'All'
      ? PACKAGES
      : PACKAGES.filter((p) => p.destination === activeTab)

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
            <p style={{ fontSize: '14px', color: '#888888' }}>
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
          {TABS.map((tab) => {
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
                  color: isActive ? '#FFFFFF' : '#888888',
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

        {/* Empty state */}
        {filtered.length === 0 && (
          <p className="text-center py-16" style={{ color: '#888888', fontSize: '14px' }}>
            No packages found for this destination.
          </p>
        )}
      </div>
    </section>
  )
}
