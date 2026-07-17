import { searchAll } from '@/lib/payload-search-api'
import SearchResultsSection from '@/components/search/SearchResultsSection'

export const dynamic = 'force-dynamic'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  if (query.length < 2) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: '#888888' }}>Type something to search.</p>
      </div>
    )
  }

  const results = await searchAll(query, 8)
  const totalFound = results.destinations.total + results.hotels.total + results.packages.total

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 60px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>
        Search results for &ldquo;{query}&rdquo;
      </h1>
      <p style={{ fontSize: '13px', color: '#888888', marginBottom: '28px' }}>{totalFound} results found</p>

      {totalFound === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E0EBE1' }}>
          <p style={{ fontSize: '16px', color: '#888888', marginBottom: '16px' }}>No results for &ldquo;{query}&rdquo;.</p>
          <a href="/packages" style={{ fontSize: '13px', color: '#1E6B2E', fontWeight: 600 }}>Browse all packages instead</a>
        </div>
      ) : (
        <>
          <SearchResultsSection type="destination" label="Destinations" query={query} initialItems={results.destinations.items} initialTotal={results.destinations.total} />
          <SearchResultsSection type="hotel" label="Hotels" query={query} initialItems={results.hotels.items} initialTotal={results.hotels.total} />
          <SearchResultsSection type="package" label="Packages" query={query} initialItems={results.packages.items} initialTotal={results.packages.total} />
        </>
      )}
    </div>
  )
}
