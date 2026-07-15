'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { resolveMediaUrl } from '@/lib/payload-api'

export default function PageLoader() {
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const [mounted, setMounted] = useState(false)
  const [show, setShow] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (isHomepage) return

    setMounted(true)

    const alreadyLoaded = sessionStorage.getItem('bv_loaded')
    if (!alreadyLoaded) {
      sessionStorage.setItem('bv_loaded', '1')
      const fadeTimer = setTimeout(() => {
        setFading(true)
        setTimeout(() => setShow(false), 500)
      }, 2000)
      return () => clearTimeout(fadeTimer)
    } else {
      setShow(false)
    }
  }, [isHomepage])

  if (isHomepage) return null
  if (!mounted || !show) return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center backdrop-blur-md"
      style={{
        zIndex: 99999,
        background: 'rgba(255,255,255,0.85)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {/* Logo */}
      <Image
        src={resolveMediaUrl('/api/media/file/bon-logo.png')!}
        alt="Bon Voyagers"
        width={176}
        height={56}
        priority
        style={{ width: '176px', height: '56px', objectFit: 'contain' }}
      />

      {/* Spinner */}
      <div className="relative mt-8" style={{ width: '64px', height: '64px' }}>
        {/* Static outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
        {/* Spinning accent */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
        />
      </div>

      {/* Heading */}
      <p
        style={{
          marginTop: '32px',
          fontSize: '20px',
          fontWeight: 600,
          color: '#1A1A1A',
        }}
      >
        Crafting Your Journey
      </p>

      {/* Subtext */}
      <p
        style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#888888',
          textAlign: 'center',
          maxWidth: '320px',
        }}
      >
        Curating destinations, experiences and unforgettable memories...
      </p>

      {/* Bouncing dots */}
      <div className="flex gap-[6px] mt-5">
        {[0, 0.15, 0.3].map((delay) => (
          <span
            key={delay}
            className="block w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#1E6B2E', animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      {/* Brand wordmark */}
      <p
        className="absolute bottom-10"
        style={{
          fontSize: '11px',
          letterSpacing: '0.3em',
          color: '#AAAAAA',
          textTransform: 'uppercase',
        }}
      >
        Bon Voyagers
      </p>
    </div>
  )
}
