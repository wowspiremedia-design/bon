'use client'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '919836755550'

export default function EnquireNowButton() {
  function handleClick() {
    const message = "Hi! I'm interested in car rentals for my trip."
    const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(waLink, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '14px 32px',
        fontSize: '15px',
        fontWeight: 700,
        color: '#0D1A0F',
        background: '#D9A441',
        border: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
      }}
    >
      Enquire Now
    </button>
  )
}
