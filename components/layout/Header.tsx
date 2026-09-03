'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { resolveMediaUrl } from '@/lib/payload-api'
import SearchOverlay from '@/components/search/SearchOverlay'

type NavLink = { href: string; label: string; isDeals?: boolean }

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/packages', label: 'Packages' },
  { href: '/fixed-departure', label: 'Fixed Departure' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/cars', label: 'Cars' },
  { href: '/destinations', label: 'Destinations' },
  { href: '/deals', label: 'Deals', isDeals: true },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/mice', label: 'MICE' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ maxWidth: '1280px', padding: '20px 40px' }}
      >
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src={resolveMediaUrl('/api/media/file/bon-logo.png')!}
            alt="Bon Voyagers"
            width={180}
            height={44}
            priority
            style={{ height: '44px', width: 'auto' }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label, isDeals }) => (
            <Link
              key={href}
              href={href}
              className={[
                'relative text-sm font-medium transition-colors duration-200',
                'after:content-[\'\'] after:absolute after:bottom-[-3px] after:left-0',
                'after:h-[2px] after:w-full after:bg-[#C8A96A]',
                'after:scale-x-0 after:origin-left',
                'after:transition-transform after:duration-200',
                'hover:after:scale-x-100',
                isDeals
                  ? 'text-[#E65100] hover:text-[#1E6B2E]'
                  : 'text-[#1A1A1A] hover:text-[#1E6B2E]',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="p-2 text-[#1A1A1A] hover:text-[#1E6B2E] transition-colors duration-200"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Hamburger — mobile only */}
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 text-[#1A1A1A] transition-colors duration-200"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden flex flex-col px-5 py-4 gap-5 bg-white"
          style={{ borderTop: '1px solid #E0EBE1' }}
        >
          {NAV_LINKS.map(({ href, label, isDeals }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium"
              style={{ color: isDeals ? '#E65100' : '#1A1A1A' }}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
