'use client'

import { useEffect, useRef, useState } from 'react'

// Hand-rolled scroll-triggered reveal, matching this codebase's existing
// convention (no animation library anywhere in the project — see
// PageLoader.tsx's animate-spin/animate-bounce, FixedDepartureCard.tsx's
// hand-written @keyframes): plain IntersectionObserver + a CSS transition,
// no new dependency.
export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 700ms ease, transform 700ms ease',
      }}
    >
      {children}
    </div>
  )
}
