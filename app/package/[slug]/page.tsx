import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPackageBySlug } from '@/lib/api'
import ItineraryAccordion from '@/components/package/ItineraryAccordion'
import FAQAccordion from '@/components/package/FAQAccordion'

// ── Helpers ────────────────────────────────────────────────────────────────────

type MetaArr = Array<{ key: string; value: unknown }>

function getMeta(meta: MetaArr, key: string): string {
  const item = meta.find((m) => m.key === key)
  return typeof item?.value === 'string' ? item.value : ''
}

function getMetaValues(meta: MetaArr, key: string): string[] {
  const item = meta.find((m) => m.key === key)
  if (!item) return []
  if (Array.isArray(item.value)) return item.value.filter((v): v is string => typeof v === 'string')
  if (typeof item.value === 'string') return item.value.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

function getMetaList(meta: MetaArr, prefix: string, field: string): string[] {
  const results: string[] = []
  let i = 0
  while (true) {
    const val = getMeta(meta, `${prefix}${i}_${field}`)
    if (!val) break
    results.push(val)
    i++
  }
  return results
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return {}
  const meta = pkg.meta_data
  return {
    title: getMeta(meta, 'rank_math_title') || pkg.name,
    description: getMeta(meta, 'rank_math_description') || '',
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'


// ── Page ───────────────────────────────────────────────────────────────────────

export default async function PackagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  const meta = pkg.meta_data

  // ── Extract meta fields ──
  const route          = getMeta(meta, '_package_place')
  const duration       = getMeta(meta, '_package_days_duration')
  const people         = getMeta(meta, '_package_people')
  const mapQuery       = getMeta(meta, 'map_query')
  const weatherSummary  = getMeta(meta, 'weather_summary')
  const bestMonthsArr   = getMetaValues(meta, 'best_months')

  // ── Itinerary ──
  const itineraryDays = (() => {
    const days = []
    let i = 0
    while (true) {
      const label = getMeta(meta, `package_itinerary_${i}_day_label`)
      const title = getMeta(meta, `package_itinerary_${i}_day_title`)
      const desc  = getMeta(meta, `package_itinerary_${i}_day_description`)
      if (!label && !title && !desc) break
      days.push({ day_label: label, day_title: title, day_description: desc })
      i++
    }
    return days
  })()

  const inclusions = getMetaList(meta, 'package_inclusions_', 'inclusion_item')
  const exclusions = getMetaList(meta, 'package_exclusions_', 'exclusion_item')

  // ── FAQs ──
  const faqs = (() => {
    const items = []
    let i = 0
    while (true) {
      const question = getMeta(meta, `frequently_asked_questions_${i}_question_label`)
      const answer   = getMeta(meta, `frequently_asked_questions_${i}_answer_label`)
      if (!question && !answer) break
      items.push({ question_label: question, answer_label: answer })
      i++
    }
    return items
  })()

  // ── Pricing ──
  const price        = parseFloat(pkg.price) || 0
  const regularPrice = parseFloat(pkg.regular_price) || 0
  const onSale       = pkg.on_sale && regularPrice > price
  const discountPct  = onSale ? Math.round((1 - price / regularPrice) * 100) : 0
  const fmt          = (n: number) => '₹' + n.toLocaleString('en-IN')

  // ── Hero image ──
  const heroImage = pkg.images[0]?.src ?? ''
  const categoryName = pkg.categories[0]?.name ?? ''

  // ── WhatsApp link ──
  const waMsg = encodeURIComponent(`Hi, I'm interested in the package: ${pkg.name}`)
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden h-[480px] lg:h-[560px]" style={{ position: 'relative' }}>
        {heroImage && (
          <Image
            src={heroImage}
            alt={pkg.name}
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
              {pkg.name}
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
              {people && (
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
                    <Link href={`/packages?category=${pkg.categories[0]?.slug ?? ''}`} style={{ color: '#1E6B2E', fontWeight: 500 }}>
                      {categoryName}
                    </Link>
                  </li>
                  <li style={{ color: '#AAAAAA' }}>›</li>
                </>
              )}
              <li style={{ color: '#888888' }}>
                {pkg.name.length > 40 ? pkg.name.slice(0, 40) + '…' : pkg.name}
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

            {/* 1. Overview */}
            {pkg.short_description && (
              <Section title="Overview">
                <div
                  className="prose-content"
                  style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: pkg.short_description }}
                />
              </Section>
            )}

            {/* 2. Itinerary */}
            {itineraryDays.length > 0 && (
              <Section title="Itinerary">
                <ItineraryAccordion days={itineraryDays} />
              </Section>
            )}

            {/* 3. Map */}
            {mapQuery && (
              <Section title="Map">
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
            {(inclusions.length > 0 || exclusions.length > 0) && (
              <Section title="Inclusions & Exclusions">
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
            {(weatherSummary || bestMonthsArr.length > 0) && (
              <Section title="Best Time to Visit">
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
              <Section title="Frequently Asked Questions">
                <FAQAccordion faqs={faqs} />
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
            />
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
    </>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
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
}: {
  price: number
  regularPrice: number
  onSale: boolean
  discountPct: number
  waLink: string
  fmt: (n: number) => string
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
      <Link
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center transition-colors duration-200 hover:bg-[#F7FAF7]"
        style={{
          border: '2px solid #1E6B2E',
          color: '#1E6B2E',
          fontWeight: 700,
          fontSize: '15px',
          padding: '13px',
          borderRadius: '10px',
          marginBottom: '20px',
        }}
      >
        Enquire Now
      </Link>

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
