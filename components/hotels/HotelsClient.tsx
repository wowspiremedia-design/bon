'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MappedHotel as Hotel } from '@/lib/payload-hotels-api'
import HotelCard from './HotelCard'

// ── Config ─────────────────────────────────────────────────────────────────────

const HEADER_HEIGHT = 72

const PRICE_RANGES = [
  { label: '₹2,000 – ₹5,000',   min: 2000,  max: 5000 },
  { label: '₹5,000 – ₹10,000',  min: 5000,  max: 10000 },
  { label: '₹10,000 – ₹15,000', min: 10000, max: 15000 },
  { label: '₹15,000 – ₹20,000', min: 15000, max: 20000 },
  { label: '₹20,000+',          min: 20000, max: Infinity },
]

const WAITING_MESSAGES = [
  'Scouting more stays...',
  'Packing more stays...',
  'More stays ahead...',
  'Almost there, traveler...',
  'Fetching your next stop...',
]

// ── Props ──────────────────────────────────────────────────────────────────────

export interface TaxonomyOptions {
  hotel_locations: string[]
  hotel_property_category: string[]
  hotel_property_type: string[]
  hotel_amenities: string[]
  hotel_food_type: string[]
  hotel_view_type: string[]
  hotel_compatibility: string[]
}

interface Props {
  taxonomyOptions: TaxonomyOptions
  initialHotels: Hotel[]
  initialNextCursor: number | null
  initialHasMore: boolean
  initialTotalCount: number
}

interface BatchResult {
  hotels: Hotel[]
  nextCursor: number | null
  hasMore: boolean
  totalCount: number
}

interface StagedMeta {
  nextCursor: number | null
  hasMore: boolean
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function HotelsClient({
  taxonomyOptions,
  initialHotels,
  initialNextCursor,
  initialHasMore,
  initialTotalCount,
}: Props) {
  const [location, setLocation]                 = useState('')
  const [propertyCategory, setPropertyCategory] = useState('')
  const [propertyType, setPropertyType]         = useState('')
  const [amenities, setAmenities]               = useState<string[]>([])
  const [foodType, setFoodType]                 = useState<string[]>([])
  const [viewType, setViewType]                 = useState<string[]>([])
  const [compatibility, setCompatibility]       = useState<string[]>([])
  const [selectedPrice, setSelectedPrice]       = useState<string | null>(null)

  const [loadedHotels, setLoadedHotels] = useState<Hotel[]>(initialHotels)
  const [totalCount, setTotalCount]     = useState<number>(initialTotalCount)
  const [hasMore, setHasMore]           = useState<boolean>(initialHasMore)
  const [filterLoading, setFilterLoading] = useState(false)
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null)

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const isFirstRender = useRef(true)

  // Measure the mobile drawer's Apply footer so the drawer's filter panel
  // knows how much space to reserve below it when fitting the amenities list.
  const mobileFooterRef = useRef<HTMLDivElement | null>(null)
  const [mobileFooterHeight, setMobileFooterHeight] = useState(0)

  useLayoutEffect(() => {
    function recalc() {
      setMobileFooterHeight(mobileFooterRef.current?.getBoundingClientRect().height ?? 0)
    }
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [])

  // ── Fetching ───────────────────────────────────────────────────────────────

  const fetchHotelsBatch = useCallback(async (cursor: number): Promise<BatchResult> => {
    const qs = new URLSearchParams()
    if (location) qs.set('location', location)
    if (propertyCategory) qs.set('propertyCategory', propertyCategory)
    if (propertyType) qs.set('propertyType', propertyType)
    if (amenities.length > 0) qs.set('amenities', amenities.join(','))
    if (foodType.length > 0) qs.set('foodType', foodType.join(','))
    if (viewType.length > 0) qs.set('viewType', viewType.join(','))
    if (compatibility.length > 0) qs.set('compatibility', compatibility.join(','))
    const band = PRICE_RANGES.find((r) => r.label === selectedPrice)
    if (band) {
      qs.set('minPrice', String(band.min))
      if (Number.isFinite(band.max)) qs.set('maxPrice', String(band.max))
    }
    qs.set('cursor', String(cursor))

    const res = await fetch(`/api/hotels?${qs.toString()}`)
    const data = await res.json()
    return {
      hotels: Array.isArray(data.hotels) ? (data.hotels as Hotel[]) : [],
      nextCursor: typeof data.nextCursor === 'number' ? data.nextCursor : null,
      hasMore: Boolean(data.hasMore),
      totalCount: typeof data.totalCount === 'number' ? data.totalCount : 0,
    }
  }, [location, propertyCategory, propertyType, amenities, foodType, viewType, compatibility, selectedPrice])

  const fetchHotelsBatchRef = useRef(fetchHotelsBatch)
  useEffect(() => { fetchHotelsBatchRef.current = fetchHotelsBatch }, [fetchHotelsBatch])

  // ── Silent background staging ────────────────────────────────────────────
  //
  // At most one fetch may be in flight at a time, guarded synchronously via
  // inFlightRef before the request even starts, mirroring the guard already
  // proven necessary in AllPackagesClient to avoid a duplicate-request race.
  //
  // genRef marks the current "session": any filter change bumps it, and any
  // in-flight fetch started under an older generation checks it on resolve so
  // a stale response can never overwrite a newer filter's state.
  const cursorAfterLoadedRef = useRef<number | null>(initialNextCursor)
  const stagedRef = useRef<Hotel[] | null>(null)
  const stagedMetaRef = useRef<StagedMeta | null>(null)
  const inFlightRef = useRef(false)
  const stagingPromiseRef = useRef<Promise<void> | null>(null)
  const genRef = useRef(0)

  const startStaging = useCallback((cursor: number) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    const gen = genRef.current

    const promise = fetchHotelsBatchRef.current(cursor)
      .then((result) => {
        if (gen !== genRef.current) return
        stagedRef.current = result.hotels
        stagedMetaRef.current = { nextCursor: result.nextCursor, hasMore: result.hasMore }
      })
      .catch(() => {
        if (gen !== genRef.current) return
        stagedRef.current = []
        stagedMetaRef.current = { nextCursor: null, hasMore: false }
      })
      .finally(() => {
        if (gen === genRef.current) inFlightRef.current = false
        if (stagingPromiseRef.current === promise) stagingPromiseRef.current = null
      })

    stagingPromiseRef.current = promise
  }, [])

  function revealStaged() {
    const hotels = stagedRef.current ?? []
    const meta = stagedMetaRef.current ?? { nextCursor: null, hasMore: false }
    stagedRef.current = null
    stagedMetaRef.current = null
    setLoadedHotels((prev) => [...prev, ...hotels])
    cursorAfterLoadedRef.current = meta.nextCursor
    setHasMore(meta.hasMore)
    if (meta.hasMore && meta.nextCursor !== null) {
      startStaging(meta.nextCursor)
    }
  }

  async function handleLoadMore() {
    if (waitingMessage !== null) return
    if (!hasMore) return

    if (stagedRef.current !== null) {
      revealStaged()
      return
    }

    const gen = genRef.current
    setWaitingMessage(WAITING_MESSAGES[Math.floor(Math.random() * WAITING_MESSAGES.length)])
    if (stagingPromiseRef.current) {
      await stagingPromiseRef.current
    }
    setWaitingMessage(null)
    if (gen !== genRef.current) return
    revealStaged()
  }

  // Silently stage the batch after the initial one, as soon as the page mounts.
  useEffect(() => {
    if (initialHasMore && initialNextCursor !== null) {
      startStaging(initialNextCursor)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Any filter change cancels in-progress staging (via the generation bump),
  // resets the grid, and fetches cursor 1 fresh. A brief loading state here
  // is fine since this is a deliberate user action, unlike Load More.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    genRef.current += 1
    inFlightRef.current = false
    stagedRef.current = null
    stagedMetaRef.current = null
    stagingPromiseRef.current = null
    setWaitingMessage(null)

    const gen = genRef.current
    setFilterLoading(true)
    setLoadedHotels([])

    fetchHotelsBatchRef.current(1).then((result) => {
      if (gen !== genRef.current) return
      setLoadedHotels(result.hotels)
      setTotalCount(result.totalCount)
      cursorAfterLoadedRef.current = result.nextCursor
      setHasMore(result.hasMore)
      setFilterLoading(false)
      if (result.hasMore && result.nextCursor !== null) {
        startStaging(result.nextCursor)
      }
    }).catch(() => {
      if (gen !== genRef.current) return
      setLoadedHotels([])
      setTotalCount(0)
      cursorAfterLoadedRef.current = null
      setHasMore(false)
      setFilterLoading(false)
    })
  }, [location, propertyCategory, propertyType, amenities, foodType, viewType, compatibility, selectedPrice, startStaging])

  // Back-to-top visibility
  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > window.innerHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Filter handlers ────────────────────────────────────────────────────────

  function toggleInList(setter: (fn: (prev: string[]) => string[]) => void, value: string) {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  function togglePrice(label: string) {
    setSelectedPrice((prev) => (prev === label ? null : label))
  }

  function clearAll() {
    setLocation('')
    setPropertyCategory('')
    setPropertyType('')
    setAmenities([])
    setFoodType([])
    setViewType([])
    setCompatibility([])
    setSelectedPrice(null)
  }

  const activeFilterCount =
    (location ? 1 : 0) + (propertyCategory ? 1 : 0) + (propertyType ? 1 : 0) +
    amenities.length + foodType.length + viewType.length + compatibility.length + (selectedPrice ? 1 : 0)
  const filtersActive = activeFilterCount > 0

  const pills: { key: string; label: string; onRemove: () => void }[] = [
    ...(location ? [{ key: 'location', label: location, onRemove: () => setLocation('') }] : []),
    ...(propertyCategory ? [{ key: 'category', label: propertyCategory, onRemove: () => setPropertyCategory('') }] : []),
    ...(propertyType ? [{ key: 'type', label: propertyType, onRemove: () => setPropertyType('') }] : []),
    ...amenities.map((a) => ({ key: `amenity-${a}`, label: a, onRemove: () => toggleInList(setAmenities, a) })),
    ...foodType.map((f) => ({ key: `food-${f}`, label: f, onRemove: () => toggleInList(setFoodType, f) })),
    ...viewType.map((v) => ({ key: `view-${v}`, label: v, onRemove: () => toggleInList(setViewType, v) })),
    ...compatibility.map((c) => ({ key: `compat-${c}`, label: c, onRemove: () => toggleInList(setCompatibility, c) })),
    ...(selectedPrice ? [{ key: 'price', label: selectedPrice, onRemove: () => setSelectedPrice(null) }] : []),
  ]

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showSkeleton = filterLoading
  const showEmpty = !filterLoading && loadedHotels.length === 0

  const filterPanelProps: FilterPanelProps = {
    taxonomyOptions,
    location, setLocation,
    propertyCategory, setPropertyCategory,
    propertyType, setPropertyType,
    amenities, foodType, viewType, compatibility,
    onToggleAmenity: (v: string) => toggleInList(setAmenities, v),
    onToggleFoodType: (v: string) => toggleInList(setFoodType, v),
    onToggleViewType: (v: string) => toggleInList(setViewType, v),
    onToggleCompatibility: (v: string) => toggleInList(setCompatibility, v),
    selectedPrice, onTogglePrice: togglePrice,
    filtersActive, onClearAll: clearAll,
  }

  return (
    <div>
      {/* ── Mobile sticky filter bar ── */}
      <div
        className="lg:hidden sticky z-30"
        style={{
          top: `${HEADER_HEIGHT}px`,
          background: '#FFFFFF',
          borderBottom: '1px solid #E0EBE1',
          padding: '10px 4px',
          marginBottom: '16px',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1A1A1A',
              background: '#FFFFFF',
              border: '1px solid #E0EBE1',
              borderRadius: '8px',
              padding: '8px 14px',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#888888', marginTop: '8px' }}>
          <strong style={{ color: '#1A1A1A' }}>{totalCount}</strong> hotels
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block" style={{ width: '280px', flexShrink: 0 }}>
          <div
            style={{
              position: 'sticky',
              top: `${HEADER_HEIGHT}px`,
              background: '#FFFFFF',
              border: '1px solid #E0EBE1',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <FilterPanel {...filterPanelProps} />
          </div>
        </aside>

        {/* ── Content ── */}
        <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'visible' }}>

          {/* Desktop-only results bar, pinned below the header while scrolling */}
          <div
            className="hidden lg:flex items-center flex-wrap gap-6 sticky z-20"
            style={{
              top: `${HEADER_HEIGHT}px`,
              background: '#FFFFFF',
              marginBottom: '20px',
              padding: '12px 0',
            }}
          >
            <p style={{ fontSize: '14px', color: '#888888' }}>
              <strong style={{ color: '#1A1A1A' }}>{totalCount}</strong> hotels
            </p>
          </div>

          {/* Active filter pills */}
          {filtersActive && (
            <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: '20px' }}>
              {pills.map((p) => (
                <button
                  key={p.key}
                  onClick={p.onRemove}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1E6B2E',
                    background: '#E8F5E9',
                    border: '1px solid #C8E6C9',
                    borderRadius: '999px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              <button
                onClick={clearAll}
                style={{ fontSize: '12px', color: '#D90429', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Hotel grid */}
          {!showEmpty ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
              {loadedHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
              {showSkeleton && Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
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
              <p style={{ fontSize: '16px', color: '#888888', marginBottom: '8px' }}>No hotels match your filters.</p>
              <button
                onClick={clearAll}
                style={{ fontSize: '13px', color: '#1E6B2E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Load More */}
          {hasMore && !showEmpty && (
            <div className="flex flex-col items-center" style={{ marginTop: '32px' }}>
              {waitingMessage && (
                <p style={{ fontSize: '13px', color: '#888888', marginBottom: '12px' }}>{waitingMessage}</p>
              )}
              <button
                onClick={handleLoadMore}
                disabled={waitingMessage !== null}
                style={{
                  padding: '12px 32px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: '#1E6B2E',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: waitingMessage !== null ? 'default' : 'pointer',
                  opacity: waitingMessage !== null ? 0.7 : 1,
                }}
              >
                {waitingMessage !== null ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter bottom sheet ── */}
      <div
        className="lg:hidden"
        aria-hidden={!mobileFiltersOpen}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.4)',
          opacity: mobileFiltersOpen ? 1 : 0,
          pointerEvents: mobileFiltersOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={() => setMobileFiltersOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '85vh',
            background: '#FFFFFF',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            transform: mobileFiltersOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.3s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid #E0EBE1',
              flexShrink: 0,
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Filters</h3>
            <button
              aria-label="Close filters"
              onClick={() => setMobileFiltersOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#1A1A1A' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div style={{ flex: '1 1 0', overflowY: 'auto', padding: '20px' }}>
            <FilterPanel {...filterPanelProps} hideTitle reservedBottomSpace={mobileFooterHeight} />
          </div>

          <div ref={mobileFooterRef} style={{ padding: '16px 20px', borderTop: '1px solid #E0EBE1', flexShrink: 0 }}>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                background: '#1E6B2E',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* ── Back to top ── */}
      <button
        aria-label="Back to top"
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '28px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#1E6B2E',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 40,
          opacity: showBackToTop ? 1 : 0,
          pointerEvents: showBackToTop ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Filter panel (shared by desktop sidebar and mobile sheet) ──────────────────

interface FilterPanelProps {
  taxonomyOptions: TaxonomyOptions
  location: string
  setLocation: (v: string) => void
  propertyCategory: string
  setPropertyCategory: (v: string) => void
  propertyType: string
  setPropertyType: (v: string) => void
  amenities: string[]
  foodType: string[]
  viewType: string[]
  compatibility: string[]
  onToggleAmenity: (v: string) => void
  onToggleFoodType: (v: string) => void
  onToggleViewType: (v: string) => void
  onToggleCompatibility: (v: string) => void
  selectedPrice: string | null
  onTogglePrice: (label: string) => void
  filtersActive: boolean
  onClearAll: () => void
  hideTitle?: boolean
  reservedBottomSpace?: number
}

const AMENITY_LIST_MIN_HEIGHT = 100
const AMENITY_LIST_BOTTOM_BUFFER = 24

const selectStyle = {
  width: '100%',
  fontSize: '13px',
  color: '#1A1A1A',
  border: '1px solid #E0EBE1',
  borderRadius: '8px',
  padding: '8px 10px',
  background: '#FFFFFF',
  cursor: 'pointer',
}

function FilterPanel({
  taxonomyOptions,
  location, setLocation,
  propertyCategory, setPropertyCategory,
  propertyType, setPropertyType,
  amenities, foodType, viewType, compatibility,
  onToggleAmenity, onToggleFoodType, onToggleViewType, onToggleCompatibility,
  selectedPrice, onTogglePrice,
  filtersActive, onClearAll,
  hideTitle,
  reservedBottomSpace = 0,
}: FilterPanelProps) {
  const amenityListRef = useRef<HTMLDivElement | null>(null)
  const restRef = useRef<HTMLDivElement | null>(null)
  const [amenityMaxHeight, setAmenityMaxHeight] = useState(240)

  useLayoutEffect(() => {
    function recalc() {
      const listTop = amenityListRef.current?.getBoundingClientRect().top ?? 0
      const restHeight = restRef.current?.getBoundingClientRect().height ?? 0
      const available = window.innerHeight - listTop - restHeight - reservedBottomSpace - AMENITY_LIST_BOTTOM_BUFFER
      setAmenityMaxHeight(Math.max(AMENITY_LIST_MIN_HEIGHT, Math.round(available)))
    }
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [reservedBottomSpace])

  return (
    <div>
      {!hideTitle && (
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Filter By
        </h3>
      )}

      {/* Location, Property Category, Property Type dropdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '6px' }}>Location</p>
          <select value={location} onChange={(e) => setLocation(e.target.value)} style={selectStyle}>
            <option value="">All Locations</option>
            {taxonomyOptions.hotel_locations.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '6px' }}>Property Category</p>
          <select value={propertyCategory} onChange={(e) => setPropertyCategory(e.target.value)} style={selectStyle}>
            <option value="">All Categories</option>
            {taxonomyOptions.hotel_property_category.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '6px' }}>Property Type</p>
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={selectStyle}>
            <option value="">All Types</option>
            {taxonomyOptions.hotel_property_type.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Amenities: only this list scrolls internally, height measured to fit
          above Food Type, View Type and Price, same fitting trick as packages. */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Amenities</p>
        <div
          ref={amenityListRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: `${amenityMaxHeight}px`,
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {taxonomyOptions.hotel_amenities.map((name) => (
            <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={amenities.includes(name)}
                onChange={() => onToggleAmenity(name)}
                style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{name}</span>
            </label>
          ))}
        </div>
      </div>

      <div ref={restRef}>
        <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

        {/* Food Type */}
        {taxonomyOptions.hotel_food_type.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Food Type</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {taxonomyOptions.hotel_food_type.map((name) => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={foodType.includes(name)}
                    onChange={() => onToggleFoodType(name)}
                    style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* View Type */}
        {taxonomyOptions.hotel_view_type.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>View Type</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {taxonomyOptions.hotel_view_type.map((name) => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={viewType.includes(name)}
                    onChange={() => onToggleViewType(name)}
                    style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Compatibility */}
        {taxonomyOptions.hotel_compatibility.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Compatibility</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {taxonomyOptions.hotel_compatibility.map((name) => (
                <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={compatibility.includes(name)}
                    onChange={() => onToggleCompatibility(name)}
                    style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

        {/* Price */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Price Range</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PRICE_RANGES.map((r) => (
              <label key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedPrice === r.label}
                  onChange={() => onTogglePrice(r.label)}
                  style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{r.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {filtersActive && (
        <button
          onClick={onClearAll}
          style={{
            marginTop: '20px',
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
  )
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E0EBE1' }}>
      <div style={{ height: '200px', background: '#E5E7EB' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '10px', width: '40%', background: '#E5E7EB', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '85%', background: '#E5E7EB', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '60%', background: '#E5E7EB', borderRadius: '4px' }} />
        <div style={{ height: '20px', width: '45%', background: '#E5E7EB', borderRadius: '4px', marginTop: '8px' }} />
      </div>
    </div>
  )
}
