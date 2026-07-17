'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { SearchResult, SearchResultItem } from '@/lib/payload-search-api'

const DEBOUNCE_MS = 300
const MIN_CHARS = 2

interface Props {
  variant: 'hero' | 'overlay'
  onNavigate?: () => void
  autoFocus?: boolean
}

const TYPE_LABEL = { destination: 'Destination', hotel: 'Hotel', package: 'Package' } as const
const TYPE_COLOR = { destination: '#1E6B2E', hotel: '#C8A96A', package: '#2C6E8C' } as const

export default function SearchBox({ variant, onNavigate, autoFocus }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  const canSearch = query.trim().length >= MIN_CHARS

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < MIN_CHARS) {
      setResult(null)
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        if (requestId !== requestIdRef.current) return
        setResult(data)
        setOpen(true)
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function goToResults() {
    if (!canSearch) return
    setOpen(false)
    onNavigate?.()
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function goToItem(item: SearchResultItem) {
    const path = item.type === 'destination' ? `/destination/${item.slug}`
      : item.type === 'hotel' ? `/hotel/${item.slug}`
      : `/package/${item.slug}`
    setOpen(false)
    onNavigate?.()
    router.push(path)
  }

  const allItems: SearchResultItem[] = result
    ? [...result.destinations.items, ...result.hotels.items, ...result.packages.items]
    : []

  const isHero = variant === 'hero'

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isHero ? 'rgba(255,255,255,0.95)' : '#FFFFFF',
          border: isHero ? 'none' : '1px solid #E0EBE1',
          borderRadius: '999px',
          padding: '8px 8px 8px 18px',
          boxShadow: isHero ? '0 8px 24px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') goToResults() }}
          onFocus={() => { if (allItems.length > 0) setOpen(true) }}
          placeholder="Search destinations, hotels, packages..."
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#1A1A1A' }}
        />
        <button
          onClick={goToResults}
          disabled={!canSearch}
          style={{
            flexShrink: 0,
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '999px',
            border: 'none',
            transition: 'background 0.2s ease, color 0.2s ease',
            background: canSearch ? '#1E6B2E' : '#E8ECE9',
            color: canSearch ? '#FFFFFF' : '#A9B3AC',
            cursor: canSearch ? 'pointer' : 'not-allowed',
          }}
        >
          Search
        </button>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            border: '1px solid #E0EBE1',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            maxHeight: '360px',
            overflowY: 'auto',
            zIndex: 50,
          }}
        >
          {loading && <p style={{ padding: '16px', fontSize: '13px', color: '#888888' }}>Searching...</p>}
          {!loading && allItems.length === 0 && (
            <p style={{ padding: '16px', fontSize: '13px', color: '#888888' }}>No matches yet, try a different word.</p>
          )}
          {!loading && allItems.slice(0, 8).map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => goToItem(item)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid #F2F2F2', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#F2F2F2' }}>
                {item.image && <Image src={item.image} alt={item.title} fill sizes="40px" style={{ objectFit: 'cover' }} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                <span style={{ fontSize: '11px', fontWeight: 700, color: TYPE_COLOR[item.type] }}>{TYPE_LABEL[item.type]}</span>
              </div>
            </button>
          ))}
          {!loading && allItems.length > 0 && (
            <button
              onClick={goToResults}
              style={{ width: '100%', textAlign: 'center', padding: '12px', fontSize: '13px', fontWeight: 700, color: '#1E6B2E', background: '#F7FBF7', border: 'none', cursor: 'pointer' }}
            >
              See all results for &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
