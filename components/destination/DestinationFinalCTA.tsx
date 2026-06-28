import Link from 'next/link'

interface Props {
  destination: string
}

const BULLETS = [
  '100% customisable itineraries',
  'Handpicked hotels and authentic experiences',
  'Dedicated travel expert from planning to return',
]

export default function DestinationFinalCTA({ destination }: Props) {
  const waHref = `https://wa.me/919836755550?text=Hi%20Bon%20Voyagers%20%F0%9F%91%8B%0A%0AI'm%20interested%20in%20planning%20a%20trip%20to%20*${encodeURIComponent(destination)}*`

  return (
    <section className="bg-[#1E6B2E] py-14 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2
          className="font-bold text-white mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
        >
          Ready to experience {destination}?
        </h2>
        <div className="w-12 h-[2px] bg-[#C8A96A] mx-auto mb-6" />
        <ul className="list-none space-y-2 text-white/80 text-sm mb-8 inline-block text-left">
          {BULLETS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-[#C8A96A] font-bold">&#10003;</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#F5A623] hover:bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200"
          >
            Start Planning My Trip
          </Link>
          <Link
            href="tel:+919836755550"
            className="border-2 border-white/50 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-colors duration-200"
          >
            Call Our Travel Desk
          </Link>
        </div>
        <p className="text-white/50 text-xs mt-6">Prefer instant help? Talk directly with our travel experts.</p>
      </div>
    </section>
  )
}
