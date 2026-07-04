export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Brand spinner */}
      <div className="flex justify-center pt-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#1E6B2E] border-t-transparent" />
      </div>

      {/* 1. Hero carousel placeholder */}
      <div className="w-full h-[70vh] max-h-[600px] min-h-[320px] bg-gray-200" />

      {/* 2. Trust strip placeholder */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 py-6 flex items-center justify-center gap-3 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* 3. About section placeholder */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-7 w-56 rounded-md bg-gray-200 mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-11/12 rounded bg-gray-200" />
          <div className="h-4 w-4/5 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>
      </section>

      {/* 4. Packages grid placeholder */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-200 aspect-[3/4] w-full" />
          ))}
        </div>
      </section>
    </div>
  )
}
