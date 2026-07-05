import type { Metadata } from 'next'
import Image from 'next/image'
import HeroSection from '@/components/home/HeroSection'
import CollectionGridCard from '@/components/shared/CollectionGridCard'
import { getHeroSlides, getCollectionsWithCoverImages } from '@/lib/api'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About Bon Voyagers | Premium Travel Company India | Bon Voyagers',
    description: 'Bon Voyagers is a leading destination management company offering curated travel experiences across India and worldwide.',
  }
}

export default async function AboutPage() {
  const [heroSlides, collections] = await Promise.all([
    getHeroSlides(),
    getCollectionsWithCoverImages(),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroImages = heroSlides.map((s: any) => s.image).filter(Boolean)
  const hospitalityImage = heroImages[1] ?? heroImages[0]

  return (
    <>
      <HeroSection images={heroImages} label="OUR JOURNEY" headline="About Bon Voyagers" subtitle="" />

      {/* Intro quote */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-lg md:text-xl leading-relaxed text-neutral-700">
          At Bon Voyagers, travel has always been more than just movement, it&apos;s about emotions, connections, and unforgettable experiences.
        </p>
      </section>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-6 pb-20 space-y-6 text-neutral-700 leading-relaxed">
        <p>Established in 2010, Bon Voyagers (P) Ltd. has grown into one of India&apos;s trusted Destination Management Companies with presence across India and global destinations.</p>
        <p>From tailor-made trips, group tours, corporate travel, MICE programs, destination weddings to spiritual journeys, we deliver seamless, thoughtful and curated travel experiences.</p>
      </section>

      {/* Our Hospitality Network */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
            {hospitalityImage && (
              <Image src={hospitalityImage} alt="Bon Hotels" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-serif">Our Hospitality Network</h2>
            <p className="mt-4 text-neutral-700 leading-relaxed">We operate 30+ managed hotels and homestays under the &quot;BON Hotel&quot; brand, ensuring quality and consistency.</p>
            <p className="mt-4 text-neutral-700 leading-relaxed">Our passionate team collaborates with local experts to deliver seamless travel experiences.</p>
          </div>
        </div>
      </section>

      {/* Emerging destinations */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-neutral-700 space-y-6 text-center">
        <p>We take pride in developing emerging destinations and bringing them into the tourism spotlight.</p>
        <p>As an award-winning DMC and members of NATTA, ATSPB, EHTTOA, and WBTD, we continue to evolve with modern travel needs.</p>
      </section>

      {/* Signature Collections */}
      <section className="bg-[#faf8f5] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif">Our Signature Collections</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Handcrafted travel experiences designed for every type of traveler.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <CollectionGridCard key={col.id} name={col.collection_name} slug={col.collection_slug} image={col.coverImage!} />
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center text-neutral-700 space-y-5">
        <p>We believe in responsible travel, respecting cultures, supporting communities, and promoting sustainability.</p>
      </section>

      {/* Final CTA */}
      <section className="bg-black text-white py-24 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-serif leading-relaxed max-w-3xl mx-auto">
          We don&apos;t just create itineraries, <br />we create journeys for a lifetime.
        </h2>
        <a className="inline-block mt-8 bg-[#d90429] px-7 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition" href="/packages">Explore Packages</a>
      </section>
    </>
  )
}
