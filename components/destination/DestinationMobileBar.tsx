'use client'

interface Props {
  destination: string
  waLink: string
}

export default function DestinationMobileBar({ waLink }: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-gray-200 p-3 flex gap-3 z-50">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 bg-[#1E6B2E] text-white text-center py-3 rounded-lg font-semibold text-sm"
      >
        Chat on WhatsApp
      </a>
      <a
        href="#packages"
        className="flex-1 bg-gray-900 text-white text-center py-3 rounded-lg font-semibold text-sm"
      >
        View Packages
      </a>
    </div>
  )
}
