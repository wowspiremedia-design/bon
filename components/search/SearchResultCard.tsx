import Image from 'next/image'
import Link from 'next/link'
import type { SearchResultItem } from '@/lib/payload-search-api'

const TYPE_STYLE = {
  destination: { label: 'Destination', bg: '#1E6B2E', color: '#FFFFFF', href: (slug: string) => `/destination/${slug}` },
  hotel:       { label: 'Hotel',        bg: '#C8A96A', color: '#0D1A0F', href: (slug: string) => `/hotel/${slug}` },
  package:     { label: 'Package',      bg: '#2C6E8C', color: '#FFFFFF', href: (slug: string) => `/package/${slug}` },
} as const

export default function SearchResultCard({ item }: { item: SearchResultItem }) {
  const style = TYPE_STYLE[item.type]

  return (
    <Link
      href={style.href(item.slug)}
      className="group block rounded-[12px] overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E0EBE1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.25s ease',
      }}
    >
      <div className="relative overflow-hidden" style={{ height: '140px' }}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 45vw, 220px"
            quality={68}
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#F2F2F2' }} />
        )}
        <span
          className="absolute top-2 left-2 rounded-[6px] px-[8px] py-[3px] text-[10px] leading-none"
          style={{ background: style.bg, color: style.color, fontWeight: 700 }}
        >
          {style.label}
        </span>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <h3
          className="line-clamp-2"
          style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', lineHeight: '1.35', marginBottom: '4px' }}
        >
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="line-clamp-1" style={{ fontSize: '11px', color: '#888888' }}>
            {item.subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}
