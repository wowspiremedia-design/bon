'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'

// ── Filter / sort config ───────────────────────────────────────────────────────

const PRICE_RANGES = [
  { label: 'Under ₹15,000',     min: 0,     max: 15000 },
  { label: '₹15,000–₹30,000',  min: 15000, max: 30000 },
  { label: '₹30,000–₹50,000',  min: 30000, max: 50000 },
  { label: 'Above ₹50,000',     min: 50000, max: Infinity },
]

const DURATION_RANGES = [
  { label: '1–3 Days',  min: 1,  max: 3 },
  { label: '4–6 Days',  min: 4,  max: 6 },
  { label: '7–10 Days', min: 7,  max: 10 },
  { label: '10+ Days',  min: 11, max: Infinity },
]

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Popular' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration',   label: 'Duration' },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

function parseDays(duration: string): number {
  const match = duration.match(/(\d+)\s*days?/i)
  return match ? parseInt(match[1], 10) : 0
}

// Build the list of page numbers to show, with '...' for gaps
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  packages: PackageCardProps[]
  categoryName: string
  categorySlug: string
  currentPage: number
  totalPages: number
  totalCount: number
  perPage: number
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CategoryPageClient({
  packages,
  categoryName,
  categorySlug,
  currentPage,
  totalPages,
  totalCount,
  perPage,
}: Props) {
  console.log('CategoryPageClient packages.length:', packages.length)

  const router = useRouter()
  const [priceFilters, setPriceFilters]       = useState<string[]>([])
  const [durationFilters, setDurationFilters] = useState<string[]>([])
  const [sort, setSort]                       = useState<SortValue>('popular')

  function toggleFilter<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
  }

  const filtered = useMemo(() => {
    let result = packages

    if (priceFilters.length > 0) {
      result = result.filter((p) =>
        PRICE_RANGES.some((r) => priceFilters.includes(r.label) && p.price >= r.min && p.price < r.max),
      )
    }

    if (durationFilters.length > 0) {
      result = result.filter((p) => {
        const days = parseDays(p.duration)
        return DURATION_RANGES.some((r) => durationFilters.includes(r.label) && days >= r.min && days <= r.max)
      })
    }

    return [...result].sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'duration')   return parseDays(a.duration) - parseDays(b.duration)
      return 0
    })
  }, [packages, priceFilters, durationFilters, sort])

  const filtersActive = priceFilters.length > 0 || durationFilters.length > 0

  // "Showing X–Y of Z" for unfiltered view
  const showingFrom = (currentPage - 1) * perPage + 1
  const showingTo   = Math.min(currentPage * perPage, totalCount)

  function goToPage(page: number) {
    router.push(`/packages/${categorySlug}?page=${page}`)
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* ── Sidebar (hidden on mobile) ── */}
      <aside className="hidden lg:block" style={{ width: '280px', flexShrink: 0 }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E0EBE1',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Filter By
          </h3>

          {/* Price range */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Price Range</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PRICE_RANGES.map((r) => (
                <label key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={priceFilters.includes(r.label)}
                    onChange={() => setPriceFilters((prev) => toggleFilter(prev, r.label))}
                    style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

          {/* Duration */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Duration</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DURATION_RANGES.map((r) => (
                <label key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={durationFilters.includes(r.label)}
                    onChange={() => setDurationFilters((prev) => toggleFilter(prev, r.label))}
                    style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {filtersActive && (
            <button
              onClick={() => { setPriceFilters([]); setDurationFilters([]) }}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#D90429',
                background: '#FFF5F5',
                border: '1px solid #FFCCCC',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </aside>

      {/* ── Content ── */}
      <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'visible' }}>

        {/* Sort bar */}
        <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#888888' }}>
            {filtersActive ? (
              <>Showing <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> filtered packages</>
            ) : (
              <>Showing <strong style={{ color: '#1A1A1A' }}>{showingFrom}–{showingTo}</strong> of <strong style={{ color: '#1A1A1A' }}>{totalCount}</strong> {categoryName} packages</>
            )}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#888888' }}>Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#1A1A1A',
                border: '1px solid #E0EBE1',
                borderRadius: '8px',
                padding: '6px 10px',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Package grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
            {filtered.map((pkg) => (
              <div key={pkg.id}>
                <PackageCard {...pkg} />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 24px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E0EBE1',
            }}
          >
            <p style={{ fontSize: '16px', color: '#888888', marginBottom: '8px' }}>No packages match your filters.</p>
            <button
              onClick={() => { setPriceFilters([]); setDurationFilters([]) }}
              style={{ fontSize: '13px', color: '#1E6B2E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Pagination (hidden when filters are active) ── */}
        {!filtersActive && totalPages > 1 && (
          <div
            className="flex items-center justify-center flex-wrap gap-2"
            style={{ marginTop: '40px' }}
          >
            {/* Previous */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid #E0EBE1',
                background: '#FFFFFF',
                color: currentPage === 1 ? '#CCCCCC' : '#1A1A1A',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} style={{ padding: '8px 4px', fontSize: '13px', color: '#888888' }}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={{
                    minWidth: '36px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: p === currentPage ? '1px solid #1E6B2E' : '1px solid #E0EBE1',
                    background: p === currentPage ? '#1E6B2E' : '#FFFFFF',
                    color: p === currentPage ? '#FFFFFF' : '#1A1A1A',
                    cursor: p === currentPage ? 'default' : 'pointer',
                  }}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid #E0EBE1',
                background: '#FFFFFF',
                color: currentPage === totalPages ? '#CCCCCC' : '#1A1A1A',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
