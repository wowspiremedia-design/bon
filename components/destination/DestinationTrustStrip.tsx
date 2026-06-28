export default function DestinationTrustStrip() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-[#1E6B2E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>Indian Friendly Destinations</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-[#1E6B2E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Handpicked &amp; Verified Packages</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-[#1E6B2E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Transparent Pricing</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <svg className="w-4 h-4 text-[#1E6B2E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.66a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>24x7 WhatsApp Support</span>
        </div>

      </div>
    </section>
  )
}
