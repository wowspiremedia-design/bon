import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SeatsLeftBadge, CountdownText } from '@/components/deals/DealUrgencyBadge'

interface DealOfferCardProps {
  slug: string
  title: string
  image: string
  regularPrice: number
  salePrice: number
  badgeLabel: string
}

export default function DealOfferCard({
  slug,
  title,
  image,
  regularPrice,
  salePrice,
  badgeLabel,
}: DealOfferCardProps) {
  const discountPercent = regularPrice > 0
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition flex flex-col group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <span className="absolute top-4 left-4 bg-[#d90429] text-white text-xs px-3 py-1 rounded-full font-semibold">{badgeLabel}</span>
        <span className="absolute bottom-4 left-4 bg-black/80 text-white text-xs px-3 py-1 rounded-full">{discountPercent}% OFF</span>
        <SeatsLeftBadge />
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-base leading-snug line-clamp-2">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 line-through text-sm">₹{regularPrice.toLocaleString('en-IN')}</span>
          <span className="text-xl font-bold text-[#d90429]">₹{salePrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <CountdownText />
        </div>
        <div className="flex gap-3 text-[11px] text-gray-600">
          <span>✔ Free Cancellation</span><span>✔ Pay Later</span><span>✔ Instant Confirm</span>
        </div>
        <Link href={`/package/${slug}`} className="mt-auto inline-flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-semibold hover:bg-[#d90429] transition">
          Grab This Deal <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
