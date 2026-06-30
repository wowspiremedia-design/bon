'use client'

import { useCallback, useEffect, useState } from 'react'

interface Props {
  images: string[]
  title: string
  excerpt: string
}

export default function DestinationHeroCarousel({ images, title, excerpt }: Props) {
  const [current, setCurrent] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  const hasImages = images.length > 0

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setResetKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!hasImages || images.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [resetKey, images.length, hasImages])

  const waHref = `https://wa.me/919836755550?text=Hi%20Bon%20Voyagers%20%F0%9F%91%8B%0A%0AI'm%20interested%20in%20planning%20a%20trip%20to%20*${encodeURIComponent(title)}*`

  return (
    <div className="h-[70vh] md:h-[85vh] w-full relative overflow-hidden">

      {/* Background images */}
      {hasImages ? (
        images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? title : ''}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))
      ) : (
        <div className="absolute inset-0 bg-[#1E6B2E]" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/25 to-transparent" />

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 md:pb-16 px-6 md:px-12">
        <p className="text-xs uppercase tracking-[0.3em] text-[#C8A96A] mb-3">
          DESTINATION GUIDE
        </p>
        <h1
          className="font-bold text-white leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          {title}
        </h1>
        <div className="w-16 h-[2px] bg-[#C8A96A] mb-6" />
        {excerpt && (
          <div className="inline-block max-w-2xl mb-8 rounded-xl bg-black/40 px-4 py-3">
            <p className="text-white/75 text-sm md:text-base line-clamp-2">
              {excerpt}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <a
            href="#packages"
            className="bg-[#1E6B2E] hover:bg-[#155222] text-white px-7 py-3 rounded-xl font-semibold shadow-lg transition-colors duration-200"
          >
            Explore Packages
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/90 hover:bg-white text-black px-7 py-3 rounded-xl font-semibold shadow-lg transition-colors duration-200"
          >
            Plan My Trip
          </a>
        </div>
      </div>

      {/* Dot navigation */}
      {hasImages && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-[#C8A96A] w-4' : 'bg-white/50 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
