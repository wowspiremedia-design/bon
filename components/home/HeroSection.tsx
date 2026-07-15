'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  label?: string
  headline?: ReactNode
  subtitle?: string
}

export default function HeroSection({ images, label, headline, subtitle }: Props) {
  const [current, setCurrent] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  const displayLabel = label ?? 'BON VOYAGERS'
  const displayHeadline = headline ?? (<>Soulful, Slow &<br />Smart Travel</>)
  const displaySubtitle = subtitle ?? "Discover India's most extraordinary destinations with Bon Voyagers"

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setResetKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [resetKey, images.length])

  const prev = () => goTo((current - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))
  const next = () => goTo((current + 1) % Math.max(images.length, 1))

  return (
    <div className="relative w-full h-[57vh] md:h-[80vh] overflow-hidden">

      {/* Background */}
      {images.length === 0 ? (
        <div className="absolute inset-0 bg-[#1E6B2E]" />
      ) : (
        images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            quality={68}
            className="object-cover"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'scale(1.08)' : 'scale(1)',
              transition: i === current
                ? 'opacity 1000ms ease, transform 8000ms ease-out'
                : 'opacity 1000ms ease',
            }}
          />
        ))
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-black/40 to-transparent" />

      {/* Text overlay */}
      <div className="absolute bottom-0 z-20 left-16 right-16 md:left-24 md:right-24 pb-12 md:pb-20">
        <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-[#C8A96A] mb-4 font-medium">
          {displayLabel}
        </p>
        <h1 className="text-hero-title text-white mb-4">
          {displayHeadline}
        </h1>
        <div className="w-20 h-[2px] bg-[#C8A96A] mb-6" />
        {displaySubtitle && (
          <p className="text-white/70 text-sm md:text-base max-w-lg leading-relaxed">
            {displaySubtitle}
          </p>
        )}
      </div>

      {/* Left arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group p-2 flex items-center justify-center cursor-pointer"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'bg-[#C8A96A] w-6'
                    : 'bg-white/40 group-hover:bg-white/70 w-1.5'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
