import type { PayloadMedia } from './payload-api'
import { resolveMediaUrl } from './payload-api'

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? 'http://localhost:3000'

// Payload's Globals REST endpoint — GET /api/globals/{slug} — returns the
// Global document directly, with no {docs: [...]} list wrapper the way
// collection endpoints do. This fetch shape is NEW to this codebase: no
// other file here fetches a Global today (confirmed via a full-repo search
// before writing this), so this is built from Payload's documented Globals
// API, not copied from a working example already proven in this repo.
async function payloadGlobalFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYLOAD_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Payload API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// Field shapes below match the real response confirmed by a live call
// against local bon-payload (not guessed) — see MicePage Global, slug
// 'mice-page'.
export interface MiceValueProp {
  id: string
  icon: string
  label: string
  description: string
}

export interface MiceService {
  id: string
  icon: string
  label: string
  description: string
}

export interface MiceLinkedinEmbed {
  id: string
  embedCode: string
  caption: string | null
}

export interface MiceFaq {
  id: string
  question: string
  answer: string
}

export interface MicePageGlobal {
  id: number
  seoTitle: string | null
  seoDescription: string | null
  seoFocusKeyword: string | null
  heroHeadline: string | null
  heroSubtext: string | null
  heroImage: PayloadMedia | null
  valueProps: MiceValueProp[]
  services: MiceService[]
  linkedinEmbeds: MiceLinkedinEmbed[]
  faqs: MiceFaq[]
  updatedAt: string
  createdAt: string
  globalType: string
}

// Mirrors resolveDestinationMedia/resolveFixedDeparturePackageMedia/
// resolvePackageMedia in this codebase: resolve media URLs at the data
// layer, not at render time.
function resolveMicePageMedia(mice: MicePageGlobal): MicePageGlobal {
  return {
    ...mice,
    heroImage: mice.heroImage
      ? { ...mice.heroImage, url: resolveMediaUrl(mice.heroImage.url) ?? mice.heroImage.url }
      : null,
  }
}

export async function getMicePageGlobal(): Promise<MicePageGlobal | null> {
  try {
    const path = `/api/globals/mice-page`
    const mice = await payloadGlobalFetch<MicePageGlobal>(path)
    return resolveMicePageMedia(mice)
  } catch {
    return null
  }
}
