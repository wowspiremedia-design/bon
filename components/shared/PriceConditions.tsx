// Single source of truth for the "Important Price & Package Conditions"
// block. Originally lived only inside app/package/[slug]/page.tsx as a
// local PRICE_CONDITIONS constant + inline JSX; extracted here so both
// regular Package pages and Fixed Departure package pages can render the
// exact same content and structure. Fixed content, identical on every
// page that renders it — not sourced from Payload, not per-package.
//
// Callers are responsible for their own Section/heading wrapper (each
// route already has its own local Section helper with slightly different
// props — id + scroll-spy offset on the Package page, no id on Fixed
// Departure — matching this codebase's established per-page Section
// duplication pattern rather than introducing a new shared one here).
// This component renders only the shaded box itself.

const PRICE_CONDITIONS = [
  "The per-person price shown is valid only when the package's minimum group size is met; a smaller group will be quoted a different, typically higher, per-person rate.",
  'Prices are subject to availability and may vary based on travel dates, hotel selection, and seasonal demand.',
  'The actual price is reconfirmed at the time of booking. Discounts or deals may apply depending on ongoing promotions.',
  'Prices displayed do not include optional add-ons such as cab upgrades, special activities, or extra room categories unless mentioned.',
  'For group bookings, custom itineraries, or peak season travel, final pricing may differ. Please connect with our travel expert.',
  '50% advance payment confirms your booking.',
  'Remaining balance is due 45 days before travel.',
  'Natural disasters or political unrest will be handled on a case-by-case basis.',
  'Valid for Indian nationals only. International guests may require special permits.',
  'Carry original government ID for all hotels.',
  'Secure payments and flexible policies.',
  '24x7 emergency support during travel.',
]

export default function PriceConditions() {
  return (
    <div
      style={{
        background: '#F1F5F9',
        border: '1px solid #DDE6ED',
        borderRadius: '12px',
        padding: '20px 24px',
      }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <circle cx="12" cy="8" r="0.75" fill="#1E6B2E" stroke="none" />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Please Note</span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PRICE_CONDITIONS.map((item, i) => (
          <li key={i} className="flex items-start gap-3" style={{ fontSize: '14px', color: '#4A4A4A', lineHeight: 1.6 }}>
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#D90429',
                marginTop: '8px',
              }}
            />
            {item}
          </li>
        ))}
      </ul>

      <div style={{ borderTop: '1px solid #DDE6ED', margin: '18px 0 14px' }} />

      <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#888888' }}>
        Bon Voyagers strives to provide transparent pricing. For clarity or a custom quote, please contact our support team.
      </p>
    </div>
  )
}
