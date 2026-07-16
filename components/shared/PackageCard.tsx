'use client'

import Image from 'next/image'
import Link from 'next/link'
import SharePackageButton from '@/components/shared/SharePackageButton'

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
  route?: string
}

const BADGE = {
  bestseller: { label: 'Bestseller', bg: '#1E6B2E',  color: '#FFFFFF' },
  honeymoon:  { label: 'Honeymoon',  bg: '#C8A96A',  color: '#0D1A0F' },
  deal:       { label: 'Deal',       bg: '#F5A623',  color: '#FFFFFF' },
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
  route,
}: PackageCardProps) {
  const badge = badgeType ? BADGE[badgeType] : null
  const discountPct = onSale && regularPrice > 0
    ? Math.round((1 - price / regularPrice) * 100)
    : 0
  const routeDuration = route && route.length >= 40 ? '12s' : '8s'

  return (
    <>
      <style>{`
        @keyframes routeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .route-wrapper { overflow: hidden; width: 100%; min-width: 0; }
        .route-static  { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; color: #888888; }
        .route-marquee { display: none; overflow: hidden; }
        .route-marquee-inner { display: inline-block; white-space: nowrap; will-change: transform; animation: routeScroll linear infinite; }
        .group:hover .route-static,
        .group:focus-within .route-static { display: none; }
        .group:hover .route-marquee,
        .group:focus-within .route-marquee { display: block; }

        @keyframes breathe-green {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.85; }
        }
        @keyframes breathe-amber {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.85; }
        }
        .badge-breathe-green {
          background-color: #1E6B2E;
          animation: breathe-green 2.5s ease-in-out infinite;
        }
        .badge-breathe-amber {
          background-color: #F5A623;
          animation: breathe-amber 2.5s ease-in-out infinite;
        }

        .pkg-card {
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .pkg-card:hover {
          box-shadow: 0 12px 36px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08);
          transform: translateY(-5px);
        }
      `}</style>

      <Link
        href={`/package/${slug}`}
        className="group block rounded-[16px] overflow-hidden pkg-card"
      >
        {/* ── Image ── */}
        <div className="relative h-[220px] overflow-hidden rounded-t-[16px]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 50vw, 33vw"
            quality={68}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            className="transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
          />

          {/* Badge — top left */}
          {badge && (
            <span
              className={`absolute top-3 left-3 rounded-[6px] px-[10px] py-[4px] text-[11px] leading-none z-10${
                badgeType === 'bestseller' ? ' badge-breathe-green' :
                badgeType === 'deal'       ? ' badge-breathe-amber' : ''
              }`}
              style={
                (badgeType === 'bestseller' || badgeType === 'deal')
                  ? { color: badge.color, fontWeight: 700 }
                  : { background: badge.bg, color: badge.color, fontWeight: 700 }
              }
            >
              {badge.label}
            </span>
          )}

          {/* Discount % — bottom left */}
          {onSale && discountPct > 0 && (
            <span
              className="absolute bottom-3 left-3 rounded-[6px] px-[8px] py-[4px] text-[11px] leading-none z-10 badge-breathe-green"
              style={{ color: '#FFFFFF', fontWeight: 700 }}
            >
              {discountPct}% OFF
            </span>
          )}

          {/* Duration pill — bottom right */}
          {duration && (
            <span
              className="absolute bottom-3 right-3 rounded-[8px] px-[10px] py-[4px] text-[12px] leading-none z-10"
              style={{ background: 'rgba(0,0,0,0.55)', color: '#FFFFFF', fontWeight: 600 }}
            >
              {duration}
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '14px' }}>

          {/* Destination */}
          <p
            className="mb-[4px] uppercase"
            style={{
              color: '#1E6B2E',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            {destination}
          </p>

          {/* Title — 2-line clamp */}
          <h3
            className="mb-[8px] line-clamp-2"
            style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', lineHeight: '1.4' }}
          >
            {title}
          </h3>

          {/* Route */}
          {route && (
            <div className="flex items-center gap-[4px] mb-[6px]" style={{ overflow: 'hidden', width: '100%' }}>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1E6B2E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>

              <div className="route-wrapper">
                <span className="route-static">{route}</span>
                <div className="route-marquee" aria-hidden="true">
                  <div
                    className="route-marquee-inner"
                    style={{ animationDuration: routeDuration, fontSize: '11px', color: '#888888' }}
                  >
                    {route}&nbsp;&nbsp;·&nbsp;&nbsp;{route}&nbsp;&nbsp;·&nbsp;&nbsp;
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meta row — rating and reviews */}
          <div
            className="flex items-center gap-3 mb-[10px] flex-wrap"
            style={{ fontSize: '12px', color: '#888888' }}
          >
            <span className="flex items-center gap-[4px]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A96A" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {rating.toFixed(1)}
            </span>

            <span>({reviewCount.toLocaleString('en-IN')} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between gap-2 mb-2">
            <div>
              {onSale && (
                <p
                  className="line-through leading-none mb-[3px]"
                  style={{ fontSize: '13px', color: '#6B6B6B' }}
                >
                  {fmt(regularPrice)}
                </p>
              )}
              <p
                className="leading-none mb-[3px]"
                style={{ fontSize: '20px', fontWeight: 700, color: '#1E6B2E' }}
              >
                {fmt(price)}
              </p>
              <p style={{ fontSize: '12px', color: '#6B6B6B' }}>per person</p>
            </div>
            <SharePackageButton title={title} slug={slug} />
          </div>

          {/* Book Now button — full width */}
          <div
            className="w-full text-center rounded-[10px] bg-[#1E6B2E] group-hover:bg-[#155222] transition-colors duration-200"
            style={{
              color: '#FFFFFF',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            View Details
          </div>

        </div>
      </Link>
    </>
  )
}
