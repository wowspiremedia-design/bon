import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CollectionGridCardProps {
  name: string
  slug: string
  image: string
}

export default function CollectionGridCard({ name, slug, image }: CollectionGridCardProps) {
  return (
    <Link href={`/collection/${slug}`}>
      <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
        <div className="relative h-[260px] overflow-hidden">
          <Image src={image} alt={name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-5 text-white">
          <h3 className="text-lg sm:text-xl font-bold leading-tight">{name}</h3>
          <div className="mt-3 text-sm font-semibold text-[#ff4d6d] flex items-center gap-1">
            Explore Collection <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
