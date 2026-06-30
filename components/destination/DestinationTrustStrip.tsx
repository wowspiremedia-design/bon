interface Props {
  slug: string
}

const COMMON_ITEMS = [
  'Own Hotels',
  'Own Cars',
  'In-House On-Ground Support',
  'EMI Options',
  'Best Price Pan India',
]

const DESTINATION_TRUST_ITEMS: Record<string, string[]> = {
  andaman: [
    'Port Blair to Havelock Expertise',
    'Andaman Honeymoon Specialists',
    'Verified Island Hopping Routes',
    'Local Andaman Travel Desk',
    'Customized Andaman Itineraries',
  ],
}

const FALLBACK_ITEMS = [
  'Handpicked & Verified Packages',
  '13+ Years of Travel Expertise',
  'Transparent Pricing',
  'Dedicated Travel Expert Support',
  '24x7 WhatsApp Support',
]

function getDestinationTrustItems(slug: string): string[] {
  const s = slug.toLowerCase()
  for (const [key, items] of Object.entries(DESTINATION_TRUST_ITEMS)) {
    if (s.includes(key)) return items
  }
  return FALLBACK_ITEMS
}

const ICON_STYLE = {
  width: 'clamp(16px, 2vw, 20px)',
  height: 'clamp(16px, 2vw, 20px)',
  flexShrink: 0 as const,
}

function TrustIcon({ label }: { label: string }) {
  switch (label) {
    case 'Own Hotels':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <path d="M9 22v-6h6v6" />
          <line x1="8" y1="7" x2="11" y2="7" />
          <line x1="13" y1="7" x2="16" y2="7" />
          <line x1="8" y1="12" x2="11" y2="12" />
          <line x1="13" y1="12" x2="16" y2="12" />
        </svg>
      )
    case 'Own Cars':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 17H3V11l2.5-5h13L21 11v6h-2" />
          <circle cx="7.5" cy="17" r="2.5" />
          <circle cx="16.5" cy="17" r="2.5" />
          <line x1="3" y1="13" x2="21" y2="13" />
        </svg>
      )
    case 'In-House On-Ground Support':
    case 'Dedicated Travel Expert Support':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5z" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" />
        </svg>
      )
    case 'EMI Options':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    case 'Best Price Pan India':
    case 'Transparent Pricing':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    case 'Port Blair to Havelock Expertise':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )
    case 'Andaman Honeymoon Specialists':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'Verified Island Hopping Routes':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'Local Andaman Travel Desk':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      )
    case 'Customized Andaman Itineraries':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case 'Handpicked & Verified Packages':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )
    case '13+ Years of Travel Expertise':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      )
    case '24x7 WhatsApp Support':
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    default:
      return (
        <svg style={ICON_STYLE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )
  }
}

export default function DestinationTrustStrip({ slug }: Props) {
  const specific = getDestinationTrustItems(slug)

  const items: string[] = []
  for (let i = 0; i < 5; i++) {
    items.push(COMMON_ITEMS[i])
    items.push(specific[i])
  }

  const track = [...items, ...items]

  return (
    <>
      <style>{`
        @keyframes destTrustScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .dest-trust-track {
          animation: destTrustScroll 42s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E0EBE1',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: '20px 0',
        }}
      >
        <div
          className="dest-trust-track"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {track.map((label, i) => (
            <div
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {/* Vertical badge: icon centered above text */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'center',
                  padding: '0 8px',
                }}
              >
                <span style={{ color: '#1E6B2E' }}>
                  <TrustIcon label={label} />
                </span>
                <span
                  style={{
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                    fontWeight: 500,
                    color: '#444444',
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Separator dot, vertically centered */}
              <span
                aria-hidden="true"
                style={{
                  color: '#C8A96A',
                  fontSize: '18px',
                  padding: '0 16px',
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                ·
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
