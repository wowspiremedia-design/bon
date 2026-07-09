import Image from 'next/image'
import Link from 'next/link'
import { getDestinations } from '@/lib/payload-api'

export default async function PopularDestinations() {
  const destinations = await getDestinations()
  const items = destinations
    .filter((d) => d.featuredImage !== null)
    .slice(0, 10)

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
            {items.map(({ id, title, slug, featuredImage }) => (
              <Link
                key={id}
                href={`/destination/${slug}`}
                className="flex flex-col items-center gap-[10px] flex-shrink-0 group"
              >
                {/* Circle */}
                <div
                  className="relative rounded-full overflow-hidden border-[3px] border-[#E0EBE1] group-hover:border-[#1E6B2E] transition-colors duration-200"
                  style={{ width: '90px', height: '90px' }}
                >
                  <Image
                    src={featuredImage?.url ?? ''}
                    alt={title}
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
                  {title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
