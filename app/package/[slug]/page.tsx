import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPackageBySlug } from '@/lib/payload-api'
import { lexicalToHtml } from '@/lib/lexicalToHtml'
import ItineraryAccordion from '@/components/package/ItineraryAccordion'
import FAQAccordion from '@/components/package/FAQAccordion'
import ShareButton from '@/components/package/ShareButton'
import SectionScrollSpy, { type ScrollSpySection } from '@/components/shared/SectionScrollSpy'
import { SECTION_NAV_SCROLL_OFFSET } from '@/components/shared/sectionScrollSpyConfig'
import EnquiryPopup from '@/components/shared/EnquiryPopup'

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return {}
  const title = pkg.seoTitle || pkg.title
  const description = pkg.seoDescription || ''
  const heroImage = pkg.images[0]?.url ?? ''
  return {
    title,
    description,
    alternates: {
      canonical: `/package/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: heroImage ? [{ url: heroImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: heroImage ? [heroImage] : [],
    },
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'

// Fixed content, identical on every package page, not sourced from WordPress.
const PRICE_CONDITIONS = [
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


// ── Page ───────────────────────────────────────────────────────────────────────

export default async function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  // ── Extract fields ──
  const route          = pkg.route
  const duration       = pkg.duration
  const people         = pkg.people
  const mapQuery       = pkg.mapQuery
  const weatherSummary  = pkg.weatherSummary
  const bestMonthsArr   = pkg.bestMonths

  // ── Itinerary ──
  const itineraryDays = pkg.itinerary.map((day) => ({
    day_label: day.dayLabel,
    day_title: day.dayTitle,
    day_description: day.dayDescription,
  }))

  const inclusions = pkg.inclusions.map((i) => i.item)
  const exclusions = pkg.exclusions.map((e) => e.item)

  // ── FAQs ──
  const faqs = pkg.faqs.map((f) => ({ question_label: f.question, answer_label: f.answer }))

  // ── Overview ──
  const shortDescriptionHtml = lexicalToHtml(pkg.shortDescription)

  // ── Pricing ──
  const price        = pkg.price
  const regularPrice = pkg.regularPrice
  const onSale       = pkg.onSale && regularPrice > price
  const discountPct  = onSale ? Math.round((1 - price / regularPrice) * 100) : 0
  const fmt          = (n: number) => '₹' + n.toLocaleString('en-IN')

  // ── Hero image ──
  const heroImage = pkg.images[0]?.url ?? ''
  const categoryName = pkg.category[0]?.name ?? ''

  // ── WhatsApp link ──
  const waMsg = encodeURIComponent(`Hi, I'm interested in the package: ${pkg.title}`)
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`

  // ── Scroll-spy sections ──
  const hasInclusionsSection = inclusions.length > 0 || exclusions.length > 0
  const hasBestTimeSection = Boolean(weatherSummary) || bestMonthsArr.length > 0

  const sections: ScrollSpySection[] = [
    ...(shortDescriptionHtml ? [{ id: 'section-overview', label: 'Overview' }] : []),
    ...(itineraryDays.length > 0 ? [{ id: 'section-itinerary', label: 'Itinerary' }] : []),
    ...(mapQuery ? [{ id: 'section-map', label: 'Map' }] : []),
    ...(hasInclusionsSection ? [{ id: 'section-inclusions', label: 'Inclusions & Exclusions' }] : []),
    ...(hasBestTimeSection ? [{ id: 'section-best-time', label: 'Best Time to Visit' }] : []),
    ...(faqs.length > 0 ? [{ id: 'section-faq', label: 'FAQ' }] : []),
    { id: 'section-price-conditions', label: 'Important Price & Package Conditions' },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden h-[480px] lg:h-[560px]" style={{ position: 'relative' }}>
        {heroImage && (
          <Image
            src={heroImage}
            alt={pkg.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)',
          }}
        />

        {/* Hero content */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}
        >
          <div className="mx-auto" style={{ maxWidth: '1280px' }}>
            {/* Title */}
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.25,
                marginBottom: '12px',
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              {pkg.title}
            </h1>

            {/* Route strip */}
            {route && (
              <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{route}</span>
              </div>
            )}

            {/* Share button */}
            <div style={{ marginBottom: '14px' }}>
              <ShareButton packageName={pkg.title} />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {duration && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  🕐 {duration}
                </span>
              )}
              {people > 0 && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  👥 {people}
                </span>
              )}
              {categoryName && (
                <span
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  📍 {categoryName}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0EBE1' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '10px clamp(16px, 4vw, 40px)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li><Link href="/" style={{ color: '#1E6B2E', fontWeight: 500 }}>Home</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              {categoryName && (
                <>
                  <li>
                    <Link href={`/packages?category=${pkg.category[0]?.slug ?? ''}`} style={{ color: '#1E6B2E', fontWeight: 500 }}>
                      {categoryName}
                    </Link>
                  </li>
                  <li style={{ color: '#AAAAAA' }}>›</li>
                </>
              )}
              <li style={{ color: '#888888' }}>
                {pkg.title.length > 40 ? pkg.title.slice(0, 40) + '…' : pkg.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto" style={{ maxWidth: '1280px', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px) 80px' }}>
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Left column (content) ── */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>

            {/* Sticky scroll-spy section nav, becomes sticky below the header once scrolled past the hero */}
            <SectionScrollSpy sections={sections} />

            {/* 1. Overview */}
            {shortDescriptionHtml && (
              <Section id="section-overview" title="Overview">
                <div
                  className="prose-content"
                  style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: shortDescriptionHtml }}
                />
              </Section>
            )}

            {/* 2. Itinerary */}
            {itineraryDays.length > 0 && (
              <Section id="section-itinerary" title="Itinerary">
                <ItineraryAccordion days={itineraryDays} />
              </Section>
            )}

            {/* 3. Map */}
            {mapQuery && (
              <Section id="section-map" title="Map">
                <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ fontSize: '14px', color: '#4A4A4A', fontWeight: 600 }}>{mapQuery}</span>
                </div>
                <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E0EBE1' }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&z=8`}
                    width="100%"
                    height="360"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map of ${mapQuery}`}
                  />
                </div>
              </Section>
            )}

            {/* 4. Inclusions & Exclusions */}
            {hasInclusionsSection && (
              <Section id="section-inclusions" title="Inclusions & Exclusions">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {inclusions.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1E6B2E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                        What&apos;s Included
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {inclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2" style={{ fontSize: '14px', color: '#4A4A4A' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusions.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#D90429', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                        Not Included
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {exclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2" style={{ fontSize: '14px', color: '#4A4A4A' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D90429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* 5. Best Time */}
            {hasBestTimeSection && (
              <Section id="section-best-time" title="Best Time to Visit">
                {weatherSummary && (
                  <p style={{ fontSize: '14px', color: '#4A4A4A', lineHeight: 1.8, marginBottom: '16px' }}>
                    {weatherSummary}
                  </p>
                )}
                {bestMonthsArr.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {bestMonthsArr.map((month) => (
                      <span
                        key={month}
                        style={{
                          background: '#E8F5E9',
                          color: '#1E6B2E',
                          border: '1px solid #1E6B2E',
                          borderRadius: '20px',
                          padding: '5px 14px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ marginRight: '4px' }}>✓</span>{month}
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* 6. FAQ */}
            {faqs.length > 0 && (
              <Section id="section-faq" title="Frequently Asked Questions">
                <FAQAccordion faqs={faqs} />
              </Section>
            )}

            {/* 7. Important Price & Package Conditions (fixed, identical on every package) */}
            <Section id="section-price-conditions" title="Important Price & Package Conditions">
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
            </Section>
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
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}
          >
            <BookingSidebar
              price={price}
              regularPrice={regularPrice}
              onSale={onSale}
              discountPct={discountPct}
              waLink={waLink}
              fmt={fmt}
              packageTitle={pkg.title}
              duration={duration}
              packageId={pkg.id}
              heroImage={heroImage}
              waNumber={WA_NUMBER}
            />

            {pkg.brochure && (
              <Link
                href={pkg.brochure.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-[#F7FAF7]"
                style={{
                  marginTop: '16px',
                  border: '1px solid #E0EBE1',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#1E6B2E',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: '#FFFFFF',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Brochure
              </Link>
            )}
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
        <div>
          {onSale && (
            <p className="line-through leading-none" style={{ fontSize: '12px', color: '#AAAAAA', marginBottom: '2px' }}>
              {fmt(regularPrice)}
            </p>
          )}
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#1E6B2E', lineHeight: 1 }}>
            {fmt(price)}
          </p>
          <p style={{ fontSize: '11px', color: '#888888' }}>per person</p>
        </div>

        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <div style={{ width: '130px' }}>
            <EnquiryPopup
              packageTitle={pkg.title}
              duration={duration}
              price={price}
              regularPrice={regularPrice}
              packageId={pkg.id}
              imageUrl={heroImage}
              waNumber={WA_NUMBER}
            />
          </div>

          <Link
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px 24px',
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            WhatsApp Us
          </Link>
        </div>
      </div>
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

// ── Booking sidebar ────────────────────────────────────────────────────────────

function BookingSidebar({
  price,
  regularPrice,
  onSale,
  discountPct,
  waLink,
  fmt,
  packageTitle,
  duration,
  packageId,
  heroImage,
  waNumber,
}: {
  price: number
  regularPrice: number
  onSale: boolean
  discountPct: number
  waLink: string
  fmt: (n: number) => string
  packageTitle: string
  duration: string
  packageId: number
  heroImage: string
  waNumber: string
}) {
  const TRUST = [
    { icon: '✓', label: 'Free Cancellation', sub: 'Cancel up to 7 days before' },
    { icon: '⚡', label: 'Instant Confirmation', sub: 'Get your booking confirmed now' },
    { icon: '🎧', label: 'Expert Support', sub: '24/7 travel assistance' },
  ]

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E0EBE1',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      {/* Price */}
      <div style={{ marginBottom: '20px' }}>
        {onSale && (
          <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
            <p className="line-through" style={{ fontSize: '14px', color: '#AAAAAA' }}>
              {fmt(regularPrice)}
            </p>
            <span
              style={{
                background: '#D90429',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '9999px',
              }}
            >
              {discountPct}% OFF
            </span>
          </div>
        )}
        <p style={{ fontSize: '32px', fontWeight: 800, color: '#1E6B2E', lineHeight: 1 }}>
          {fmt(price)}
        </p>
        <p style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>per person</p>
      </div>

      {/* WhatsApp CTA */}
      <Link
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center transition-opacity duration-200 hover:opacity-90"
        style={{
          background: '#25D366',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '15px',
          padding: '14px',
          borderRadius: '10px',
          marginBottom: '10px',
        }}
      >
        💬 Chat on WhatsApp
      </Link>

      {/* Enquire Now */}
      <div style={{ marginBottom: '20px' }}>
        <EnquiryPopup
          packageTitle={packageTitle}
          duration={duration}
          price={price}
          regularPrice={regularPrice}
          packageId={packageId}
          imageUrl={heroImage}
          waNumber={waNumber}
        />
      </div>

      {/* Trust items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {TRUST.map((t) => (
          <div key={t.label} className="flex items-start gap-3">
            <span
              style={{
                flexShrink: 0,
                width: '28px',
                height: '28px',
                background: '#E8F5E9',
                color: '#1E6B2E',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {t.icon}
            </span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{t.label}</p>
              <p style={{ fontSize: '11px', color: '#888888' }}>{t.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
