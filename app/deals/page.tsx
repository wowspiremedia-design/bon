import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Flame, Bookmark, Shield, Check, Users, CreditCard } from 'lucide-react'
import { getOnSalePackages } from '@/lib/payload-api'
import DealOfferCard from '@/components/deals/DealOfferCard'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hot Travel Deals & Offers | Bon Voyagers',
    description: 'Limited-time travel deals curated by Bon Voyagers. Transparent pricing, verified packages, zero hidden costs.',
    alternates: {
      canonical: '/deals',
    },
  }
}

const BADGE_LABELS = ['Best Seller', 'Budget Pick', 'Trending']

export default async function DealsPage() {
  const onSale = await getOnSalePackages(30)

  const dealOfDay = onSale.length > 0
    ? onSale[Math.floor(Math.random() * onSale.length)]
    : undefined

  const topOffers = dealOfDay
    ? onSale.filter((p) => p.id !== dealOfDay.id).slice(0, 3)
    : []

  const dealOfDayImage = dealOfDay?.images[0]?.url ?? ''
  const dealOfDayRegular = dealOfDay ? dealOfDay.regularPrice : 0
  const dealOfDaySale = dealOfDay ? dealOfDay.price : 0
  const dealOfDayDiscount = dealOfDayRegular > 0
    ? Math.round(((dealOfDayRegular - dealOfDaySale) / dealOfDayRegular) * 100)
    : 0

  return (
    <>
      {dealOfDay ? (
        <>
          {/* Sticky ticker bar */}
          <div className="sticky top-0 z-40 bg-black text-white px-4 py-2 flex items-center gap-3 text-sm">
            <Flame className="w-4 h-4 text-[#d90429] animate-pulse flex-shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">
              Today&apos;s Best Deal: {dealOfDay.title}
            </span>
            <span className="font-bold text-[#d90429] flex-shrink-0">
              ₹{dealOfDaySale.toLocaleString('en-IN')}
            </span>
            <Link
              href={`/package/${dealOfDay.slug}`}
              className="bg-white text-black text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
            >
              Book Now
            </Link>
          </div>

          {/* Deal of the Day hero */}
          <section className="max-w-5xl mx-auto px-4 py-10">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <div className="relative h-64 sm:h-80">
                <Image
                  src={dealOfDayImage}
                  alt={dealOfDay.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <span className="block text-[#d90429] text-xs font-semibold uppercase tracking-wide">
                  Deal of the Day
                </span>
                <h2 className="font-bold text-xl sm:text-2xl">{dealOfDay.title}</h2>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-gray-400 line-through text-base">
                    ₹{dealOfDayRegular.toLocaleString('en-IN')}
                  </span>
                  <span className="text-2xl font-bold text-[#d90429]">
                    ₹{dealOfDaySale.toLocaleString('en-IN')}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    Verified
                  </span>
                  <span className="bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                    {dealOfDayDiscount}% OFF
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/package/${dealOfDay.slug}`}
                    className="bg-[#d90429] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Grab Deal
                  </Link>
                  <button
                    type="button"
                    aria-label="Save deal"
                    className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                  >
                    <Bookmark className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center text-gray-500">
          No active deals right now, check back soon.
        </div>
      )}

      {/* Black promo band */}
      <section className="bg-black text-white py-24 text-center px-4">
        <h1 className="font-bold text-3xl sm:text-4xl mb-4">
          Handpicked Travel Deals You&apos;ll Love
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Limited-time offers curated by Bon Voyagers experts. Transparent pricing. Trusted experiences. Zero hidden costs.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-200">
          <span>✔ 10,000+ Happy Travellers</span>
          <span>✔ Secure Payments</span>
          <span>✔ Expert Support</span>
        </div>
      </section>

      {/* Today's Top Offers */}
      {topOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="font-bold text-2xl sm:text-3xl text-center mb-10">Today&apos;s Top Offers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topOffers.map((product, i) => (
              <DealOfferCard
                key={product.id}
                slug={product.slug}
                title={product.title}
                image={product.images[0]?.url ?? ''}
                regularPrice={product.regularPrice}
                salePrice={product.price}
                badgeLabel={BADGE_LABELS[i % BADGE_LABELS.length]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trust icons row */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-8 text-center">
        <div>
          <Shield className="w-7 h-7 text-[#d90429] mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-sm">Verified Package</p>
          <p className="text-xs text-gray-500 mt-1">Checked and confirmed by our team</p>
        </div>
        <div>
          <Check className="w-7 h-7 text-[#d90429] mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-sm">Instant Confirmation</p>
          <p className="text-xs text-gray-500 mt-1">Book now, confirmed right away</p>
        </div>
        <div>
          <Users className="w-7 h-7 text-[#d90429] mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-sm">10,000+ Happy Travelers</p>
          <p className="text-xs text-gray-500 mt-1">Trusted by real customers</p>
        </div>
        <div>
          <CreditCard className="w-7 h-7 text-[#d90429] mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-sm">Secure Payments</p>
          <p className="text-xs text-gray-500 mt-1">Encrypted &amp; PCI-compliant checkout</p>
        </div>
      </section>

      {/* Why Book With Bon Voyagers */}
      <section className="py-20 border-t px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-bold text-2xl sm:text-3xl mb-3">Why Book With Bon Voyagers?</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12">
            We don&apos;t just sell trips, we design worry-free travel experiences.
          </p>

          <div className="grid md:grid-cols-3 gap-10 text-left">
            <div>
              <h3 className="font-semibold text-base mb-2">Human Travel Experts</h3>
              <p className="text-sm text-gray-500">
                Talk to real destination specialists, not bots or call centers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2">Transparent Pricing</h3>
              <p className="text-sm text-gray-500">
                No hidden charges, no last-minute surprises.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-2">Post-Booking Support</h3>
              <p className="text-sm text-gray-500">
                We stay with you before, during, and after your trip.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Your Trip in Minutes */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-bold text-2xl mb-2">Book Your Trip in Minutes</h3>
            <p className="text-gray-500 mb-6">Simple steps. Instant confirmation. Secure payment.</p>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>✔ Choose your package</li>
              <li>✔ Confirm details with expert</li>
              <li>✔ Pay securely &amp; relax</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Average booking time</p>
            <p className="text-3xl sm:text-4xl font-bold text-[#d90429]">Under 5 minutes</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-black to-gray-900 text-white text-center py-20 px-6">
        <h3 className="font-bold text-2xl sm:text-3xl mb-4">Ready to Lock Your Deal?</h3>
        <p className="text-gray-300 max-w-xl mx-auto mb-8">
          Prices may change. Seats are limited. Secure your trip today with Bon Voyagers.
        </p>
        <Link
          href="/packages"
          className="inline-block bg-[#d90429] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Explore All Packages
        </Link>
      </section>
    </>
  )
}
