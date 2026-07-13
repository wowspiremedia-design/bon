import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Tour Package India | Bon Voyagers',
  description: 'Book tour package India today. Call or WhatsApp us. Best prices, direct booking, no commission.',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
