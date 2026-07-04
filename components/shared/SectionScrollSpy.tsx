'use client'

import { useEffect, useRef, useState } from 'react'
import { SECTION_NAV_HEADER_HEIGHT, SECTION_NAV_SCROLL_OFFSET } from './sectionScrollSpyConfig'

export interface ScrollSpySection {
  id: string
  label: string
}

interface Props {
  sections: ScrollSpySection[]
}

export default function SectionScrollSpy({ sections }: Props) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const navRef = useRef<HTMLDivElement | null>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Scroll-spy: the same IntersectionObserver approach already proven for
  // the infinite scroll trigger on the packages page, applied here to
  // highlight whichever section heading is currently in view.
  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: `-${SECTION_NAV_SCROLL_OFFSET}px 0px -60% 0px`, threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  // Whenever the active tab changes (whether from the observer above
  // detecting natural page scroll, or from the observer catching up once a
  // click-triggered page scroll lands on the new section), bring that tab
  // into view within the nav bar's own horizontal scroll area. This only
  // ever scrolls the nav bar's own container, never scrollIntoView, since
  // scrollIntoView can affect ancestor scroll containers including the
  // page's own vertical scroll, which would fight the user's page scroll.
  useEffect(() => {
    const container = navRef.current
    const button = buttonRefs.current.get(activeId)
    if (!container || !button) return

    const containerWidth = container.clientWidth
    const buttonLeft = button.offsetLeft
    const buttonRight = buttonLeft + button.offsetWidth
    const currentScrollLeft = container.scrollLeft

    const isFullyVisible = buttonLeft >= currentScrollLeft && buttonRight <= currentScrollLeft + containerWidth
    if (isFullyVisible) return

    const maxScrollLeft = Math.max(0, container.scrollWidth - containerWidth)
    const targetScrollLeft = buttonLeft - (containerWidth - button.offsetWidth) / 2
    const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))

    container.scrollTo({ left: clampedScrollLeft, behavior: 'smooth' })
  }, [activeId])

  function handleClick(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (sections.length === 0) return null

  return (
    <div
      ref={navRef}
      className="flex"
      style={{
        position: 'sticky',
        top: `${SECTION_NAV_HEADER_HEIGHT}px`,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E0EBE1',
        marginBottom: '24px',
        overflowX: 'auto',
      }}
    >
      {sections.map((s) => (
        <button
          key={s.id}
          ref={(el) => {
            if (el) buttonRefs.current.set(s.id, el)
            else buttonRefs.current.delete(s.id)
          }}
          onClick={() => handleClick(s.id)}
          style={{
            padding: '14px 20px',
            fontSize: '14px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: 'none',
            border: 'none',
            borderBottom: activeId === s.id ? '2px solid #1E6B2E' : '2px solid transparent',
            color: activeId === s.id ? '#1E6B2E' : '#4A4A4A',
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
