import HeroSection from '@/components/home/HeroSection'
import HeroCarousel from '@/components/home/HeroCarousel'
import TrustStrip from '@/components/home/TrustStrip'
import FeaturedPackagesClient from '@/components/home/FeaturedPackagesClient'
import PopularDestinations from '@/components/home/PopularDestinations'
import CollectionsSection from '@/components/home/CollectionsSection'
import CTASection from '@/components/home/CTASection'
import PageLoader from '@/components/layout/PageLoader'
import { getDestinationHeroSlides, getCategories, getPackagesByCategory, mapPayloadPackageToCard } from '@/lib/payload-api'
import type { PackageCardProps } from '@/components/shared/PackageCard'

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG = [
  { slug: 'kashmir-packages', label: 'Kashmir' },
  { slug: 'andaman-packages', label: 'Andaman' },
  { slug: 'meghalaya-packages', label: 'Meghalaya' },
  { slug: 'ladakh-packages', label: 'Ladakh' },
  { slug: 'exclusive-bhutan-packages', label: 'Bhutan' },
  { slug: 'best-darjeeling-packages-sale', label: 'Darjeeling' },
]

const TAB_LABELS = ['All', 'Kashmir', 'Andaman', 'Meghalaya', 'Ladakh', 'Bhutan', 'Darjeeling']

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [heroSlides, allCategories] = await Promise.all([
    getDestinationHeroSlides(),
    getCategories(),
  ])

  const categories = CATEGORY_CONFIG
    .map(({ slug, label }) => {
      const cat = allCategories.find((c) => c.slug === slug)
      return cat ? { id: cat.id, label } : null
    })
    .filter((c): c is { id: number; label: string } => c !== null)

  const packageResults = await Promise.all(
    categories.map(({ id }) => getPackagesByCategory(id, 1, 2).then((r) => r.packages)),
  )

  const heroImages = heroSlides.map((s) => s.image).filter(Boolean)

  const seen = new Set<number>()
  const packages: PackageCardProps[] = []

  for (let i = 0; i < categories.length; i++) {
    for (const product of packageResults[i].slice(0, 2)) {
      if (!seen.has(product.id)) {
        seen.add(product.id)
        packages.push(mapPayloadPackageToCard(product, categories[i].label))
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
