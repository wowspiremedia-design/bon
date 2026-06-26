import Link from "next/link";

export default function Home() {
  return (
    <section
      className="flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #F5A623 0%, #E65100 50%, #1E6B2E 100%)",
        minHeight: "500px",
        padding: "80px 40px",
      }}
    >
      <div className="flex flex-col items-center text-center gap-6 max-w-2xl">
        <h1
          className="font-display font-bold leading-tight"
          style={{ color: "#FFFFFF", fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
        >
          Discover India&apos;s Hidden Wonders
        </h1>

        <p
          className="text-lg leading-relaxed max-w-xl"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Curated journeys across the Himalayas, Northeast, and beyond.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="/packages"
            className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            style={{ background: "#1E6B2E" }}
          >
            Explore Packages
          </Link>

          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
            style={{ border: "2px solid #FFFFFF" }}
          >
            Chat on WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
