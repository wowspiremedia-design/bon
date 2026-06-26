'use client'

import Image from 'next/image'
import Link from 'next/link'

const COLLECTIONS = [
  {
    name: 'Bon Sanatan Path',
    slug: 'bon-sanatan-path',
    description: 'Sacred spiritual journeys across India',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2026/03/char-dham-helicopter-tour-2026-scaled.png',
  },
  {
    name: 'Bon Honeymoon Diaries',
    slug: 'bon-honeymoon-diaries',
    description: 'Romantic escapes for couples',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/10/kashmir.jpg',
  },
  {
    name: 'Bon Host of Himalayas',
    slug: 'kashmir/bon-host-of-himalayas',
    description: 'Premium Himalayan experiences',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/11/ladakh-package.jpg',
  },
  {
    name: 'Bon Weekend Escapes',
    slug: 'bon-weekend-escapes',
    description: 'Quick getaways from the city',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2018/12/andaman.jpg',
  },
]

export default function CollectionsSection() {
  return (
    <>
      <style>{`
        .collection-card {
          transition: box-shadow 0.3s ease;
        }
        .collection-card:hover {
          box-shadow: inset 0 3px 0 #C8A96A;
        }
      `}</style>

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
                  color: '#C8A96A',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Bon Collections
              </p>
              <h2
                className="font-display mb-2"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 700,
                  color: '#1A1A1A',
                }}
              >
                Curated Travel Experiences
              </h2>
              <p style={{ fontSize: '14px', color: '#888888' }}>
                Handcrafted journeys designed for every kind of traveller
              </p>
            </div>

            <Link
              href="/collections"
              className="flex-shrink-0 font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{ color: '#1E6B2E', fontSize: '14px' }}
            >
              View All →
            </Link>
          </div>

          {/* ── Cards grid ── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ gap: '20px' }}
          >
            {COLLECTIONS.map(({ name, slug, description, image }) => (
              <Link
                key={slug}
                href={`/collection/${slug}`}
                className="collection-card group relative block rounded-[16px] overflow-hidden cursor-pointer"
                style={{ height: '220px' }}
              >
                {/* Background image */}
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  className="transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
                  }}
                />

                {/* Bottom-left content */}
                <div className="absolute bottom-0 left-0 p-4">
                  <h3
                    className="mb-[4px]"
                    style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {name}
                  </h3>
                  <p
                    className="mb-[8px]"
                    style={{ color: 'rgba(255,255,255,0.80)', fontSize: '13px', lineHeight: 1.4 }}
                  >
                    {description}
                  </p>
                  <span
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: '#FFFFFF', fontSize: '16px' }}
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
