'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'

export interface HeroSlide {
  title: string
  sub_title: string
  image: string
  button_text: string
  button_url: string
}

interface Props {
  slides: HeroSlide[]
}

export default function HeroCarousel({ slides }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -440, behavior: 'smooth' })
  }
  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 440, behavior: 'smooth' })
  }

  if (slides.length === 0) return null

  return (
    <section className="w-full bg-[#0D1A0F] pt-6 md:pt-8 pb-4 md:pb-6 overflow-hidden">

      {/* Section header */}
      <div className="text-center mb-6">
        <p className="text-[#C8A96A] text-xs uppercase tracking-[0.3em] font-semibold mb-2">
          FEATURED JOURNEYS
        </p>
        <h2
          className="font-bold text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}
        >
          Handpicked for You
        </h2>
        <div className="w-12 h-[2px] bg-[#C8A96A] mx-auto" />
      </div>

      {/* Cards row with side arrows */}
      <div className="relative">

        {/* Left arrow */}
        <button
          onClick={scrollLeft}
          aria-label="Scroll left"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 border border-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-5 px-6 md:px-12 pb-4 snap-x snap-mandatory overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[340px] md:w-[440px] h-[440px] md:h-[500px] rounded-3xl overflow-hidden relative snap-start cursor-pointer group"
            >
              {/* Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 768px) 340px, 440px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gold accent top line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C8A96A] via-amber-300 to-[#C8A96A] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Pill badge - independently positioned, unaffected by title/subtitle wrapping */}
              <span className="absolute top-4 left-4 md:top-5 md:left-5 z-10 inline-block bg-[#C8A96A]/90 border border-[#C8A96A] text-[#1A1A1A] text-xs px-3 py-1 rounded-full font-medium">
                BON VOYAGERS JOURNEY
              </span>

              {/* Card content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3
                  className="font-bold text-white mb-2 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)' }}
                >
                  {slide.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-2">
                  {slide.sub_title}
                </p>
                <Link
                  href={slide.button_url}
                  className="inline-flex items-center gap-2 bg-[#C8A96A] hover:bg-amber-400 text-black font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-300 hover:gap-3"
                >
                  {slide.button_text}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={scrollRight}
          aria-label="Scroll right"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 border border-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

      </div>
    </section>
  )
}
