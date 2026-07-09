import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPackagesByCategory, getCategories, type PayloadPackage } from '@/lib/payload-api'
import type { PackageCardProps } from '@/components/shared/PackageCard'
import CategoryPageClient from '@/components/packages/CategoryPageClient'

// ── Mapping ──────────────────────────────────────────────────────────────────

function mapPayloadPackageToCard(pkg: PayloadPackage, destinationOverride?: string): PackageCardProps {
  const discount = pkg.regularPrice > 0
    ? Math.round((1 - pkg.price / pkg.regularPrice) * 100)
    : 0

  const catNames = pkg.category.map((c) => c.name.toLowerCase())
  const badgeType: PackageCardProps['badgeType'] = pkg.onSale && discount > 20
    ? 'deal'
    : catNames.some((n) => n.includes('honeymoon'))
      ? 'honeymoon'
      : null

  const destination = destinationOverride ?? (pkg.category[0]?.name ?? '').replace(' Packages', '').trim()

  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    image: pkg.images[0]?.url ?? '',
    price: pkg.price,
    regularPrice: pkg.regularPrice,
    onSale: pkg.onSale,
    duration: pkg.duration,
    rating: 0,
    reviewCount: 0,
    destination,
    badgeType,
    route: pkg.route,
  }
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: slug } = await params
  const categories = await getCategories()
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return {}
  return {
    title: `${cat.name} | Bon Voyagers`,
    description: `Explore our curated ${cat.name} travel packages. Book online or chat with our experts for the best deals.`,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

const PER_PAGE = 20

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ category: slug }, resolvedSearch] = await Promise.all([params, searchParams])
  const currentPage = Math.max(1, parseInt(resolvedSearch.page ?? '1', 10) || 1)

  const categories = await getCategories()
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) notFound()

  const { packages: products, totalDocs, totalPages: rawTotalPages } = await getPackagesByCategory(cat.id, currentPage, PER_PAGE)

  const totalPages = Math.max(1, rawTotalPages)
  const destination = cat.name.replace(' Packages', '').replace(/^best\s+/i, '').trim()
  const packages = products.map((p) => mapPayloadPackageToCard(p, destination))

  return (
    <>
      {/* ── Breadcrumb ── */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E0EBE1' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '10px clamp(16px, 4vw, 40px)' }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px', listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
              <li><Link href="/" style={{ color: '#1E6B2E', fontWeight: 500 }}>Home</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li><Link href="/packages" style={{ color: '#1E6B2E', fontWeight: 500 }}>Packages</Link></li>
              <li style={{ color: '#AAAAAA' }}>›</li>
              <li style={{ color: '#888888' }}>{cat.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0D3B1E 0%, #1E6B2E 100%)',
          padding: 'clamp(40px, 6vw, 60px) clamp(16px, 4vw, 40px)',
        }}
      >
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: '10px',
              fontFamily: 'var(--font-playfair)',
            }}
          >
            {cat.name}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.80)', margin: 0 }}>
            {totalDocs} curated packages available
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) 80px',
        }}
      >
        <CategoryPageClient
          packages={packages}
          categoryName={destination}
          categorySlug={slug}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalDocs}
          perPage={PER_PAGE}
        />
      </div>
    </>
  )
}
