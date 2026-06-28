import HeroSection from '@/components/home/HeroSection'
import HeroCarousel from '@/components/home/HeroCarousel'
import type { HeroSlide } from '@/components/home/HeroCarousel'
import TrustStrip from '@/components/home/TrustStrip'
import FeaturedPackagesClient from '@/components/home/FeaturedPackagesClient'
import PopularDestinations from '@/components/home/PopularDestinations'
import CollectionsSection from '@/components/home/CollectionsSection'
import CTASection from '@/components/home/CTASection'
import PageLoader from '@/components/layout/PageLoader'
import { getPackages, getDestinationImages } from '@/lib/api'
import type { PackageCardProps } from '@/components/shared/PackageCard'
import { mapProduct } from '@/lib/mapProduct'

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 15,  label: 'Kashmir' },
  { id: 24,  label: 'Andaman' },
  { id: 122, label: 'Meghalaya' },
  { id: 22,  label: 'Ladakh' },
  { id: 25,  label: 'Bhutan' },
  { id: 101, label: 'Darjeeling' },
]

const TAB_LABELS = ['All', 'Kashmir', 'Andaman', 'Meghalaya', 'Ladakh', 'Bhutan', 'Darjeeling']

const HERO_SLIDES: HeroSlide[] = [
  {
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2026/03/kailash-yatra-scaled.png',
    title: 'Devbhoomi',
    sub_title: 'Sacred journeys to the abode of the divine',
    button_text: 'Explore Packages',
    button_url: '/packages',
  },
  {
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/11/ladakh-package.jpg',
    title: 'Discover Ladakh',
    sub_title: 'Where the mountains touch the sky',
    button_text: 'Explore Ladakh',
    button_url: '/destination/ladakh-tour-packages',
  },
  {
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/10/kashmir.jpg',
    title: 'Discover Kashmir',
    sub_title: 'Paradise on Earth awaits you',
    button_text: 'Explore Kashmir',
    button_url: '/destination/kashmir-tour-package',
  },
]

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [packageResults, destinationImages] = await Promise.all([
    Promise.all(CATEGORIES.map(({ id }) => getPackages({ category: id, perPage: 2 }))),
    getDestinationImages(),
  ])

  const seen = new Set<number>()
  const packages: PackageCardProps[] = []

  for (let i = 0; i < CATEGORIES.length; i++) {
    for (const product of packageResults[i].slice(0, 2)) {
      if (!seen.has(product.id)) {
        seen.add(product.id)
        packages.push(mapProduct(product, CATEGORIES[i].label))
        if (packages.length === 12) break
      }
    }
    if (packages.length === 12) break
  }

  return (
    <>
      <PageLoader />

      {/* 1. Cinematic hero with destination images */}
      <HeroSection images={destinationImages} />

      {/* 2. Trust strip */}
      <TrustStrip />

      {/* 3. ACF journey cards carousel */}
      <HeroCarousel slides={HERO_SLIDES} />

      {/* 4. Collections */}
      <div className="pb-20">
        <CollectionsSection />
      </div>

      {/* 5. Featured packages */}
      <div className="py-20">
        <FeaturedPackagesClient packages={packages} tabs={TAB_LABELS} />
      </div>

      {/* 6. Popular destinations */}
      <div className="py-20">
        <PopularDestinations />
      </div>

      {/* 7. CTA */}
      <div className="py-20">
        <CTASection />
      </div>
    </>
  )
}
