'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface DestinationCardProps {
  name: string
  slug: string
  image: string
  count: number
}

export default function DestinationCard({ name, slug, image, count }: DestinationCardProps) {
  return (
    <Link
      href={`/destination/${slug}`}
      className="group relative block w-full overflow-hidden rounded-[20px] transition-transform duration-300 ease-out hover:scale-[1.02]"
      style={{ aspectRatio: '4 / 5' }}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 768px) 74vw, 340px"
        style={{ objectFit: 'cover' }}
      />

      {/* Dark gradient overlay for text readability */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '45%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))',
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
        <h3
          className="font-display"
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 'clamp(22px, 3vw, 26px)',
            lineHeight: 1.2,
            marginBottom: '10px',
          }}
        >
          {name}
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="rounded-full"
            style={{
              background: 'rgba(0,0,0,0.45)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              padding: '4px 12px',
            }}
          >
            {count} Experiences
          </span>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>
            Explore →
          </span>
        </div>
      </div>
    </Link>
  )
}
