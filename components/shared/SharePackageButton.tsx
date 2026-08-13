'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function SharePackageButton({
  title,
  slug,
  basePath = '/package',
}: {
  title: string
  slug: string
  basePath?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}${basePath}/${slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // user cancelled share sheet or clipboard denied, fail silently
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share this package"
      className="relative z-10 flex items-center justify-center rounded-full transition hover:scale-105"
      style={{ width: '32px', height: '32px', backgroundColor: 'rgba(30,107,46,0.08)', color: '#1E6B2E' }}
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
    </button>
  )
}
