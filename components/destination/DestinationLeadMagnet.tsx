interface Props {
  destination: string
}

const BENEFITS = [
  '100% customisable itinerary',
  'No obligation to book',
  'Expert guidance from day one',
]

export default function DestinationLeadMagnet({ destination }: Props) {
  const waHref = `https://wa.me/919836755550?text=Hi%20Bon%20Voyagers%20%F0%9F%91%8B%0A%0AI'm%20planning%20a%20trip%20to%20*${encodeURIComponent(destination)}*.%0A%0APlease%20share%20a%20free%20custom%20itinerary.`

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-[#1E6B2E]/10 text-[#1E6B2E] text-xs font-semibold tracking-wide">
          Complimentary Planning
        </span>
        <h3
          className="font-bold text-gray-900 mb-3"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}
        >
          Planning a trip to {destination}?
        </h3>
        <p className="text-gray-600 mb-6">
          Get a personalised itinerary curated by our travel experts - tailored to your dates, budget and travel style.
        </p>
        <ul className="list-none space-y-2 text-sm text-gray-700 mb-8">
          {BENEFITS.map((item) => (
            <li key={item} className="flex items-center justify-center gap-2">
              <span className="text-[#1E6B2E] font-bold">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1E6B2E] hover:bg-[#155222] text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200 shadow-md"
        >
          Get Free Custom Plan
        </a>
        <p className="text-xs text-gray-400 mt-4">Takes less than 2 minutes - No spam - Human support only</p>
      </div>
    </section>
  )
}
