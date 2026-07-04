import type { Metadata } from 'next'
import CarComingSoonIllustration from '@/components/cars/CarComingSoonIllustration'
import EnquireNowButton from '@/components/cars/EnquireNowButton'

export const metadata: Metadata = {
  title: 'Car Rentals | Coming Soon | Bon Voyagers',
  description: 'Car rentals are coming soon to Bon Voyagers. Enquire now and we will help you book the right ride for your trip.',
}

export default async function CarsPage() {
  return (
    <div
      className="mx-auto flex flex-col items-center text-center"
      style={{ maxWidth: '680px', padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 40px)' }}
    >
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '24px' }}>
        <CarComingSoonIllustration />
      </div>

      <h1
        className="font-display"
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 700,
          color: '#1A1A1A',
          lineHeight: 1.2,
          margin: 0,
          fontFamily: 'var(--font-playfair)',
        }}
      >
        Coming soon
      </h1>

      <p style={{ fontSize: '15px', color: '#4A4A4A', marginTop: '12px', marginBottom: '28px' }}>
        Car rentals for every route. Book or enquire soon.
      </p>

      <EnquireNowButton />
    </div>
  )
}
