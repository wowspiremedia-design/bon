import HeroSection from '@/components/home/HeroSection'
import HeroCarousel from '@/components/home/HeroCarousel'
import TrustStrip from '@/components/home/TrustStrip'
import FeaturedPackagesClient from '@/components/home/FeaturedPackagesClient'
import PopularDestinations from '@/components/home/PopularDestinations'
import CollectionsSection from '@/components/home/CollectionsSection'
import CTASection from '@/components/home/CTASection'
import PageLoader from '@/components/layout/PageLoader'
import { getPackages, getHeroSlides } from '@/lib/api'
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [heroSlides, packageResults] = await Promise.all([
    getHeroSlides(),
    Promise.all(CATEGORIES.map(({ id }) => getPackages({ category: id, perPage: 2 }))),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroImages = heroSlides.map((s: any) => s.image).filter(Boolean)

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

      {/* 1. Cinematic hero with ACF slider images */}
      <HeroSection images={heroImages} />

      {/* 2. Trust strip */}
      <TrustStrip />

      {/* 3. ACF journey cards carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* 4. Collections */}
      <div className="pb-12">
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
