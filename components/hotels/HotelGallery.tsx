'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  title: string
}

// Computes the grid placement for one of the up to 4 small tiles on the
// right, given how many small tiles actually exist, so 1, 2 or 3 photos
// fill the 2x2 area evenly instead of leaving empty cells.
function getSmallTileStyle(count: number, index: number) {
  if (count === 1) return { gridColumn: '1 / 3', gridRow: '1 / 3' }
  if (count === 2) return { gridColumn: `${index + 1} / ${index + 2}`, gridRow: '1 / 3' }
  if (count === 3) {
    if (index === 0) return { gridColumn: '1 / 3', gridRow: '1 / 2' }
    return { gridColumn: `${index} / ${index + 1}`, gridRow: '2 / 3' }
  }
  return {}
}

const circleButtonStyle = {
  border: 'none',
  background: 'rgba(255,255,255,0.15)',
  color: '#FFFFFF',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function HotelGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0)
  const mobileStripRef = useRef<HTMLDivElement | null>(null)
  const mobileThumbRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  useEffect(() => {
    if (lightboxIndex === null) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLightboxIndex(null)
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === null ? prev : (prev - 1 + images.length) % images.length))
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? prev : (prev + 1) % images.length))
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxIndex, images.length])

  // Mobile: whenever the active large photo changes (from an arrow tap or a
  // thumbnail tap), bring the matching thumbnail into view within the
  // strip's own horizontal scroll area. Same approach as the shared section
  // scroll-spy nav: compute the target scroll position from the
  // thumbnail's offsetLeft/offsetWidth relative to the strip's own
  // clientWidth, and call scrollTo directly on the strip itself, never
  // scrollIntoView, so this can never affect the page's vertical scroll.
  // This only runs when the active index changes, so it never fights the
  // user manually dragging the strip at any other time.
  useEffect(() => {
    const container = mobileStripRef.current
    const thumb = mobileThumbRefs.current.get(mobileActiveIndex)
    if (!container || !thumb) return

    const containerWidth = container.clientWidth
    const thumbLeft = thumb.offsetLeft
    const thumbRight = thumbLeft + thumb.offsetWidth
    const currentScrollLeft = container.scrollLeft

    const isFullyVisible = thumbLeft >= currentScrollLeft && thumbRight <= currentScrollLeft + containerWidth
    if (isFullyVisible) return

    const maxScrollLeft = Math.max(0, container.scrollWidth - containerWidth)
    const targetScrollLeft = thumbLeft - (containerWidth - thumb.offsetWidth) / 2
    const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))

    container.scrollTo({ left: clampedScrollLeft, behavior: 'smooth' })
  }, [mobileActiveIndex])

  if (images.length === 0) {
    return (
      <div style={{ height: '360px', background: '#E8F5E9', borderRadius: '16px' }} />
    )
  }

  const largeImage = images[0]
  const smallImages = images.slice(1, 5)
  const remainingCount = images.length - 4

  function showPrev() {
    setLightboxIndex((prev) => (prev === null ? prev : (prev - 1 + images.length) % images.length))
  }
  function showNext() {
    setLightboxIndex((prev) => (prev === null ? prev : (prev + 1) % images.length))
  }

  function showMobilePrev() {
    setMobileActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }
  function showMobileNext() {
    setMobileActiveIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <>
      {/* Desktop grid, unchanged, shown at lg and above only */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: smallImages.length > 0 ? '1fr 1fr' : '1fr',
          gap: '8px',
          height: '420px',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => setLightboxIndex(0)}
          aria-label="View image 1"
          className="relative"
          style={{ padding: 0, border: 'none', cursor: 'pointer', height: '100%' }}
        >
          <Image
            src={largeImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </button>

        {smallImages.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: '8px',
              height: '100%',
            }}
          >
            {smallImages.map((src, i) => {
              const actualIndex = i + 1
              const showOverlay = i === 3 && images.length > 5
              return (
                <button
                  key={actualIndex}
                  onClick={() => setLightboxIndex(actualIndex)}
                  aria-label={`View image ${actualIndex + 1}`}
                  className="relative"
                  style={{
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                    ...getSmallTileStyle(smallImages.length, i),
                  }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="25vw"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  {showOverlay && (
                    <div
                      className="flex items-center justify-center"
                      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}
                    >
                      <span style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700 }}>
                        +{remainingCount}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Mobile gallery, shown below lg only: one large photo with overlaid
          arrows swapping it in place, plus an auto-scrolling thumbnail
          strip. No lightbox step and no "+N" overlay on this view. */}
      <div className="lg:hidden">
        <div className="relative w-full overflow-hidden" style={{ height: '280px', borderRadius: '16px' }}>
          <Image
            src={images[mobileActiveIndex]}
            alt={title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />

          {images.length > 1 && (
            <button
              onClick={showMobilePrev}
              aria-label="Previous image"
              style={{
                ...circleButtonStyle,
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <button
              onClick={showMobileNext}
              aria-label="Next image"
              style={{
                ...circleButtonStyle,
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div
            ref={mobileStripRef}
            className="flex gap-2 overflow-x-auto"
            style={{ marginTop: '10px', paddingBottom: '4px' }}
          >
            {images.map((src, i) => (
              <button
                key={src + i}
                ref={(el) => {
                  if (el) mobileThumbRefs.current.set(i, el)
                  else mobileThumbRefs.current.delete(i)
                }}
                onClick={() => setMobileActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className="relative flex-shrink-0 overflow-hidden"
                style={{
                  width: '84px',
                  height: '64px',
                  borderRadius: '8px',
                  border: i === mobileActiveIndex ? '2px solid #1E6B2E' : '2px solid transparent',
                  opacity: i === mobileActiveIndex ? 1 : 0.75,
                  cursor: 'pointer',
                  padding: 0,
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

      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image ${lightboxIndex + 1} of ${images.length}`}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
            style={{
              ...circleButtonStyle,
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '44px',
              height: '44px',
              zIndex: 101,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showPrev() }}
              aria-label="Previous image"
              style={{
                ...circleButtonStyle,
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                zIndex: 101,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); showNext() }}
              aria-label="Next image"
              style={{
                ...circleButtonStyle,
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                zIndex: 101,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative"
            style={{ width: '90vw', height: '85vh', maxWidth: '1200px' }}
          >
            <Image
              src={images[lightboxIndex]}
              alt={title}
              fill
              sizes="90vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
