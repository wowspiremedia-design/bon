'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa'

const TOUR_PACKAGES = [
  { label: 'Kashmir Packages', slug: 'kashmir-packages' },
  { label: 'Andaman Packages', slug: 'andaman-packages' },
  { label: 'Meghalaya Packages', slug: 'meghalaya-packages' },
  { label: 'Ladakh Packages', slug: 'ladakh-packages' },
  { label: 'Bhutan Packages', slug: 'bhutan-packages' },
  { label: 'Kerala Packages', slug: 'kerala-packages' },
]

const IMPORTANT_PAGES = [
  { label: 'Collections', href: '/collections' },
  { label: 'Packages', href: '/packages' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Deals', href: '/deals' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-semibold tracking-wide mb-5"
      style={{ color: '#FFFFFF', fontSize: '15px' }}
    >
      {children}
    </h3>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block py-[3px] text-sm transition-colors duration-200"
      style={{ color: '#999999' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = '#C8A96A')}
      onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
    >
      {children}
    </Link>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: '#0D1A0F' }}>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="30%" stopColor="#fa7e1e" />
            <stop offset="60%" stopColor="#d62976" />
            <stop offset="85%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
      </svg>

      {/* Gradient top border */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(to right, #1E6B2E, #C8A96A, #1E6B2E)',
        }}
      />

      {/* Main grid */}
      <div
        className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8"
        style={{
          maxWidth: '1280px',
          padding: 'clamp(32px, 4vw, 48px) clamp(16px, 4vw, 40px)',
        }}
      >

        {/* ── Column 1: Brand ── */}
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Image
              src="https://cms.bonvoyagers.co/wp-content/uploads/2024/10/bon-logo.png"
              alt="Bon Voyagers"
              width={160}
              height={44}
              style={{ height: '44px', width: 'auto' }}
            />
          </Link>

          <p
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: '#C8A96A' }}
          >
            Let&apos;s Breathe in Nature
          </p>

          <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
            Curating premium travel experiences across India and the world. Est.&nbsp;2010.
          </p>

          {/* Trust badges */}
          <div className="flex flex-col gap-[10px] mt-1">
            {/* Verified Travel Partners */}
            <div className="flex items-center gap-[9px]">
              <span style={{ color: '#4CAF50', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </span>
              <span className="text-xs" style={{ color: '#888888' }}>Verified Travel Partners</span>
            </div>

            {/* SSL Secure */}
            <div className="flex items-center gap-[9px]">
              <span style={{ color: '#C8A96A', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <span className="text-xs" style={{ color: '#888888' }}>SSL Secure Payments</span>
            </div>

            {/* 24×7 Support */}
            <div className="flex items-center gap-[9px]">
              <span style={{ color: '#4A90D9', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
              </span>
              <span className="text-xs" style={{ color: '#888888' }}>24×7 Support</span>
            </div>
          </div>
        </div>

        {/* ── Column 2: Tour Packages ── */}
        <div>
          <ColHeading>Tour Packages</ColHeading>
          <div className="flex flex-col">
            {TOUR_PACKAGES.map((pkg) => (
              <NavLink key={pkg.slug} href={`/packages/${pkg.slug}`}>
                {pkg.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ── Column 3: Important Pages ── */}
        <div>
          <ColHeading>Important Pages</ColHeading>
          <div className="flex flex-col">
            {IMPORTANT_PAGES.map((page) => (
              <NavLink key={page.href} href={page.href}>
                {page.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ── Column 4: Our Offices ── */}
        <div>
          <ColHeading>Our Offices</ColHeading>
          <div className="flex flex-col gap-3 text-sm" style={{ color: '#999999' }}>

            {/* Address */}
            <div className="flex gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-[2px]" style={{ color: '#C8A96A' }} aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Kolkata 700008, West Bengal, India</span>
            </div>

            {/* Phone */}
            <div className="flex gap-2 items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#C8A96A', flexShrink: 0 }} aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a
                href="tel:+919836755550"
                className="transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C8A96A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
              >
                +91 98367 55550
              </a>
            </div>

            {/* Email */}
            <div className="flex gap-2 items-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#C8A96A', flexShrink: 0 }} aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a
                href="mailto:info@bonvoyagers.co"
                className="transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C8A96A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
              >
                info@bonvoyagers.co
              </a>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4 mt-3">
              <a href="https://www.facebook.com/bonvoyagers.official" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF className="w-5 h-5" style={{ color: '#1877F2' }} />
              </a>
              <a href="https://www.instagram.com/bonvoyagers_official/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="w-5 h-5" style={{ fill: 'url(#instagram-gradient)' }} />
              </a>
              <a href="https://www.youtube.com/@bonvoyagersofficial" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube className="w-5 h-5" style={{ color: '#FF0000' }} />
              </a>
              <a href="https://www.linkedin.com/company/bon-voyagers/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn className="w-5 h-5" style={{ color: '#0A66C2' }} />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div
          className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{
            maxWidth: '1280px',
            padding: '20px clamp(16px, 4vw, 40px)',
          }}
        >
          <p className="text-xs" style={{ color: '#666666' }}>
            © 2026 Bon Voyagers — All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#666666' }}>
            SSL Secure · Verified Travel Partners · 24×7 Support
          </p>
        </div>
      </div>

    </footer>
  )
}
