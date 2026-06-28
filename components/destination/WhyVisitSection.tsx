interface Props {
  destination: string
}

const CARDS = [
  {
    color: 'text-[#C8A96A]',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Top Rated Experience',
    desc: 'One of the most loved destinations by Indian travelers',
  },
  {
    color: 'text-[#1E6B2E]',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    title: 'Food & Culture',
    desc: 'Indian food, vegetarian options and cultural familiarity',
  },
  {
    color: 'text-[#1E6B2E]',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Safe & Comfortable',
    desc: 'Tourist friendly, safe for families and solo travelers',
  },
  {
    color: 'text-[#F5A623]',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
    title: 'Value for Money',
    desc: 'More experiences at a lower cost compared to international trips',
  },
]

export default function WhyVisitSection({ destination }: Props) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h2
          className="font-bold text-[#1E6B2E] mb-2"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 1.875rem)' }}
        >
          Why Visit {destination}?
        </h2>
        <div className="w-12 h-[2px] bg-[#C8A96A] mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className={`w-6 h-6 mb-3 ${card.color}`}>{card.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{card.title}</h3>
              <p className="text-xs text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
