'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface PackageCardProps {
  id: number
  slug: string
  title: string
  image: string
  price: number
  regularPrice: number
  onSale: boolean
  duration: string
  rating: number
  reviewCount: number
  destination: string
  badgeType: 'bestseller' | 'honeymoon' | 'deal' | 'luxury' | 'budget' | null
}

const BADGE = {
  bestseller: { label: 'Bestseller', bg: '#1E6B2E',  color: '#FFFFFF' },
  honeymoon:  { label: 'Honeymoon',  bg: '#C8A96A',  color: '#0D1A0F' },
  deal:       { label: 'Deal',       bg: '#D90429',  color: '#FFFFFF' },
  luxury:     { label: 'Luxury',     bg: '#155223',  color: '#FFFFFF' },
  budget:     { label: 'Budget',     bg: '#F5A623',  color: '#1A1A1A' },
} as const

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

export default function PackageCard({
  slug,
  title,
  image,
  price,
  regularPrice,
  onSale,
  duration,
  rating,
  reviewCount,
  destination,
  badgeType,
}: PackageCardProps) {
  const badge = badgeType ? BADGE[badgeType] : null
  const discountPct = onSale && regularPrice > 0
    ? Math.round((1 - price / regularPrice) * 100)
    : 0

  return (
    <Link
      href={`/package/${slug}`}
      className="group block rounded-[16px] overflow-hidden border border-[#E0EBE1] bg-white transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.13)]"
    >
      {/* ── Image ── */}
      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge — top left */}
        {badge && (
          <span
            className="absolute top-3 left-3 rounded-full px-[10px] py-[4px] text-[11px] font-700 leading-none z-10"
            style={{
              background: badge.bg,
              color: badge.color,
              fontWeight: 700,
            }}
          >
            {badge.label}
          </span>
        )}

        {/* Discount % — bottom left */}
        {onSale && discountPct > 0 && (
          <span
            className="absolute bottom-3 left-3 rounded-[6px] px-[8px] py-[4px] text-[11px] leading-none z-10"
            style={{
              background: 'rgba(0,0,0,0.72)',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
          >
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px' }}>

        {/* Destination */}
        <p
          className="mb-[6px]"
          style={{
            color: '#1E6B2E',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
          }}
        >
          {destination}
        </p>

        {/* Title — 2-line clamp */}
        <h3
          className="mb-[10px] line-clamp-2"
          style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', lineHeight: '1.4' }}
        >
          {title}
        </h3>

        {/* Meta row */}
        <div
          className="flex items-center gap-3 mb-[14px] flex-wrap"
          style={{ fontSize: '12px', color: '#888888' }}
        >
          {/* Duration */}
          <span className="flex items-center gap-[5px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {duration}
          </span>

          {/* Rating */}
          <span className="flex items-center gap-[4px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A96A" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {rating.toFixed(1)}
          </span>

          {/* Reviews */}
          <span>({reviewCount.toLocaleString('en-IN')} reviews)</span>
        </div>

        {/* Price + Button */}
        <div className="flex items-end justify-between gap-2">

          {/* Price stack */}
          <div>
            {onSale && (
              <p
                className="line-through leading-none mb-[3px]"
                style={{ fontSize: '12px', color: '#AAAAAA' }}
              >
                {fmt(regularPrice)}
              </p>
            )}
            <p
              className="leading-none mb-[3px]"
              style={{ fontSize: '20px', fontWeight: 800, color: '#1E6B2E' }}
            >
              {fmt(price)}
            </p>
            <p style={{ fontSize: '11px', color: '#888888' }}>per person</p>
          </div>

          {/* Book Now — div styled as button (card is already a Link) */}
          <div
            className="flex-shrink-0 rounded-[8px] transition-opacity duration-200 group-hover:opacity-90"
            style={{
              background: '#1E6B2E',
              color: '#FFFFFF',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Book Now
          </div>

        </div>
      </div>
    </Link>
  )
}
