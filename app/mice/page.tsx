import type { Metadata } from 'next'
import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getMicePageGlobal, type MiceValueProp, type MiceService } from '@/lib/mice-api'
import ScrollReveal from '@/components/mice/ScrollReveal'
import LinkedinGallery from '@/components/mice/LinkedinGallery'
import MiceEnquiryModal from '@/components/mice/MiceEnquiryModal'
import FaqAccordion from '@/components/mice/FaqAccordion'

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const mice = await getMicePageGlobal()
  return {
    title: mice?.seoTitle || 'Corporate MICE Packages | Bon Voyagers',
    description: mice?.seoDescription || undefined,
    alternates: {
      canonical: '/mice',
    },
  }
}

// ── Icon lookup ────────────────────────────────────────────────────────────────
// CMS stores icon names kebab-case (e.g. 'building-2', 'users-round');
// lucide-react exports PascalCase component names. Falls back to a generic
// icon rather than crashing if a name doesn't match a real export.

function getIcon(name: string): LucideIcon {
  const pascal = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  return icons[pascal] ?? LucideIcons.Sparkles
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function MicePage() {
  const mice = await getMicePageGlobal()

  return (
    <>
      {/* ── Hero ──
          Same gradient-scrim pattern as app/fixed-departure/[slug]/page.tsx's
          hero: full-bleed real image, dark-to-transparent scrim for
          readability, content pinned to the bottom. The one deliberate
          reveal-on-load moment on this page — every section below renders
          in plainly, no scattered scroll animations. No eyebrow label; the
          "since 2010 / 100+ corporates" stat lives inside heroSubtext as an
          actual sentence, not a badge. */}
      <ScrollReveal>
        {/* min-height, not a hard height: full-bleed cover means the image
            always fills the box completely (no letterbox), but the text
            block below is back in normal flow (not position:absolute), so
            if it ever needs more room than min-height provides, the
            section grows to fit it instead of clipping the CTA button —
            that's the actual fix for the mobile clipping bug, not just
            smaller text. The image (position:absolute; inset:0; fill)
            automatically stretches to match whatever height the section
            ends up at. */}
        <section className="relative w-full overflow-hidden flex flex-col justify-end items-center min-h-[480px] lg:min-h-[560px]">
          {mice?.heroImage?.url ? (
            <Image
              src={mice.heroImage.url}
              alt={mice.heroImage.alt || 'Corporate MICE travel'}
              fill
              priority
              sizes="100vw"
              // 'center 30%' instead of dead-center: this is a group photo,
              // so biasing the crop upward keeps faces/heads in frame
              // instead of a naive center crop cutting through them.
              style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            />
          ) : (
            // Fallback only — heroImage is expected to be set in Payload now.
            <div className="absolute inset-0" style={{ background: '#1E6B2E' }} />
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.10) 100%)',
            }}
          />

          <div className="relative z-10 text-center" style={{ padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px)' }}>
            <div className="mx-auto text-center" style={{ maxWidth: '1280px' }}>
              {/* Hardcoded tagline, not sourced from Payload — heroHeadline/
                  heroSubtext moved below, out of the image entirely.
                  Deliberately not an h1/h2 — the real page <h1> lives in
                  the plain section right after this one — but sized and
                  staged to be the dominant visual moment in the hero
                  itself, since it's now the only text overlaid on the
                  photo. The dark pill (not a full-bleed panel, not the
                  light frosted-glass badges used for the duration/people
                  pills elsewhere on package pages — this one needs to hold
                  real body text, not a two-word label) guarantees
                  legibility regardless of what's behind it in the photo,
                  independent of the gradient scrim. The thin bar beneath
                  is this project's actual brand green (#1E6B2E) — used as
                  a literal hex everywhere else in this codebase; there's
                  no CSS variable defined for it (checked globals.css —
                  only neutral/whatsapp tokens exist), so this matches the
                  codebase's own convention rather than introducing one. */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '28px',
                }}
              >
                <p
                  className="font-display"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: 1.25,
                    margin: 0,
                    maxWidth: '720px',
                    textShadow: '0 2px 16px rgba(0,0,0,0.5)',
                    fontFamily: 'var(--font-playfair)',
                    background: 'rgba(13,26,15,0.55)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    borderRadius: '9999px',
                    padding: 'clamp(16px, 3vw, 24px) clamp(28px, 5vw, 48px)',
                  }}
                >
                  You set the ambition. We handle everything else.
                </p>
                <span
                  aria-hidden="true"
                  style={{
                    marginTop: '12px',
                    width: '64px',
                    height: '3px',
                    borderRadius: '2px',
                    background: '#1E6B2E',
                  }}
                />
              </div>

              {/* Solid, on-palette (site's own brand green, not the
                  WhatsApp-specific green used elsewhere) so it reads
                  clearly against any photo the scrim sits over. No arrow.
                  MiceEnquiryModal renders this exact button style itself
                  (it owns the open/close state, since this file is a
                  server component) and opens the real enquiry form on
                  click. */}
              <MiceEnquiryModal />
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ── Headline + subtext — moved out of the hero image entirely.
          Plain white section (inherits the page's default #FFFFFF
          background, same as the Body wrapper below), the real page <h1>
          lives here now instead of overlaid on the photo. Data is
          unchanged — same heroHeadline/heroSubtext fields, same fallback,
          same conditional rendering, just relocated in the markup. */}
      <div className="mx-auto" style={{ maxWidth: '1280px', padding: 'clamp(32px, 5vw, 56px) clamp(16px, 4vw, 40px) 0' }}>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: 1.2,
            marginBottom: '16px',
            maxWidth: '760px',
            fontFamily: 'var(--font-playfair)',
          }}
        >
          {mice?.heroHeadline || 'Corporate MICE Packages Tailored to Your Team'}
        </h1>

        {mice?.heroSubtext && (
          <p
            style={{
              fontSize: '15px',
              color: '#4A4A4A',
              lineHeight: 1.65,
              maxWidth: '50ch',
            }}
          >
            {mice.heroSubtext}
          </p>
        )}
      </div>

      {/* ── Body ── */}
      <div className="mx-auto" style={{ maxWidth: '1280px', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px) 80px' }}>

        {/* Gallery comes first, right after the hero. */}
        {mice && mice.linkedinEmbeds.length > 0 && (
          <Section title="Proof in the Field">
            <LinkedinGallery embeds={mice.linkedinEmbeds} />
          </Section>
        )}

        {mice && mice.valueProps.length > 0 && (
          <Section title="Why Choose Us">
            <TrustList items={mice.valueProps} />
          </Section>
        )}

        {mice && mice.services.length > 0 && (
          <Section title="Our Services">
            <ServiceList items={mice.services} />
          </Section>
        )}

        {mice && mice.faqs.length > 0 && (
          <Section title="Frequently Asked Questions">
            <FaqAccordion faqs={mice.faqs} />
          </Section>
        )}
      </div>
    </>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────
// Duplicate of app/fixed-departure/[slug]/page.tsx's local Section helper
// (itself a duplicate of app/package/[slug]/page.tsx's — neither is
// exported, so following this codebase's established duplication-over-
// import pattern rather than reaching into another route's internals).

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2
        className="font-display"
        style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: '2px solid #E8F5E9',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

// ── Why Choose Us — plain statement list ────────────────────────────────────────
// No card background, no shadow, no hover-lift: a stacked list of rows
// separated by hairline dividers, icon in a soft green circle. Reads as a
// set of confident statements, not a grid of boxes — and is the first of
// three deliberately different treatments on this page (see ServiceList and
// LinkedinGallery for the other two).

function TrustList({ items }: { items: MiceValueProp[] }) {
  return (
    <div>
      {items.map((item, i) => {
        const Icon = getIcon(item.icon)
        return (
          <div
            key={item.id}
            className="flex items-start gap-4"
            style={{
              padding: '20px 0',
              borderBottom: i < items.length - 1 ? '1px solid #E0EBE1' : 'none',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#E8F5E9',
                flexShrink: 0,
              }}
            >
              <Icon size={19} color="#1E6B2E" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>
                {item.label}
              </h3>
              <p style={{ fontSize: '14px', color: '#4A4A4A', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Our Services — gold-accent spec list ────────────────────────────────────────
// A different structure entirely from TrustList: a two-column table-like
// grid with hairline gutters (the 2px gap + grey background shows through
// as thin dividing lines), each cell carrying a gold left border instead of
// TrustList's green icon circle. Reads like a service spec sheet, not a
// repeat of the statement list above it.

function ServiceList({ items }: { items: MiceService[] }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ gap: '2px', background: '#E0EBE1', border: '1px solid #E0EBE1' }}
    >
      {items.map((item) => {
        const Icon = getIcon(item.icon)
        return (
          <div
            key={item.id}
            style={{
              background: '#FFFFFF',
              padding: '20px 20px 20px 22px',
              borderLeft: '3px solid #C8A96A',
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              <Icon size={16} color="#A8893A" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{item.label}</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#4A4A4A', lineHeight: 1.6 }}>
              {item.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
