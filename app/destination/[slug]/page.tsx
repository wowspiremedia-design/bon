import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDestinationBySlug, getPackages } from '@/lib/api'
import { mapProduct } from '@/lib/mapProduct'
import PackageCard from '@/components/shared/PackageCard'

// ── Category map ───────────────────────────────────────────────────────────────

const DESTINATION_CATEGORY_MAP: Record<string, number> = {
  'kashmir':    15,
  'andaman':    24,
  'meghalaya':  122,
  'ladakh':     22,
  'bhutan':     25,
  'darjeeling': 101,
  'sikkim':     115,
  'north-east': 120,
  'arunachal':  121,
  'kerala':     125,
  'char-dham':  157,
  'kailash':    151,
  'nepal':      126,
  'himachal':   124,
  'rajasthan':  123,
  'goa':        119,
  'varanasi':   152,
  'haridwar':   153,
  'ayodhya':    154,
  'gangasagar': 159,
  'kedarnath':  156,
  'dehradun':   155,
}

function getCategoryId(slug: string, title: string): number | null {
  const slugLower = slug.toLowerCase()
  for (const [key, id] of Object.entries(DESTINATION_CATEGORY_MAP)) {
    if (slugLower.includes(key)) return id
  }
  const titleLower = title.toLowerCase()
  for (const [key, id] of Object.entries(DESTINATION_CATEGORY_MAP)) {
    if (titleLower.includes(key)) return id
  }
  return null
}

function titleFromSlug(slug: string): string {
  const lower = slug.toLowerCase()
  for (const key of Object.keys(DESTINATION_CATEGORY_MAP)) {
    if (lower.includes(key)) {
      return key.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  }
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  const title = destination?.title?.rendered || titleFromSlug(slug)
  const description = destination?.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || ''
  return {
    title: `${title} Tour Packages | Bon Voyagers`,
    description: description.slice(0, 160),
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)

  const title = destination?.title?.rendered || titleFromSlug(slug)
  const description =
    destination?.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || ''
  const heroImage =
    destination?._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null

  const categoryId = getCategoryId(slug, title)
  const rawPackages = categoryId
    ? await getPackages({ category: categoryId, perPage: 20 })
    : await getPackages({ search: title, perPage: 20 })
  const packages = rawPackages.map((p) => mapProduct(p))

  const waText = encodeURIComponent(`Hi I am interested in ${title} packages`)

  return (
    <main>

      {/* ── Hero ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '65vh', minHeight: '400px', background: '#0D1A0F' }}
      >
        {heroImage && (
          <Image
            src={heroImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-16">
          <p className="uppercase tracking-widest text-sm mb-2" style={{ color: '#C8A96A' }}>
            DESTINATION GUIDE
          </p>
          <h1
            className="font-bold text-white mb-4"
            style={{
              fontFamily: 'var(--font-display, "Playfair Display", serif)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            }}
          >
            {title}
          </h1>
          <div className="w-16 h-1 mb-4" style={{ background: '#C8A96A' }} />
          {description && (
            <p className="text-white/80 text-base md:text-lg max-w-2xl line-clamp-3">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* ── Packages grid ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2
          className="font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display, "Playfair Display", serif)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            color: '#1E6B2E',
          }}
        >
          Explore {title} Packages
        </h2>
        <div className="w-12 h-1 mb-8" style={{ background: '#C8A96A' }} />

        {packages.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No packages found for this destination. Please check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA strip ── */}
      <section className="py-12 px-4 text-center" style={{ background: '#1E6B2E' }}>
        <h3
          className="font-bold text-white mb-3"
          style={{
            fontFamily: 'var(--font-display, "Playfair Display", serif)',
            fontSize: 'clamp(1.4rem, 3vw, 1.875rem)',
          }}
        >
          Plan Your {title} Trip
        </h3>
        <p className="text-white/80 mb-6">
          Talk to our travel experts and get a customised itinerary
        </p>
        <Link
          href={`https://wa.me/919836755550?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold px-8 py-3 rounded-full transition-colors duration-200 hover:bg-amber-500"
          style={{ background: '#F5A623', color: '#FFFFFF' }}
        >
          Chat on WhatsApp
        </Link>
      </section>

    </main>
  )
}
