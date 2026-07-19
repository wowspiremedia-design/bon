import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getFilteredPayloadPackages, getPackagesByDepartureState } from '@/lib/payload-api'
import { slugToState, formatStateLabel } from '@/lib/geoState'
import AllPackagesClient from '@/components/packages/AllPackagesClient'

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state: slug } = await params
  const departureState = slugToState(slug)
  if (!departureState) return {}
  const stateName = formatStateLabel(departureState)
  return {
    title: `Best Tour Packages from ${stateName} | Bon Voyagers`,
    description: `Book the most affordable tour packages from ${stateName} today.`,
    alternates: {
      canonical: `/best-tour-packages/${slug}`,
    },
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function BestTourPackagesStatePage({
  params,
}: {
  params: Promise<{ state: string }>
}) {
  const { state: slug } = await params
  const departureState = slugToState(slug)
  if (!departureState) notFound()

  const stateName = formatStateLabel(departureState)

  const [initial, heroPackages] = await Promise.all([
    getFilteredPayloadPackages({ departureState, sort: 'popular', cursor: 1 }),
    getPackagesByDepartureState(departureState, 1),
  ])

  const heroPackage = heroPackages[0] ?? null
  const heroImageUrl = heroPackage?.images[0]?.url

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0EBE1' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '10px clamp(16px, 4vw, 40px)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li><Link href="/" style={{ color: '#1E6B2E', fontWeight: 500 }}>Home</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li style={{ color: '#888888' }}>Best Tour Packages</li>
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
            Best Tour Packages from {stateName}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px' }}>
            Book the most affordable tour packages from {stateName} today.
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
        <AllPackagesClient
          categories={[]}
          initialPackages={initial.packages}
          initialNextCursor={initial.nextCursor}
          initialHasMore={initial.hasMore}
          initialTotalCount={initial.totalCount}
          lockedState={departureState}
        />
      </div>
    </>
  )
}
