import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDestinationBySlug, getPackagesByCategoryLite } from '@/lib/payload-api'
import { lexicalToHtml } from '@/lib/lexicalToHtml'
import DestinationPackagesSection from '@/components/destination/DestinationPackagesSection'
import DestinationHeroCarousel from '@/components/destination/DestinationHeroCarousel'
import DestinationTrustStrip from '@/components/destination/DestinationTrustStrip'
import DestinationLeadMagnet from '@/components/destination/DestinationLeadMagnet'
import DestinationPhotoGallery from '@/components/destination/DestinationPhotoGallery'
import WhyVisitSection from '@/components/destination/WhyVisitSection'
import DestinationFinalCTA from '@/components/destination/DestinationFinalCTA'
import DestinationWhatsAppStrip from '@/components/destination/DestinationWhatsAppStrip'
import DestinationMobileBar from '@/components/destination/DestinationMobileBar'

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const destination = await getDestinationBySlug(slug)
  if (!destination) return {}
  const title = destination.title || 'Destination'
  const description = (destination.excerpt || '')
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

  const title = destination.title || ''
  const excerpt = (destination.excerpt || '').replace(/<[^>]*>/g, '').trim()

  const galleryImages = (destination.gallery ?? []).map((g) => g.url).filter((u): u is string => Boolean(u))
  const categoryId = destination.packageCategory?.id ?? null
  const packagesLite = categoryId ? await getPackagesByCategoryLite(categoryId) : []

  const waLink = `https://wa.me/919836755550?text=Hi%20Bon%20Voyagers%20%F0%9F%91%8B%0A%0AI'm%20interested%20in%20planning%20a%20trip%20to%20*${encodeURIComponent(title)}*`
  const destinationDetails = lexicalToHtml(destination.destinationDetails)
  const hasDetails = destinationDetails.length > 0

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
        {packagesLite.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            No packages found for this destination. Please check back soon.
          </p>
        ) : (
          <DestinationPackagesSection packagesLite={packagesLite} />
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
