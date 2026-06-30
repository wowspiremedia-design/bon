'use client'

import { useState, useMemo } from 'react'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'

const ITEMS_PER_PAGE = 15
const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

interface PriceBand {
  label: string
  filterMin: number
  filterMax: number
}

function computeBands(packages: PackageCardProps[]): PriceBand[] {
  if (packages.length === 0) return []
  const prices = packages.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) {
    return [{ label: fmt(min), filterMin: min, filterMax: max }]
  }
  const step = (max - min) / 4
  const t1 = min + step
  const t2 = min + step * 2
  const t3 = min + step * 3
  return [
    { label: `${fmt(min)} – ${fmt(t1)}`, filterMin: min, filterMax: t1 },
    { label: `${fmt(t1)} – ${fmt(t2)}`,  filterMin: t1,  filterMax: t2 },
    { label: `${fmt(t2)} – ${fmt(t3)}`,  filterMin: t2,  filterMax: t3 },
    { label: `${fmt(t3)} – ${fmt(max)}`, filterMin: t3,  filterMax: max },
  ]
}

function inBand(price: number, band: PriceBand, bandIndex: number): boolean {
  return bandIndex === 0
    ? price >= band.filterMin && price <= band.filterMax
    : price > band.filterMin && price <= band.filterMax
}

interface Props {
  packages: PackageCardProps[]
}

export default function DestinationPackagesSection({ packages }: Props) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<'' | 'low-high' | 'high-low'>('')
  const [checkedBands, setCheckedBands] = useState<number[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const bands = useMemo(() => computeBands(packages), [packages])

  const filtered = useMemo(() => {
    let result = [...packages]
    if (checkedBands.length > 0) {
      result = result.filter((pkg) =>
        checkedBands.some((bi) => inBand(pkg.price, bands[bi], bi))
      )
    }
    if (sort === 'low-high') result.sort((a, b) => a.price - b.price)
    else if (sort === 'high-low') result.sort((a, b) => b.price - a.price)
    return result
  }, [packages, checkedBands, sort, bands])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  function toggleBand(i: number) {
    setCheckedBands((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
    setPage(1)
  }

  function handleSort(val: '' | 'low-high' | 'high-low') {
    setSort(val)
    setPage(1)
  }

  const activeCount = checkedBands.length

  return (
    <>
      {/* ── Mobile: collapsible filters ── */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="mobile-filters-panel"
          className="flex items-center gap-2 rounded-full font-semibold text-sm transition-all duration-200"
          style={{
            padding: '10px 22px',
            background: '#F3F1EC',
            border: '1px solid #E5E7EB',
            color: '#1A1A1A',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span
              className="rounded-full text-xs font-bold leading-none"
              style={{ background: '#1E6B2E', color: '#FFFFFF', padding: '2px 7px' }}
            >
              {activeCount}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div
            id="mobile-filters-panel"
            className="mt-3 rounded-2xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '18px 20px',
            }}
          >
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                Sort by price
              </p>
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value as '' | 'low-high' | 'high-low')}
                className="w-full rounded-xl"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  background: '#FAFAF9',
                  color: '#1A1A1A',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <option value="">Default order</option>
                <option value="low-high">Price: Low → High</option>
                <option value="high-low">Price: High → Low</option>
              </select>
            </div>

            {bands.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                  Price range
                </p>
                <div className="flex flex-col gap-2">
                  {bands.map((band, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkedBands.includes(i)}
                        onChange={() => toggleBand(i)}
                        style={{
                          accentColor: '#1E6B2E',
                          width: '15px',
                          height: '15px',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ fontSize: '13px', color: '#444444' }}>{band.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop: always-visible controls ── */}
      <div
        className="hidden md:flex items-center gap-x-6 gap-y-3 mb-8 flex-wrap rounded-2xl"
        style={{
          background: '#F9F7F4',
          border: '1px solid #E5E7EB',
          padding: '14px 20px',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Sort:</span>
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value as '' | 'low-high' | 'high-low')}
            className="rounded-xl"
            style={{
              padding: '7px 12px',
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#1A1A1A',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="">Default order</option>
            <option value="low-high">Price: Low → High</option>
            <option value="high-low">Price: High → Low</option>
          </select>
        </div>

        {bands.length > 0 && (
          <>
            <span aria-hidden="true" style={{ color: '#D1D5DB', fontSize: '20px', lineHeight: 1 }}>
              |
            </span>
            <div className="flex items-center gap-5 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Price:</span>
              {bands.map((band, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkedBands.includes(i)}
                    onChange={() => toggleBand(i)}
                    style={{
                      accentColor: '#1E6B2E',
                      width: '15px',
                      height: '15px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#444444', whiteSpace: 'nowrap' }}>
                    {band.label}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-16">
          No packages match the selected filters.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((pkg) => (
              <PackageCard key={pkg.id} {...pkg} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  padding: '9px 20px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className="rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    padding: '9px 0',
                    minWidth: '40px',
                    border: page === n ? '1px solid #1E6B2E' : '1px solid #D1D5DB',
                    background: page === n ? '#1E6B2E' : '#FFFFFF',
                    color: page === n ? '#FFFFFF' : '#1A1A1A',
                  }}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  padding: '9px 20px',
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
