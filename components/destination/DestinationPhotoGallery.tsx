'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  destination: string
}

export default function DestinationPhotoGallery({ images, destination }: Props) {
  if (images.length === 0) return null

  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const startAutoScroll = () => {
    intervalRef.current = setInterval(() => {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' })
      }
    }, 3000)
  }

  const stopAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  useEffect(() => {
    startAutoScroll()
    return () => stopAutoScroll()
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 relative">
      <div className="mb-6">
        <h2
          className="font-bold text-gray-900 mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 1.875rem)' }}
        >
          Photo Gallery
        </h2>
        <p className="text-gray-500 text-sm">Explore highlights from {destination}</p>
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => { stopAutoScroll(); scroll('left'); startAutoScroll() }}
        className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white transition"
        aria-label="Previous image"
      >
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => { stopAutoScroll(); scroll('right'); startAutoScroll() }}
        className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white transition"
        aria-label="Next image"
      >
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>

      {/* Scrollable gallery */}
      <div
        ref={scrollRef}
        onMouseEnter={stopAutoScroll}
        onMouseLeave={startAutoScroll}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="flex-shrink-0 w-72 md:w-80 h-[280px] md:h-[320px] rounded-2xl overflow-hidden snap-start relative group"
          >
            <Image
              src={src}
              alt={`${destination} - photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 288px, 320px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </section>
  )
}
