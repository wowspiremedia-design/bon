import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getHotelBySlug } from '@/lib/hotels-api'
import { decodeHtmlEntities } from '@/lib/decodeHtmlEntities'
import HotelGallery from '@/components/hotels/HotelGallery'
import CheckAvailabilityButton from '@/components/hotels/CheckAvailabilityButton'
import HotelWhatsAppFloat from '@/components/hotels/HotelWhatsAppFloat'
import SectionScrollSpy, { type ScrollSpySection } from '@/components/shared/SectionScrollSpy'
import { SECTION_NAV_SCROLL_OFFSET } from '@/components/shared/sectionScrollSpyConfig'
import { AmenityIcon } from '@/components/hotels/AmenityIcon'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

// Rank Math does not expose rank_math_title, rank_math_description or
// rank_math_focus_keyword through the WordPress REST API for this site
// (confirmed empty, see the curl test in the task notes), so metadata
// always falls back to this derived title/description.
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated).trim()
}

function formatTime(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return time
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes} ${period}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)
  if (!hotel) return {}
  const title = decodeHtmlEntities(hotel.title)
  const metaTitle = hotel.location ? `${title} | ${hotel.location} | Bon Voyagers` : `${title} | Bon Voyagers`
  const metaDescription = hotel.overview ? truncateAtWordBoundary(hotel.overview, 155) : undefined
  return {
    title: metaTitle,
    ...(metaDescription ? { description: metaDescription } : {}),
  }
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const hotel = await getHotelBySlug(slug)
  if (!hotel) notFound()

  const title = decodeHtmlEntities(hotel.title)

  const hasAmenitiesSection = hotel.amenities.length > 0 || hotel.foodType.length > 0
  const hasRoomsSection = hotel.roomPricing.length > 0
  const hasSightseeingSection = Boolean(hotel.sightseeing)

  const coupleFriendly = hotel.compatibility.includes('Couple Friendly')
  const localIdFriendly = hotel.compatibility.includes('Local ID Friendly')
  const petsAllowed = hotel.compatibility.includes('Pets Allowed')
  const hasRulesSection = hotel.kitchenAvailability || coupleFriendly || localIdFriendly || petsAllowed
  const hasLocationSection = Boolean(hotel.location)

  const sections: ScrollSpySection[] = [
    ...(hotel.overview ? [{ id: 'section-overview', label: 'Overview' }] : []),
    ...(hasAmenitiesSection ? [{ id: 'section-amenities', label: 'Amenities' }] : []),
    ...(hasRoomsSection ? [{ id: 'section-rooms', label: 'Rooms' }] : []),
    ...(hasSightseeingSection ? [{ id: 'section-sightseeing', label: 'Sightseeing' }] : []),
    ...(hasRulesSection ? [{ id: 'section-rules', label: 'Rules' }] : []),
    ...(hasLocationSection ? [{ id: 'section-location', label: 'Location' }] : []),
  ]

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0EBE1' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '10px clamp(16px, 4vw, 40px)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li><Link href="/" style={{ color: '#1E6B2E', fontWeight: 500 }}>Home</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li><Link href="/hotels" style={{ color: '#1E6B2E', fontWeight: 500 }}>Hotels</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li style={{ color: '#888888' }}>
                {title.length > 40 ? title.slice(0, 40) + '…' : title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto" style={{ maxWidth: '1280px', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px) 80px' }}>

        {/* 1. Image gallery, spans full width above the two-column split */}
        <HotelGallery images={hotel.gallery.length > 0 ? hotel.gallery : (hotel.image ? [hotel.image] : [])} title={title} />

        {/* Sticky scroll-spy section nav, becomes sticky below the header once scrolled past the gallery */}
        <SectionScrollSpy sections={sections} />

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left column (content) ── */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>

            {/* 2. Title, badges, location, address */}
            <div style={{ marginTop: '24px', marginBottom: '32px' }}>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  lineHeight: 1.25,
                  marginBottom: '12px',
                  fontFamily: 'var(--font-playfair)',
                }}
              >
                {title}
              </h1>

              <div className="flex flex-wrap gap-2" style={{ marginBottom: '14px' }}>
                {hotel.propertyCategory && <Badge label={hotel.propertyCategory} />}
                {hotel.propertyType && <Badge label={hotel.propertyType} />}
                {hotel.viewType.map((view) => (
                  <Badge key={view} label={view} icon={<AmenityIcon name={view} size={12} />} />
                ))}
              </div>

              {hotel.location && (
                <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ fontSize: '14px', color: '#4A4A4A', fontWeight: 600 }}>{hotel.location}</span>
                </div>
              )}

              {hotel.address && (
                <p style={{ fontSize: '13px', color: '#888888', marginLeft: '22px' }}>{hotel.address}</p>
              )}
            </div>

            {/* 3. Overview */}
            {hotel.overview && (
              <Section id="section-overview" title="Overview">
                <div style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {hotel.overview}
                </div>
              </Section>
            )}

            {/* 4. Amenities, Food Type */}
            {hasAmenitiesSection && (
              <Section id="section-amenities" title="Amenities & Facilities">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {hotel.amenities.length > 0 && (
                    <IconLabelGroup title="Amenities" items={hotel.amenities} useAmenityIcons />
                  )}
                  {hotel.foodType.length > 0 && (
                    <IconLabelGroup title="Food Type" items={hotel.foodType} useAmenityIcons />
                  )}
                </div>
              </Section>
            )}

            {/* 5. Room Types */}
            {hasRoomsSection && (
              <Section id="section-rooms" title="Room Types">
                <div className="flex flex-wrap" style={{ gap: '10px' }}>
                  {hotel.roomPricing.map((room, i) => (
                    <span
                      key={`${room.name}-${i}`}
                      style={{
                        display: 'inline-block',
                        border: '1px solid #C8E6C9',
                        background: '#E8F5E9',
                        color: '#1E6B2E',
                        borderRadius: '9999px',
                        padding: '10px 18px',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {room.name}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* 6. Sightseeing */}
            {hasSightseeingSection && (
              <Section id="section-sightseeing" title="Sightseeing">
                <div style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                  {hotel.sightseeing}
                </div>
              </Section>
            )}

            {/* 7. Rules */}
            {hasRulesSection && (
              <Section id="section-rules" title="Rules">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <RuleRow label="Kitchen Availability" value={hotel.kitchenAvailability ? 'Yes' : 'No'} />
                  <RuleRow label="Couple Friendly" value={coupleFriendly ? 'Yes' : 'No'} />
                  <RuleRow label="Local ID Friendly" value={localIdFriendly ? 'Yes' : 'No'} />
                  <RuleRow label="Pets Allowed" value={petsAllowed ? 'Yes' : 'No'} />
                  <RuleRow label="Check-in Time" value={formatTime(hotel.checkinTime)} />
                  <RuleRow label="Check-out Time" value={formatTime(hotel.checkoutTime)} />
                </div>
              </Section>
            )}

            {/* 8. Location */}
            {hasLocationSection && (
              <Section id="section-location" title="Location">
                <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ fontSize: '14px', color: '#4A4A4A', fontWeight: 600 }}>{hotel.location}</span>
                </div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0EBE1' }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.location)}&output=embed&z=8`}
                    width="100%"
                    height="360"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${hotel.location}`}
                  />
                </div>
              </Section>
            )}
          </div>

          {/* ── Right column (sticky sidebar) ── */}
          <div
            className="hidden lg:block"
            style={{
              width: '340px',
              flexShrink: 0,
              position: 'sticky',
              top: '100px',
              alignSelf: 'flex-start',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E0EBE1',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              {hotel.startingPrice !== null && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#888888', marginBottom: '4px' }}>Starting from</p>
                  <div className="flex items-baseline gap-2">
                    <p style={{ fontSize: '30px', fontWeight: 800, color: '#1E6B2E', lineHeight: 1 }}>
                      {fmt(hotel.startingPrice)}
                    </p>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#888888' }}>+ taxes</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>per room</p>
                </div>
              )}

              <CheckAvailabilityButton hotelName={title} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div
        className="flex items-center justify-between gap-3 lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E0EBE1',
          padding: '12px 16px',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.10)',
        }}
      >
        {hotel.startingPrice !== null ? (
          <div>
            <div className="flex items-baseline gap-1">
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#1E6B2E', lineHeight: 1 }}>
                {fmt(hotel.startingPrice)}
              </p>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#888888' }}>+ taxes</span>
            </div>
            <p style={{ fontSize: '11px', color: '#888888' }}>per room</p>
          </div>
        ) : <div />}

        <div style={{ flex: '1 1 0', maxWidth: '220px' }}>
          <CheckAvailabilityButton hotelName={title} />
        </div>
      </div>

      <HotelWhatsAppFloat hotelName={title} />
    </>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '40px', scrollMarginTop: `${SECTION_NAV_SCROLL_OFFSET}px` }}>
      <h2
        className="font-display"
        style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: '2px solid #E8F5E9',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function RuleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
      <span style={{ fontSize: '13px', color: '#888888' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{value}</span>
    </div>
  )
}

function Badge({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <span
      className="flex items-center gap-1"
      style={{
        background: '#E8F5E9',
        color: '#1E6B2E',
        border: '1px solid #C8E6C9',
        fontSize: '12px',
        fontWeight: 700,
        padding: '5px 12px',
        borderRadius: '9999px',
      }}
    >
      {icon}
      {label}
    </span>
  )
}

function IconLabelGroup({ title, items, useAmenityIcons }: { title: string; items: string[]; useAmenityIcons?: boolean }) {
  return (
    <div>
      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#1E6B2E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2" style={{ fontSize: '13px', color: '#4A4A4A' }}>
            <span style={{ flexShrink: 0, display: 'flex' }}>
              {useAmenityIcons ? (
                <AmenityIcon name={item} size={14} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
