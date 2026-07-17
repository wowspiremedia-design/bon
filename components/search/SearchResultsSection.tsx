'use client'

import { useState } from 'react'
import SearchResultCard from './SearchResultCard'
import type { SearchResultItem, SearchResultType } from '@/lib/payload-search-api'

interface Props {
  type: SearchResultType
  label: string
  query: string
  initialItems: SearchResultItem[]
  initialTotal: number
}

export default function SearchResultsSection({ type, label, query, initialItems, initialTotal }: Props) {
  const [items, setItems] = useState(initialItems)
  const [total, setTotal] = useState(initialTotal)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cursor, setCursor] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  if (items.length === 0) return null

  async function viewAll() {
    setExpanded(true)
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}s&cursor=1`)
      const data = await res.json()
      const group = data[`${type}s`]
      setItems(group?.items ?? [])
      setTotal(group?.total ?? 0)
      setCursor(2)
      setHasMore((group?.items?.length ?? 0) < (group?.total ?? 0))
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}s&cursor=${cursor}`)
      const data = await res.json()
      const group = data[`${type}s`]
      const newItems: SearchResultItem[] = group?.items ?? []
      setItems((prev) => [...prev, ...newItems])
      setCursor((c) => c + 1)
      setHasMore(items.length + newItems.length < total)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>
          {label} <span style={{ color: '#888888', fontWeight: 400 }}>({total})</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '16px' }}>
        {items.map((item) => (
          <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
      {!expanded && total > items.length && (
        <button
          onClick={viewAll}
          disabled={loading}
          style={{ marginTop: '14px', fontSize: '13px', fontWeight: 600, color: '#1E6B2E', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Loading...' : `View all ${total} ${label.toLowerCase()}`}
        </button>
      )}
      {expanded && hasMore && (
        <div className="flex justify-center" style={{ marginTop: '20px' }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{ padding: '10px 28px', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', background: '#1E6B2E', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
