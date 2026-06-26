'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER

const SLIDES = [
  {
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2026/03/kailash-yatra-scaled.png',
    title: 'Devbhoomi',
    subtitle: 'Sacred journeys to the abode of the divine',
  },
  {
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/11/ladakh-package.jpg',
    title: 'Discover Ladakh',
    subtitle: 'Where the mountains touch the sky',
  },
  {
    image: 'https://cms.bonvoyagers.co/wp-content/uploads/2024/10/kashmir.jpg',
    title: 'Discover Kashmir',
    subtitle: 'Paradise on Earth awaits you',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setResetKey((k) => k + 1)
  }, [])

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length)
  const next = () => goTo((current + 1) % SLIDES.length)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [resetKey])

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '560px' }}>

      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            priority={i === 0}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.06) 100%)',
        }}
      />

      {SLIDES.map((slide, i) => (
        <div
          key={slide.title}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-5 transition-opacity duration-700"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
          }}
          aria-hidden={i !== current}
        >
          <h1
            className="font-display font-bold text-white m-0"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              textShadow: '0 2px 16px rgba(0,0,0,0.45)',
            }}
          >
            {slide.title}
          </h1>

          <p
            className="text-lg font-medium max-w-xl m-0"
            style={{
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            }}
          >
            {slide.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/packages"
              className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              style={{ background: '#1E6B2E' }}
            >
              Explore Packages
            </Link>

            <Link
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
              style={{ border: '2px solid #FFFFFF' }}
            >
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/55 text-white transition-colors duration-200"
        style={{ width: '44px', height: '44px' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/55 text-white transition-colors duration-200"
        style={{ width: '44px', height: '44px' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              height: '8px',
              width: i === current ? '24px' : '8px',
              background: i === current ? '#C8A96A' : 'rgba(255,255,255,0.55)',
            }}
          />
        ))}
      </div>
    </section>
  )
}
