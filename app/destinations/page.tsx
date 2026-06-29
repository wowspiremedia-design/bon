import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDestinations } from '@/lib/api'

export const metadata: Metadata = {
  title: 'All Destinations | Bon Voyagers',
  description: 'Explore all travel destinations across India with Bon Voyagers.',
}

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  return (
    <>
      {/* ── Page header ── */}
      <section className="bg-white py-14 md:py-20 text-center">
        <h1
          className="font-bold text-[#1A1A1A] mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)' }}
        >
          Explore the World&apos;s Best Travel Destinations
        </h1>
        <p className="text-gray-500 text-base max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          Discover handpicked destinations across mountains, beaches, spiritual journeys, and luxury escapes. Plan your perfect trip with expert-curated experiences from Bon Voyagers.
        </p>
      </section>

      {/* ── Destinations grid ── */}
      <section style={{ background: '#F9F7F4', padding: '48px 0 64px' }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: '1280px',
            padding: '0 clamp(16px, 4vw, 40px)',
          }}
        >
          {destinations.length === 0 ? (
            <p className="text-center text-gray-500 py-20 text-base">
              No destinations found.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {destinations.map((destination) => {
                const title = destination.title.rendered
                const slug = destination.slug
                const imageSrc =
                  destination._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                  (destination.images as any)?.hero?.full ||
                  null

                return (
                  <Link
                    key={destination.id}
                    href={`/destination/${slug}`}
                    className="group block rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-[200px]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={title}
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
                        {title}
                      </p>
                      <span
                        className="font-semibold"
                        style={{ color: '#1E6B2E', fontSize: '13px' }}
                      >
                        Explore &rarr;
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
