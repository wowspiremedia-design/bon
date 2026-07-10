import Image from 'next/image'
import Link from 'next/link'
import type { MappedHotel as Hotel } from '@/lib/payload-hotels-api'
import { AmenityIcon } from './AmenityIcon'
import ShareHotelButton from '@/components/hotels/ShareHotelButton'

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN')

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const title = hotel.title
  const visibleAmenities = hotel.amenities.slice(0, 3)

  return (
    <Link
      href={`/hotel/${hotel.slug}`}
      className="group block rounded-[16px] overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E0EBE1',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
      }}
    >
      <div className="relative h-[200px] overflow-hidden">
        {hotel.image ? (
          <Image
            src={hotel.image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            className="transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#E8F5E9' }} />
        )}

        {hotel.propertyCategory && (
          <span
            className="absolute top-3 left-3 rounded-[6px] z-10"
            style={{
              background: '#1E6B2E',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
            }}
          >
            {hotel.propertyCategory}
          </span>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {hotel.location && (
          <p
            className="flex items-center gap-1 mb-[6px]"
            style={{ fontSize: '11px', fontWeight: 600, color: '#1E6B2E', textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1E6B2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {hotel.location}
          </p>
        )}

        <div className="flex items-start justify-between gap-2 mb-[10px]">
          <h3 className="line-clamp-2" style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1A', lineHeight: '1.4' }}>
            {title}
          </h3>
          <ShareHotelButton title={title} slug={hotel.slug} />
        </div>

        {visibleAmenities.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-[12px]">
            {visibleAmenities.map((a) => (
              <span key={a} className="flex items-center gap-1" style={{ fontSize: '12px', color: '#666666' }}>
                <AmenityIcon name={a} size={12} />
                {a}
              </span>
            ))}
          </div>
        )}

        {hotel.startingPrice !== null && (
          <p style={{ fontSize: '13px', color: '#888888' }}>
            Starting from <span style={{ fontSize: '17px', fontWeight: 700, color: '#1E6B2E' }}>{fmt(hotel.startingPrice)}</span>
          </p>
        )}
      </div>
    </Link>
  )
}
