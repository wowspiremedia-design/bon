import type { MiceLinkedinEmbed } from '@/lib/mice-api'

// A curated mosaic, not a uniform grid: alternating column spans on desktop
// plus each LinkedIn post's own naturally-differing declared height (every
// embed arrives with a different fixed height already baked into its
// iframe) read as a real assembled gallery rather than identical repeated
// boxes. Framed-tile identity — thin border + a small top accent bar, no
// shadow, no lift — deliberately distinct from both sections below it.
const SPAN_PATTERN = ['lg:col-span-2', '', '', '', '', 'lg:col-span-2', '']

export default function LinkedinGallery({ embeds }: { embeds: MiceLinkedinEmbed[] }) {
  return (
    <>
      <style>{`
        .mice-gallery-tile {
          transition: border-color 0.25s ease;
        }
        .mice-gallery-tile:hover {
          border-color: #C8A96A;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
        {embeds.map((embed, i) => (
          <div
            key={embed.id}
            className={`mice-gallery-tile ${SPAN_PATTERN[i % SPAN_PATTERN.length]}`}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E0EBE1',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #1E6B2E, #C8A96A)' }} />

            {/* embedCode is a trusted CMS-authored LinkedIn iframe snippet,
                same dangerouslySetInnerHTML pattern already used elsewhere
                for trusted rich-text/HTML content (e.g. lexicalToHtml
                output). overflow-x:auto lets the iframe's own fixed width
                scroll inside the tile on narrow columns rather than
                rewriting LinkedIn's markup ourselves. */}
            <div
              style={{ padding: '10px', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: embed.embedCode }}
            />

            {embed.caption && (
              <p style={{ fontSize: '12px', color: '#888888', padding: '0 14px 14px', textAlign: 'center' }}>
                {embed.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
