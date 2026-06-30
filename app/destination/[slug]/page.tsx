import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDestinationBySlug, getDestinationGallery, getAllPackages } from '@/lib/api'
import { mapProduct } from '@/lib/mapProduct'
import DestinationPackagesSection from '@/components/destination/DestinationPackagesSection'
import DestinationHeroCarousel from '@/components/destination/DestinationHeroCarousel'
import DestinationTrustStrip from '@/components/destination/DestinationTrustStrip'
import DestinationLeadMagnet from '@/components/destination/DestinationLeadMagnet'
import DestinationPhotoGallery from '@/components/destination/DestinationPhotoGallery'
import WhyVisitSection from '@/components/destination/WhyVisitSection'
import DestinationFinalCTA from '@/components/destination/DestinationFinalCTA'
import DestinationWhatsAppStrip from '@/components/destination/DestinationWhatsAppStrip'
import DestinationMobileBar from '@/components/destination/DestinationMobileBar'

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
  const s = slug.toLowerCase()
  for (const [key, id] of Object.entries(DESTINATION_CATEGORY_MAP)) {
    if (s.includes(key)) return id
  }
  const t = title.toLowerCase()
  for (const [key, id] of Object.entries(DESTINATION_CATEGORY_MAP)) {
    if (t.includes(key)) return id
  }
  return null
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  if (!destination) return {}
  const title = destination.title?.rendered || 'Destination'
  const description = (destination.excerpt?.rendered || '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 160)
  return {
    title: `${title} Tour Packages & Travel Deals | Bon Voyagers`,
    description,
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
  if (!destination) notFound()

  const title = destination.title?.rendered || ''
  const excerpt = (destination.excerpt?.rendered || '').replace(/<[^>]*>/g, '').trim()
  const categoryId = getCategoryId(slug, title)

  const [galleryImages, rawPackages] = await Promise.all([
    getDestinationGallery(destination.place_gallery_ids ?? []),
    categoryId
      ? getAllPackages({ category: categoryId })
      : getAllPackages({ search: title }),
  ])

  const packages = rawPackages.map((p) => mapProduct(p))
  const waLink = `https://wa.me/919836755550?text=Hi%20Bon%20Voyagers%20%F0%9F%91%8B%0A%0AI'm%20interested%20in%20planning%20a%20trip%20to%20*${encodeURIComponent(title)}*`
  const destinationDetails = (destination.acf?.destination_details as string | undefined) || ''
  const hasDetails = Boolean(destinationDetails) && destinationDetails !== 'No Details Available'

  return (
    <>
      {/* 1. Hero Carousel */}
      <DestinationHeroCarousel images={galleryImages} title={title} excerpt={excerpt} />

      {/* 2. Trust Strip */}
      <DestinationTrustStrip slug={slug} />

      {/* 3. Destination Details */}
      {hasDetails && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2
            className="font-bold text-[#1E6B2E] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 1.875rem)' }}
          >
            About {title}
          </h2>
          <div
            className="text-gray-700 leading-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1 [&_a]:text-[#1E6B2E] [&_strong]:font-semibold [&_strong]:text-gray-900"
            dangerouslySetInnerHTML={{ __html: destinationDetails }}
          />
        </section>
      )}

      {/* 4. Packages */}
      <section id="packages" className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 py-12 md:py-20">
        {packages.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            No packages found for this destination. Please check back soon.
          </p>
        ) : (
          <DestinationPackagesSection packages={packages} />
        )}
      </section>

      {/* 5. Photo Gallery */}
      <DestinationPhotoGallery images={galleryImages} destination={title} />

      {/* 6. Lead Magnet */}
      <DestinationLeadMagnet destination={title} />

      {/* 7. Why Visit */}
      <WhyVisitSection destination={title} />

      {/* 8. Final CTA */}
      <DestinationFinalCTA destination={title} />

      {/* 9. WhatsApp Strip */}
      <DestinationWhatsAppStrip destination={title} />

      {/* 10. Mobile Bottom Bar */}
      <DestinationMobileBar destination={title} waLink={waLink} />
    </>
  )
}
