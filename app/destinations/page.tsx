import type { Metadata } from 'next'
import { getDestinations } from '@/lib/payload-api'
import DestinationsGrid from '@/components/destinations/DestinationsGrid'

export const metadata: Metadata = {
  title: 'All Destinations | Bon Voyagers',
  description: 'Explore all travel destinations across India with Bon Voyagers.',
}

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  const items = destinations.map((destination) => ({
    id: destination.id,
    slug: destination.slug,
    title: destination.title,
    imageSrc: destination.featuredImage?.url ?? null,
    region: destination.region,
  }))

  return (
    <>
      {/* ── Page header ── */}
      <section className="bg-white py-10 md:py-16 px-6 md:px-10 text-center">
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
      <section style={{ background: '#F9F7F4', padding: 'clamp(24px, 5vw, 48px) 0 64px' }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: '1280px',
            padding: '0 clamp(16px, 4vw, 40px)',
          }}
        >
          <DestinationsGrid destinations={items} />
        </div>
      </section>
    </>
  )
}
