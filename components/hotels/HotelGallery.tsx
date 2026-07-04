'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  title: string
}

export default function HotelGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div style={{ height: '360px', background: '#E8F5E9', borderRadius: '16px' }} />
    )
  }

  const active = images[activeIndex] ?? images[0]

  return (
    <div>
      <div className="relative w-full overflow-hidden" style={{ height: '420px', borderRadius: '16px' }}>
        <Image
          src={active}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{ marginTop: '10px', paddingBottom: '4px' }}
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className="relative flex-shrink-0 overflow-hidden"
              style={{
                width: '84px',
                height: '64px',
                borderRadius: '8px',
                border: i === activeIndex ? '2px solid #1E6B2E' : '2px solid transparent',
                opacity: i === activeIndex ? 1 : 0.75,
                cursor: 'pointer',
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="84px"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
