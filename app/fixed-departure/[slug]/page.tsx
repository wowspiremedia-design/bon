import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  getFilteredFixedDeparturePackages,
  getFixedDeparturePackagesByDepartureState,
  getFixedDeparturePackageBySlug,
  type FixedDeparturePackage,
} from '@/lib/fixed-departure-api'
import type { DepartureState } from '@/lib/payload-api'
import { slugToState, formatStateLabel } from '@/lib/geoState'
import AllFixedDepartureClient from '@/components/fixed-departure/AllFixedDepartureClient'
import { lexicalToHtml, lexicalToLines } from '@/lib/lexicalToHtml'
import ItineraryAccordion from '@/components/package/ItineraryAccordion'
import FAQAccordion from '@/components/package/FAQAccordion'
import ShareButton from '@/components/package/ShareButton'
import EnquiryPopup from '@/components/shared/EnquiryPopup'
import RouteMap from '@/components/fixed-departure/RouteMap'

const SITE_URL = 'https://bonvoyagers.co'
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Metadata ───────────────────────────────────────────────────────────────────
//
// One route, two possible identities for the [slug] segment: a departure
// state (state-listing page) or a real package (package details page).
// State is checked first — if a package's real slug were ever identical to
// a state slug, the state listing wins, matching the priority order given.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const departureState = slugToState(slug)
  if (departureState) {
    const stateName = formatStateLabel(departureState)
    return {
      title: `Fixed Departure Packages from ${stateName} | Bon Voyagers`,
      description: `Book fixed departure group tours from ${stateName}, with confirmed dates and all-inclusive pricing.`,
      alternates: {
        canonical: `/fixed-departure/${slug}`,
      },
    }
  }

  const pkg = await getFixedDeparturePackageBySlug(slug)
  if (!pkg) return {}

  const title = pkg.seoTitle || pkg.title
  const description = pkg.seoDescription || ''
  const heroImage = pkg.images[0]?.url ?? ''
  return {
    title,
    description,
    alternates: {
      canonical: `/fixed-departure/${slug}`,
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function FixedDeparturePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const departureState = slugToState(slug)
  if (departureState) {
    return <StateListing slug={slug} departureState={departureState} />
  }

  const pkg = await getFixedDeparturePackageBySlug(slug)
  if (!pkg) notFound()

  return <PackageDetails pkg={pkg} slug={slug} />
}

// ── State listing (unchanged logic from the previous [state] route) ────────────

async function StateListing({
  slug,
  departureState,
}: {
  slug: string
  departureState: DepartureState
}) {
  const stateName = formatStateLabel(departureState)

  const [initial, heroPackages] = await Promise.all([
    getFilteredFixedDeparturePackages({ departureState, sort: 'popular', cursor: 1 }),
    getFixedDeparturePackagesByDepartureState(departureState, 1),
  ])

  const heroPackage = heroPackages[0] ?? null
  const heroImageUrl = heroPackage?.images[0]?.url

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Fixed Departure', item: `${SITE_URL}/fixed-departure` },
          { '@type': 'ListItem', position: 3, name: stateName, item: `${SITE_URL}/fixed-departure/${slug}` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: `Fixed Departure Packages from ${stateName}`,
        description: `Browse ${initial.totalCount} fixed departure group tours from ${stateName}.`,
        url: `${SITE_URL}/fixed-departure/${slug}`,
      },
      {
        '@type': 'ItemList',
        itemListElement: initial.packages.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/fixed-departure/${p.slug}`,
          name: p.title,
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0EBE1' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '10px clamp(16px, 4vw, 40px)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li><Link href="/" style={{ color: '#1E6B2E', fontWeight: 500 }}>Home</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li style={{ color: '#888888' }}>Fixed Departure</li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li style={{ color: '#888888' }}>{stateName}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <section className="relative w-full" style={{ height: '50vh', minHeight: '360px' }}>
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={stateName}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        )}

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.75))' }}
        />

        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center"
          style={{ padding: '32px 24px' }}
        >
          <h1
            className="font-display font-bold mb-3"
            style={{ color: '#FFFFFF', fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.2 }}
          >
            Fixed Departure Packages from {stateName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
            Book fixed departure group tours from {stateName}, with confirmed dates and all-inclusive pricing.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) 80px',
        }}
      >
        {initial.packages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E0EBE1',
            }}
          >
            <p style={{ fontSize: '16px', color: '#888888' }}>
              No fixed departure packages available from {stateName} yet.
            </p>
          </div>
        ) : (
          <AllFixedDepartureClient
            initialPackages={initial.packages}
            initialNextCursor={initial.nextCursor}
            initialHasMore={initial.hasMore}
            initialTotalCount={initial.totalCount}
            lockedState={departureState}
          />
        )}
      </div>
    </>
  )
}

// ── Package details ──────────────────────────────────────────────────────────

async function PackageDetails({ pkg, slug }: { pkg: FixedDeparturePackage; slug: string }) {
  const heroImage = pkg.images[0]?.url ?? ''
  const price = pkg.price
  const regularPrice = pkg.regularPrice
  const onSale = pkg.onSale && regularPrice > price
  const discountPct = onSale ? Math.round((1 - price / regularPrice) * 100) : 0
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

  const overviewHtml = lexicalToHtml(pkg.overview)
  const termsLines = lexicalToLines(pkg.termsAndConditions)
  const paymentLines = lexicalToLines(pkg.paymentPolicy)
  const cancellationLines = lexicalToLines(pkg.cancellationPolicy)
  const childLines = lexicalToLines(pkg.childPolicy)

  const itineraryDays = pkg.itinerary.map((day) => ({
    day_label: day.dayLabel,
    day_title: day.dayTitle,
    day_description: day.dayDescription,
  }))

  const faqs = (pkg.faqs ?? []).map((f) => ({ question_label: f.question, answer_label: f.answer }))

  const departsLabel = (() => {
    const date = new Date(pkg.departureDate)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  })()

  const waMsg = encodeURIComponent(`Hi, I'm interested in the package: ${pkg.title}`)
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`

  const packageUrl = `${SITE_URL}/fixed-departure/${slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Fixed Departure', item: `${SITE_URL}/fixed-departure` },
          { '@type': 'ListItem', position: 3, name: pkg.title, item: packageUrl },
        ],
      },
      {
        '@type': 'Product',
        name: pkg.title,
        description: pkg.seoDescription || undefined,
        image: heroImage ? [heroImage] : undefined,
        url: packageUrl,
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: packageUrl,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)',
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}
        >
          <div className="mx-auto" style={{ maxWidth: '1280px' }}>
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

            {pkg.route && (
              <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{pkg.route}</span>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <ShareButton packageName={pkg.title} />
            </div>

            <div className="flex flex-wrap gap-2">
              {pkg.duration && (
                <span style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '9999px', backdropFilter: 'blur(4px)' }}>
                  🕐 {pkg.duration}
                </span>
              )}
              {departsLabel && (
                <span style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '9999px', backdropFilter: 'blur(4px)' }}>
                  📅 Departs {departsLabel}
                </span>
              )}
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '9999px', backdropFilter: 'blur(4px)' }}>
                🎫 {capitalize(pkg.packageType)}
              </span>
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
              <li><Link href="/fixed-departure" style={{ color: '#1E6B2E', fontWeight: 500 }}>Fixed Departure</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
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

            {overviewHtml && (
              <Section title="Overview">
                <div
                  className="prose-content"
                  style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: overviewHtml }}
                />
              </Section>
            )}

            {itineraryDays.length > 0 && (
              <Section title="Itinerary">
                <ItineraryAccordion days={itineraryDays} />
              </Section>
            )}

            {pkg.routeStops.length > 0 && (
              <Section title="Map">
                <RouteMap routeStops={pkg.routeStops} />
              </Section>
            )}

            {termsLines.length > 0 && (
              <Section title="Terms & Conditions">
                <PolicyList lines={termsLines} />
              </Section>
            )}

            {paymentLines.length > 0 && (
              <Section title="Payment Policy">
                <PolicyList lines={paymentLines} />
              </Section>
            )}

            {cancellationLines.length > 0 && (
              <Section title="Cancellation Policy">
                <PolicyList lines={cancellationLines} />
              </Section>
            )}

            {childLines.length > 0 && (
              <Section title="Child Policy">
                <PolicyList lines={childLines} />
              </Section>
            )}

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
              packageTitle={pkg.title}
              duration={pkg.duration}
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
            <p className="line-through leading-none" style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '2px' }}>
              {fmt(regularPrice)}
            </p>
          )}
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#1E6B2E', lineHeight: 1 }}>
            {fmt(price)}
          </p>
          <p style={{ fontSize: '11px', color: '#6B6B6B' }}>per person</p>
        </div>

        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <div style={{ width: '130px' }}>
            <EnquiryPopup
              packageTitle={pkg.title}
              duration={pkg.duration}
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
// Simplified duplicate of app/package/[slug]/page.tsx's local Section helper
// (not exported there, so it can't be imported) — the scrollMarginTop offset
// is dropped since this page has no SectionScrollSpy nav to offset against.

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

// ── Policy list ────────────────────────────────────────────────────────────────
// Renders each line of a policy/terms field as its own bulleted row instead of
// relying on native <ul>/<li>: Tailwind's Preflight reset strips all list
// styling project-wide (see app/globals.css's bare `@import "tailwindcss"`),
// and there's no @tailwindcss/typography plugin to reverse it. Same flex row
// shape as app/package/[slug]/page.tsx's PRICE_CONDITIONS <li> (a manual
// bullet dot, not a real list marker, for the same reason), minus its shaded
// box, and matching Overview's plain-paragraph type size/weight instead.
function PolicyList({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-col" style={{ gap: '10px' }}>
      {lines.map((line, i) => (
        <div key={i} className="flex items-start gap-3" style={{ fontSize: '15px', color: '#4A4A4A', lineHeight: 1.8 }}>
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#1E6B2E',
              marginTop: '10px',
            }}
          />
          <span dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      ))}
    </div>
  )
}

// ── Booking sidebar ────────────────────────────────────────────────────────────
// Duplicate of app/package/[slug]/page.tsx's local BookingSidebar helper
// (not exported there, so it can't be imported) — same trust badges, same
// WhatsApp + Enquiry CTAs, same price block.

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
      <div style={{ marginBottom: '20px' }}>
        {onSale && (
          <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
            <p className="line-through" style={{ fontSize: '14px', color: '#6B6B6B' }}>
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
        <p style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '4px' }}>per person</p>
      </div>

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
