'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import PackageCard, { type PackageCardProps } from '@/components/shared/PackageCard'

// ── Config ─────────────────────────────────────────────────────────────────────

const HEADER_HEIGHT = 72

// Infinite scroll trigger: fires once the 6th loaded card (index 5) is visible,
// then moves forward 12 cards for each subsequent trigger.
const TRIGGER_START_INDEX = 5
const TRIGGER_STEP = 12

const PRICE_RANGES = [
  { label: '₹2,000 – ₹5,000',   min: 2000,  max: 5000 },
  { label: '₹5,000 – ₹10,000',  min: 5000,  max: 10000 },
  { label: '₹10,000 – ₹15,000', min: 10000, max: 15000 },
  { label: '₹15,000 – ₹20,000', min: 15000, max: 20000 },
  { label: '₹20,000+',          min: 20000, max: Infinity },
]

const DURATION_RANGES = [
  { key: '1-3',  label: '1–3 Days',  min: 1,  max: 3 },
  { key: '4-6',  label: '4–6 Days',  min: 4,  max: 6 },
  { key: '7-10', label: '7–10 Days', min: 7,  max: 10 },
  { key: '10+',  label: '10+ Days',  min: 11, max: Infinity },
]

const EXPERIENCE_TYPE_OPTIONS = [
  { key: 'adventure',      label: 'Adventure' },
  { key: 'family',         label: 'Family' },
  { key: 'leisure',        label: 'Leisure' },
  { key: 'luxury',         label: 'Luxury' },
  { key: 'offbeat',        label: 'Offbeat' },
  { key: 'spiritual',      label: 'Spiritual' },
  { key: 'women_friendly', label: 'Women Friendly' },
]

const ACTIVITIES_OPTIONS = [
  { key: 'adventure_rides',   label: 'Adventure Rides' },
  { key: 'camping',           label: 'Camping' },
  { key: 'forest_trails',     label: 'Forest Trails' },
  { key: 'heritage_culture',  label: 'Heritage & Culture' },
  { key: 'photography',      label: 'Photography' },
  { key: 'riverside_stay',    label: 'Riverside Stay' },
  { key: 'snow_experience',   label: 'Snow Experience' },
  { key: 'tea_garden_stay',   label: 'Tea Garden Stay' },
  { key: 'trekking',          label: 'Trekking' },
  { key: 'village_walk',      label: 'Village Walk' },
  { key: 'water_activities',  label: 'Water Activities' },
  { key: 'waterfalls',        label: 'Waterfalls' },
  { key: 'wellness_nature',   label: 'Wellness & Nature' },
  { key: 'wildlife',          label: 'Wildlife' },
]

const BEST_SEASON_OPTIONS = [
  { key: 'autumn',  label: 'Autumn' },
  { key: 'monsoon', label: 'Monsoon' },
  { key: 'spring',  label: 'Spring' },
  { key: 'summer',  label: 'Summer' },
  { key: 'winter',  label: 'Winter' },
]

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Popular' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration',   label: 'Duration' },
] as const

type SortValue = typeof SORT_OPTIONS[number]['value']

// ── Props ──────────────────────────────────────────────────────────────────────

interface CategoryOption {
  id: number
  name: string
  slug: string
  count: number
}

interface Props {
  categories: CategoryOption[]
  initialPackages: PackageCardProps[]
  initialNextCursor: number | null
  initialHasMore: boolean
  initialTotalCount: number
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AllPackagesClient({
  categories,
  initialPackages,
  initialNextCursor,
  initialHasMore,
  initialTotalCount,
}: Props) {
  const [selectedCategories, setSelectedCategories]           = useState<number[]>([])
  const [selectedExperienceTypes, setSelectedExperienceTypes] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities]           = useState<string[]>([])
  const [selectedBestSeasons, setSelectedBestSeasons]         = useState<string[]>([])
  const [selectedPrice, setSelectedPrice]                     = useState<string | null>(null)
  const [selectedDurations, setSelectedDurations]             = useState<string[]>([])
  const [sort, setSort]                                       = useState<SortValue>('popular')

  const [packages, setPackages]     = useState<PackageCardProps[]>(initialPackages)
  const [cursor, setCursor]         = useState<number | null>(initialNextCursor)
  const [hasMore, setHasMore]       = useState<boolean>(initialHasMore)
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount)
  const [loading, setLoading]       = useState(false)

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showBackToTop, setShowBackToTop]         = useState(false)

  const isFirstRender = useRef(true)
  const requestIdRef  = useRef(0)

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  // Measure the mobile drawer's Apply footer so the drawer's filter panel
  // knows how much space to reserve below it when fitting the category list.
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

  const fetchPackages = useCallback(async (targetCursor: number, mode: 'replace' | 'append') => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (selectedCategories.length > 0) qs.set('categories', selectedCategories.join(','))
      const priceRange = PRICE_RANGES.find((r) => r.label === selectedPrice)
      if (priceRange) {
        qs.set('minPrice', String(priceRange.min))
        if (Number.isFinite(priceRange.max)) qs.set('maxPrice', String(priceRange.max))
      }
      if (selectedDurations.length > 0) qs.set('duration', selectedDurations.join(','))
      if (selectedExperienceTypes.length > 0) qs.set('experienceType', selectedExperienceTypes.join(','))
      if (selectedActivities.length > 0) qs.set('activities', selectedActivities.join(','))
      if (selectedBestSeasons.length > 0) qs.set('bestSeason', selectedBestSeasons.join(','))
      qs.set('sort', sort)
      qs.set('cursor', String(targetCursor))

      const res = await fetch(`/api/packages?${qs.toString()}`)
      const data = await res.json()

      if (requestId !== requestIdRef.current) return

      const newPackages: PackageCardProps[] = Array.isArray(data.packages) ? data.packages : []
      setPackages((prev) => (mode === 'replace' ? newPackages : [...prev, ...newPackages]))
      setCursor(typeof data.nextCursor === 'number' ? data.nextCursor : null)
      setHasMore(Boolean(data.hasMore))
      if (mode === 'replace' && typeof data.totalCount === 'number') {
        setTotalCount(data.totalCount)
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [selectedCategories, selectedPrice, selectedDurations, selectedExperienceTypes, selectedActivities, selectedBestSeasons, sort])

  // Infinite scroll: instead of a single sentinel after the last card, a
  // moving trigger point watches whichever loaded card currently sits at
  // triggerIndexRef. Starts at the 6th card (index 5). Once that card is
  // visible, the next batch fetches immediately and the trigger point
  // moves forward by 12 cards, ready to fire again once the user reaches
  // that position (which may already be loaded, or may require the fetch
  // that was just triggered to complete first).
  const hasMoreRef = useRef(hasMore)
  const loadingRef = useRef(loading)
  const cursorRef = useRef(cursor)
  const fetchPackagesRef = useRef(fetchPackages)

  useEffect(() => { hasMoreRef.current = hasMore }, [hasMore])
  useEffect(() => { loadingRef.current = loading }, [loading])
  useEffect(() => { cursorRef.current = cursor }, [cursor])
  useEffect(() => { fetchPackagesRef.current = fetchPackages }, [fetchPackages])

  const cardElsRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const cardRefCallbacksRef = useRef<Map<number, (el: HTMLDivElement | null) => void>>(new Map())
  const triggerIndexRef = useRef(TRIGGER_START_INDEX)
  const firedForIndexRef = useRef<number | null>(null)
  const observedIndexRef = useRef<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const attachObserverToIndex = useCallback((index: number) => {
    const observer = observerRef.current
    if (!observer) return
    if (observedIndexRef.current === index) return

    if (observedIndexRef.current !== null) {
      const oldEl = cardElsRef.current.get(observedIndexRef.current)
      if (oldEl) observer.unobserve(oldEl)
      observedIndexRef.current = null
    }

    const el = cardElsRef.current.get(index)
    if (el) {
      observer.observe(el)
      observedIndexRef.current = index
    }
  }, [])

  const registerCard = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      cardElsRef.current.set(index, el)
      if (index === triggerIndexRef.current && observedIndexRef.current !== index) {
        attachObserverToIndex(index)
      }
    } else {
      cardElsRef.current.delete(index)
    }
  }, [attachObserverToIndex])

  function getCardRefCallback(index: number) {
    let cb = cardRefCallbacksRef.current.get(index)
    if (!cb) {
      cb = (el: HTMLDivElement | null) => registerCard(index, el)
      cardRefCallbacksRef.current.set(index, cb)
    }
    return cb
  }

  // Shared by both the IntersectionObserver callback and the scroll fallback
  // below, so the two detection mechanisms can never both fire for the same
  // trigger card: firedForIndexRef is checked and set here, synchronously,
  // before either path does anything else.
  //
  // The in-flight check comes first and is also synchronous: loadingRef is
  // set to true here, immediately, before fetchPackagesRef is even called,
  // not left to catch up later via the loading state's own effect sync.
  // Without this, two different trigger indices could both read the same
  // not-yet-advanced cursorRef.current and both fire a fetch for the same
  // page before either one resolves.
  const triggerFetchIfNeeded = useCallback(() => {
    if (loadingRef.current) return

    const idx = triggerIndexRef.current
    if (firedForIndexRef.current === idx) return
    if (!hasMoreRef.current || cursorRef.current === null) return

    loadingRef.current = true
    firedForIndexRef.current = idx
    fetchPackagesRef.current(cursorRef.current, 'append')

    triggerIndexRef.current = idx + TRIGGER_STEP
    attachObserverToIndex(triggerIndexRef.current)
  }, [attachObserverToIndex])

  // Create the IntersectionObserver once. It always watches whichever card
  // is currently at triggerIndexRef, reattaching itself as that index moves.
  // A generous rootMargin counts a card as reached while it is still
  // hundreds of pixels outside the actual viewport, so a fast scroll has a
  // much wider window in which a check cycle can catch it.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting) return
        triggerFetchIfNeeded()
      },
      { rootMargin: '600px 0px 600px 0px' },
    )

    observerRef.current = observer

    // Ref callbacks for already-mounted cards run during commit, before this
    // effect exists, so the card at the current trigger index may already be
    // registered in cardElsRef but never got attached. Catch up here.
    attachObserverToIndex(triggerIndexRef.current)

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [attachObserverToIndex, triggerFetchIfNeeded])

  // Fallback safety check: IntersectionObserver only checks intersections
  // periodically, not on every pixel of scroll, so a card can transit fully
  // through the viewport between two check cycles and never get reported as
  // intersecting. On each throttled scroll tick, directly measure the
  // current trigger card and fire the same trigger logic if it has reached
  // or passed the bottom of the viewport. Throttled via requestAnimationFrame
  // so this never runs more than once per frame.
  useEffect(() => {
    let ticking = false

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const el = cardElsRef.current.get(triggerIndexRef.current)
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (rect.top <= window.innerHeight) {
          triggerFetchIfNeeded()
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [triggerFetchIfNeeded])

  // Any filter or sort change replaces the grid with a fresh fetch from cursor 1,
  // and resets the moving trigger point back to the 6th card.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const observer = observerRef.current
    if (observer && observedIndexRef.current !== null) {
      const el = cardElsRef.current.get(observedIndexRef.current)
      if (el) observer.unobserve(el)
    }
    cardElsRef.current.clear()
    triggerIndexRef.current = TRIGGER_START_INDEX
    firedForIndexRef.current = null
    observedIndexRef.current = null

    setPackages([])
    fetchPackages(1, 'replace')
  }, [selectedCategories, selectedPrice, selectedDurations, selectedExperienceTypes, selectedActivities, selectedBestSeasons, sort, fetchPackages])

  // Back-to-top visibility
  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > window.innerHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Filter handlers ────────────────────────────────────────────────────────

  function toggleCategory(id: number) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  function toggleExperienceType(key: string) {
    setSelectedExperienceTypes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  function toggleActivity(key: string) {
    setSelectedActivities((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  function toggleBestSeason(key: string) {
    setSelectedBestSeasons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  function togglePrice(label: string) {
    setSelectedPrice((prev) => (prev === label ? null : label))
  }

  function toggleDuration(key: string) {
    setSelectedDurations((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]))
  }

  function clearAll() {
    setSelectedCategories([])
    setSelectedExperienceTypes([])
    setSelectedActivities([])
    setSelectedBestSeasons([])
    setSelectedPrice(null)
    setSelectedDurations([])
  }

  const activeFilterCount = selectedCategories.length
    + selectedExperienceTypes.length
    + selectedActivities.length
    + selectedBestSeasons.length
    + (selectedPrice ? 1 : 0)
    + selectedDurations.length
  const filtersActive = activeFilterCount > 0

  const pills: { key: string; label: string; onRemove: () => void }[] = [
    ...selectedCategories.map((id) => {
      const cat = categories.find((c) => c.id === id)
      return { key: `cat-${id}`, label: cat?.name ?? String(id), onRemove: () => toggleCategory(id) }
    }),
    ...selectedExperienceTypes.map((key) => {
      const o = EXPERIENCE_TYPE_OPTIONS.find((opt) => opt.key === key)
      return { key: `exp-${key}`, label: o?.label ?? key, onRemove: () => toggleExperienceType(key) }
    }),
    ...selectedActivities.map((key) => {
      const o = ACTIVITIES_OPTIONS.find((opt) => opt.key === key)
      return { key: `act-${key}`, label: o?.label ?? key, onRemove: () => toggleActivity(key) }
    }),
    ...selectedBestSeasons.map((key) => {
      const o = BEST_SEASON_OPTIONS.find((opt) => opt.key === key)
      return { key: `season-${key}`, label: o?.label ?? key, onRemove: () => toggleBestSeason(key) }
    }),
    ...(selectedPrice ? [{ key: 'price', label: selectedPrice, onRemove: () => setSelectedPrice(null) }] : []),
    ...selectedDurations.map((key) => {
      const d = DURATION_RANGES.find((r) => r.key === key)
      return { key: `dur-${key}`, label: d?.label ?? key, onRemove: () => toggleDuration(key) }
    }),
  ]

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showSkeleton = loading
  const showEmpty = !loading && packages.length === 0

  return (
    <div>
      {/* ── Mobile sticky filter/sort bar ── */}
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

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#1A1A1A',
              border: '1px solid #E0EBE1',
              borderRadius: '8px',
              padding: '8px 10px',
              background: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <p style={{ fontSize: '12px', color: '#888888', marginTop: '8px' }}>
          <strong style={{ color: '#1A1A1A' }}>{totalCount}</strong> packages
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
              maxHeight: `calc(100vh - ${HEADER_HEIGHT + CATEGORY_LIST_BOTTOM_BUFFER}px)`,
              overflowY: 'auto',
            }}
          >
            <FilterPanel
              categories={sortedCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              selectedExperienceTypes={selectedExperienceTypes}
              onToggleExperienceType={toggleExperienceType}
              selectedActivities={selectedActivities}
              onToggleActivity={toggleActivity}
              selectedBestSeasons={selectedBestSeasons}
              onToggleBestSeason={toggleBestSeason}
              selectedPrice={selectedPrice}
              onTogglePrice={togglePrice}
              selectedDurations={selectedDurations}
              onToggleDuration={toggleDuration}
              filtersActive={filtersActive}
              onClearAll={clearAll}
            />
          </div>
        </aside>

        {/* ── Content ── */}
        <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'visible' }}>

          {/* Desktop-only sort bar, pinned below the header while scrolling */}
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
              <strong style={{ color: '#1A1A1A' }}>{totalCount}</strong> packages
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

          {/* Package grid */}
          {!showEmpty ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px' }}>
              {packages.map((pkg, index) => (
                <div key={pkg.id} ref={getCardRefCallback(index)}>
                  <PackageCard {...pkg} />
                </div>
              ))}
              {showSkeleton && Array.from({ length: packages.length === 0 ? 6 : 3 }).map((_, i) => (
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
              <p style={{ fontSize: '16px', color: '#888888', marginBottom: '8px' }}>No packages match your filters.</p>
              <button
                onClick={clearAll}
                style={{ fontSize: '13px', color: '#1E6B2E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear all filters
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
            <FilterPanel
              categories={sortedCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              selectedExperienceTypes={selectedExperienceTypes}
              onToggleExperienceType={toggleExperienceType}
              selectedActivities={selectedActivities}
              onToggleActivity={toggleActivity}
              selectedBestSeasons={selectedBestSeasons}
              onToggleBestSeason={toggleBestSeason}
              selectedPrice={selectedPrice}
              onTogglePrice={togglePrice}
              selectedDurations={selectedDurations}
              onToggleDuration={toggleDuration}
              filtersActive={filtersActive}
              onClearAll={clearAll}
              hideTitle
              reservedBottomSpace={mobileFooterHeight}
            />
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
  categories: CategoryOption[]
  selectedCategories: number[]
  onToggleCategory: (id: number) => void
  selectedExperienceTypes: string[]
  onToggleExperienceType: (key: string) => void
  selectedActivities: string[]
  onToggleActivity: (key: string) => void
  selectedBestSeasons: string[]
  onToggleBestSeason: (key: string) => void
  selectedPrice: string | null
  onTogglePrice: (label: string) => void
  selectedDurations: string[]
  onToggleDuration: (key: string) => void
  filtersActive: boolean
  onClearAll: () => void
  hideTitle?: boolean
  reservedBottomSpace?: number
}

const CATEGORY_LIST_BOTTOM_BUFFER = 24
const SHOW_MORE_THRESHOLD = 5

function FilterPanel({
  categories,
  selectedCategories,
  onToggleCategory,
  selectedExperienceTypes,
  onToggleExperienceType,
  selectedActivities,
  onToggleActivity,
  selectedBestSeasons,
  onToggleBestSeason,
  selectedPrice,
  onTogglePrice,
  selectedDurations,
  onToggleDuration,
  filtersActive,
  onClearAll,
  hideTitle,
  reservedBottomSpace = 0,
}: FilterPanelProps) {
  const [categoryExpanded, setCategoryExpanded] = useState(false)
  const [experienceTypeExpanded, setExperienceTypeExpanded] = useState(false)
  const [activitiesExpanded, setActivitiesExpanded] = useState(false)

  const visibleCategories = categoryExpanded ? categories : categories.slice(0, SHOW_MORE_THRESHOLD)
  const visibleExperienceTypes = experienceTypeExpanded ? EXPERIENCE_TYPE_OPTIONS : EXPERIENCE_TYPE_OPTIONS.slice(0, SHOW_MORE_THRESHOLD)
  const visibleActivities = activitiesExpanded ? ACTIVITIES_OPTIONS : ACTIVITIES_OPTIONS.slice(0, SHOW_MORE_THRESHOLD)

  return (
    <div>
      {!hideTitle && (
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Filter By
        </h3>
      )}

      {/* Category */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Category</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visibleCategories.map((c) => (
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.id)}
                onChange={() => onToggleCategory(c.id)}
                style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{c.name} ({c.count})</span>
            </label>
          ))}
        </div>
        {categories.length > SHOW_MORE_THRESHOLD && (
          <p
            onClick={() => setCategoryExpanded((prev) => !prev)}
            style={{ fontSize: '13px', color: '#1E6B2E', cursor: 'pointer', textDecoration: 'none', marginTop: '8px' }}
          >
            {categoryExpanded ? 'Show less' : 'Show more'}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

      {/* Experience Type */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Experience Type</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visibleExperienceTypes.map((o) => (
            <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedExperienceTypes.includes(o.key)}
                onChange={() => onToggleExperienceType(o.key)}
                style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{o.label}</span>
            </label>
          ))}
        </div>
        {EXPERIENCE_TYPE_OPTIONS.length > SHOW_MORE_THRESHOLD && (
          <p
            onClick={() => setExperienceTypeExpanded((prev) => !prev)}
            style={{ fontSize: '13px', color: '#1E6B2E', cursor: 'pointer', textDecoration: 'none', marginTop: '8px' }}
          >
            {experienceTypeExpanded ? 'Show less' : 'Show more'}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

      {/* Activities */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Activities</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visibleActivities.map((o) => (
            <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedActivities.includes(o.key)}
                onChange={() => onToggleActivity(o.key)}
                style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{o.label}</span>
            </label>
          ))}
        </div>
        {ACTIVITIES_OPTIONS.length > SHOW_MORE_THRESHOLD && (
          <p
            onClick={() => setActivitiesExpanded((prev) => !prev)}
            style={{ fontSize: '13px', color: '#1E6B2E', cursor: 'pointer', textDecoration: 'none', marginTop: '8px' }}
          >
            {activitiesExpanded ? 'Show less' : 'Show more'}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

      {/* Best Season */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Best Season</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {BEST_SEASON_OPTIONS.map((o) => (
            <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedBestSeasons.includes(o.key)}
                onChange={() => onToggleBestSeason(o.key)}
                style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

      {/* Price range */}
      <div style={{ marginBottom: '20px' }}>
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

      <div style={{ borderTop: '1px solid #E0EBE1', marginBottom: '20px' }} />

      {/* Duration */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#4A4A4A', marginBottom: '10px' }}>Duration</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DURATION_RANGES.map((r) => (
            <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedDurations.includes(r.key)}
                onChange={() => onToggleDuration(r.key)}
                style={{ accentColor: '#1E6B2E', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', color: '#4A4A4A' }}>{r.label}</span>
            </label>
          ))}
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
      <div style={{ height: '220px', background: '#E5E7EB' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '10px', width: '40%', background: '#E5E7EB', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '85%', background: '#E5E7EB', borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '60%', background: '#E5E7EB', borderRadius: '4px' }} />
        <div style={{ height: '20px', width: '45%', background: '#E5E7EB', borderRadius: '4px', marginTop: '8px' }} />
        <div style={{ height: '38px', width: '100%', background: '#E5E7EB', borderRadius: '10px', marginTop: '8px' }} />
      </div>
    </div>
  )
}
