import Link from 'next/link'

const WA_LINK =
  "https://wa.me/919836755550?text=I'm%20interested%20to%20plan%20a%20trip%20with%20Bon%20Voyagers.%20Please%20assist%20me."

export default function CTASection() {
  return (
    <section
      className="w-full text-center"
      style={{
        background: 'linear-gradient(135deg, #0D3B1E 0%, #1E6B2E 100%)',
        padding: 'clamp(48px, 7vw, 72px) clamp(16px, 4vw, 40px)',
      }}
    >
      {/* Heading */}
      <h2
        className="font-display mx-auto"
        style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.35,
          maxWidth: '720px',
        }}
      >
        We don&apos;t just create itineraries —
        <br />
        we create{' '}
        <span style={{ color: '#C8A96A' }}>journeys for a lifetime.</span>
      </h2>

      {/* Subtext */}
      <p
        className="mx-auto"
        style={{
          marginTop: '12px',
          fontSize: '16px',
          color: 'rgba(255,255,255,0.75)',
          maxWidth: '480px',
        }}
      >
        Simple steps. Expert guidance. Memories that last forever.
      </p>

      {/* Buttons */}
      <div
        className="flex flex-wrap items-center justify-center"
        style={{ marginTop: '32px', gap: '14px' }}
      >
        <Link
          href="/packages"
          className="transition-opacity duration-200 hover:opacity-85"
          style={{
            background: '#C8A96A',
            color: '#0D3B1E',
            fontWeight: 700,
            padding: '15px 34px',
            borderRadius: '10px',
            fontSize: '15px',
            whiteSpace: 'nowrap',
          }}
        >
          Explore All Packages
        </Link>

        <Link
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:bg-white/10"
          style={{
            border: '2px solid rgba(255,255,255,0.45)',
            color: '#FFFFFF',
            fontWeight: 600,
            padding: '15px 34px',
            borderRadius: '10px',
            fontSize: '15px',
            whiteSpace: 'nowrap',
          }}
        >
          💬 Chat on WhatsApp
        </Link>
      </div>
    </section>
  )
}
