'use client'

interface Props {
  images: string[]
  destination: string
}

export default function DestinationPhotoGallery({ images, destination }: Props) {
  if (images.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-12">
      <h2
        className="font-bold text-gray-900 mb-2"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 1.875rem)' }}
      >
        Photo Gallery
      </h2>
      <p className="text-gray-500 text-sm mb-6">Explore highlights from {destination}</p>
      <div
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="flex-shrink-0 w-72 md:w-80 h-56 rounded-2xl overflow-hidden snap-start relative group"
          >
            <img
              src={src}
              alt={`${destination} - photo ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </section>
  )
}
