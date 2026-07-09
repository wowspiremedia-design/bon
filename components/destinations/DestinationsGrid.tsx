'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface DestinationItem {
  id: number
  slug: string
  title: string
  imageSrc: string | null
  region?: 'domestic' | 'international'
}

interface Props {
  destinations: DestinationItem[]
}

type Tab = 'all' | 'domestic' | 'international'

export default function DestinationsGrid({ destinations }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const filtered = destinations
    .filter((d) => {
      if (activeTab === 'domestic') return d.region === 'domestic'
      if (activeTab === 'international') return d.region === 'international'
      return true
    })
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <>
      {/* ── Tabs ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div
          className="inline-flex items-center gap-1 mx-auto"
          style={{
            padding: '6px',
            background: '#F3F1EC',
            border: '1px solid #E5E7EB',
            borderRadius: '9999px',
          }}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-full font-semibold text-sm transition-all duration-300${activeTab === 'all' ? '' : ' hover:bg-[#F9F7F4]'}`}
            style={{
              padding: '10px 28px',
              background: activeTab === 'all' ? '#1E6B2E' : 'transparent',
              color: activeTab === 'all' ? '#FFFFFF' : '#1A1A1A',
            }}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('domestic')}
            className={`rounded-full font-semibold text-sm transition-all duration-300${activeTab === 'domestic' ? '' : ' hover:bg-[#F9F7F4]'}`}
            style={{
              padding: '10px 28px',
              background: activeTab === 'domestic' ? '#1E6B2E' : 'transparent',
              color: activeTab === 'domestic' ? '#FFFFFF' : '#1A1A1A',
            }}
          >
            Domestic
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`rounded-full font-semibold text-sm transition-all duration-300${activeTab === 'international' ? '' : ' hover:bg-[#F9F7F4]'}`}
            style={{
              padding: '10px 28px',
              background: activeTab === 'international' ? '#1E6B2E' : 'transparent',
              color: activeTab === 'international' ? '#FFFFFF' : '#1A1A1A',
            }}
          >
            International
          </button>
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-20 text-base">
          No destinations found in this category.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((destination) => (
            <Link
              key={destination.id}
              href={`/destination/${destination.slug}`}
              className="group block rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative h-[200px]">
                {destination.imageSrc ? (
                  <Image
                    src={destination.imageSrc}
                    alt={destination.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: '#1E6B2E' }} />
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: '16px' }}>
                <p
                  className="font-semibold text-[#1A1A1A] leading-snug mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px' }}
                >
                  {destination.title}
                </p>
                <span
                  className="font-semibold"
                  style={{ color: '#1E6B2E', fontSize: '13px' }}
                >
                  Explore &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
