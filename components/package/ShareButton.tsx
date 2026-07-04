'use client'

import { useState } from 'react'

interface Props {
  packageName: string
}

export default function ShareButton({ packageName }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title: packageName,
      text: `Check out this package: ${packageName}`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled the share sheet or it failed, nothing to do.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard write failed, nothing to do.
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleShare}
        className="flex items-center gap-2"
        style={{
          background: '#C8A96A',
          color: '#0D1A0F',
          fontSize: '12px',
          fontWeight: 700,
          padding: '5px 12px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D1A0F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share Package
      </button>

      {copied && (
        <span
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          Link copied
        </span>
      )}
    </div>
  )
}
