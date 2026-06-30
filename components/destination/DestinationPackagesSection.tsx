'use client'

import { useState, useMemo, useEffect } from 'react'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'
import { type PackageLite } from '@/lib/api'

const ITEMS_PER_PAGE = 15
const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

const LOADING_MESSAGES = [
  'Curating your perfect getaway...',
  'Mapping out the best routes for you...',
  'Packing in the finest details...',
  'Checking the best stays along your journey...',
  'Bringing your travel plans together...',
  'Sourcing the finest experiences for you...',
  'Charting your next adventure...',
  'Arranging the perfect itinerary...',
  'Lining up the best options for your trip...',
  'Preparing something special for you...',
]

interface PriceBand {
  label: string
  filterMin: number
  filterMax: number
}

function computeBands(packages: PackageLite[]): PriceBand[] {
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
  packagesLite: PackageLite[]
}

export default function DestinationPackagesSection({ packagesLite }: Props) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<'' | 'low-high' | 'high-low'>('')
  const [checkedBands, setCheckedBands] = useState<number[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [fullDetails, setFullDetails] = useState<PackageCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  const bands = useMemo(() => computeBands(packagesLite), [packagesLite])

  const filtered = useMemo(() => {
    let result = [...packagesLite]
    if (checkedBands.length > 0) {
      result = result.filter((pkg) =>
        checkedBands.some((bi) => inBand(pkg.price, bands[bi], bi))
      )
    }
    if (sort === 'low-high') result.sort((a, b) => a.price - b.price)
    else if (sort === 'high-low') result.sort((a, b) => b.price - a.price)
    return result
  }, [packagesLite, checkedBands, sort, bands])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const idsKey = pageItems.map((p) => p.id).join(',')

  useEffect(() => {
    if (idsKey === '') {
      setFullDetails([])
      setLoading(false)
      return
    }

    const ids = idsKey.split(',').map(Number)
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)])
    setLoading(true)

    let cancelled = false

    fetch(`/api/packages-by-ids?ids=${idsKey}`)
      .then((res) => res.json())
      .then((data: PackageCardProps[]) => {
        if (cancelled) return
        const idOrder = new Map(ids.map((id, idx) => [id, idx]))
        const reordered = [...data].sort(
          (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
        )
        setFullDetails(reordered)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setFullDetails([])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [idsKey])

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
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <svg
                className="animate-spin"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="20" stroke="#E5E7EB" strokeWidth="4" />
                <path
                  d="M24 4 a20 20 0 0 1 20 20"
                  stroke="#1E6B2E"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="mt-4 text-sm" style={{ color: '#6B7280' }}>{loadingMessage}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fullDetails.map((pkg) => (
                <PackageCard key={pkg.id} {...pkg} />
              ))}
            </div>
          )}

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
