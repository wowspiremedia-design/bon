'use client'

import Image from 'next/image'
import Link from 'next/link'

const DESTINATIONS = [
  {
    name: 'Kashmir',
    slug: 'kashmir-tour-package',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/10/kashmir.jpg',
  },
  {
    name: 'Andaman',
    slug: 'andaman-packages',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2018/12/andaman.jpg',
  },
  {
    name: 'Meghalaya',
    slug: 'stunning-meghalaya-trip-package',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/09/10-2-150x150.webp',
  },
  {
    name: 'Ladakh',
    slug: 'ladakh-tour-packages',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/11/ladakh-package.jpg',
  },
  {
    name: 'Bhutan',
    slug: 'bhutan-tourism-packages',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/09/Best-Europe-Trip-Package054-150x150.webp',
  },
  {
    name: 'Darjeeling',
    slug: 'darjeeling-tour-package',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/08/manali-package-7-150x150.webp',
  },
  {
    name: 'Kerala',
    slug: 'kerala-trip-package-best-places',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/08/kerala-trip-package-11-150x150.webp',
  },
  {
    name: 'Rajasthan',
    slug: 'rajasthan-tour-heritage-adventure',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/08/2-4-150x150.webp',
  },
  {
    name: 'Sikkim',
    slug: 'sikkim-tourism-himalayan-adventures',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/09/Arunachal-travel-package-with-Tawang-monastery-Ziro-valley-tribal-festival-Namdapha-jungle-6-150x150.webp',
  },
  {
    name: 'Nepal',
    slug: 'best-nepal-tour-package-destinations',
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2025/07/nepal-tour-package-4.png',
  },
]

export default function PopularDestinations() {
  return (
    <>
      <style>{`
        .dest-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <section style={{ background: '#F7F9F7' }}>
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
                Explore India
              </p>
              <h2
                className="font-display mb-2"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 700,
                  color: '#1A1A1A',
                }}
              >
                Popular Destinations
              </h2>
              <p style={{ fontSize: '14px', color: '#888888' }}>
                Choose your next adventure
              </p>
            </div>

            <Link
              href="/destinations"
              className="flex-shrink-0 font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{ color: '#1E6B2E', fontSize: '14px' }}
            >
              View All →
            </Link>
          </div>

          {/* ── Scrollable destination circles ── */}
          <div
            className="dest-scroll flex gap-6 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {DESTINATIONS.map(({ name, slug, image }) => (
              <Link
                key={slug}
                href={`/destination/${slug}`}
                className="flex flex-col items-center gap-[10px] flex-shrink-0 group"
              >
                {/* Circle */}
                <div
                  className="relative rounded-full overflow-hidden border-[3px] border-[#E0EBE1] group-hover:border-[#1E6B2E] transition-colors duration-200"
                  style={{ width: '90px', height: '90px' }}
                >
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="90px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Name */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
