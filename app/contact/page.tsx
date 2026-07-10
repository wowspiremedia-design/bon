'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { resolveMediaUrl } from '@/lib/payload-api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OfficeData {
  id: number
  office: string
  city: string
  region: string
  address: string
  phones: string[]
  email: string
  mapQuery: string
}

// ── Data ──────────────────────────────────────────────────────────────────────

const OFFICES: OfficeData[] = [
  {
    id: 1,
    office: 'Bon Head Office',
    city: 'Kolkata',
    region: 'westbengal',
    address: '206, Raja Ram Mohan Roy Road, Kolkata - 700008',
    phones: ['9836755550'],
    email: 'info@bonvoyagers.co',
    mapQuery: 'Bon+Voyagers+206+Raja+Ram+Mohan+Roy+Road+Kolkata',
  },
  {
    id: 2,
    office: 'Bon Andaman Office',
    city: 'Port Blair, Andaman',
    region: 'northeastindia',
    address: 'Marine Hill, Port Blair, Andaman and Nicobar Islands - 744104',
    phones: ['8617718012', '9830644431'],
    email: 'portblair-andaman@bonvoyagers.co',
    mapQuery: 'Marine+Hill+Port+Blair+Andaman',
  },
  {
    id: 3,
    office: 'Bon Asansol Office',
    city: 'Asansol',
    region: 'westbengal',
    address: 'Priyadarshini Appartment, Ground Floor, Burnpur Road, opposite to Posto Rajbari, Asansol - 713304',
    phones: ['9564555777', '6295157328'],
    email: 'asansol-westbengal@bonvoyagers.co',
    mapQuery: 'Burnpur+Road+Asansol+713304',
  },
  {
    id: 4,
    office: 'Bon Bangladesh Office',
    city: 'Dhaka, Bangladesh',
    region: 'international',
    address: '3/5/C Uttar Pirerbag, 60 Feet Main Road, Mirpur, Dhaka - 1216, Bangladesh',
    phones: ['8801717202080', '8801712407779'],
    email: 'bangladesh@bonvoyagers.co',
    mapQuery: 'Mirpur+Dhaka+Bangladesh',
  },
  {
    id: 5,
    office: 'Bon Bolpur Office',
    city: 'Bolpur',
    region: 'westbengal',
    address: 'Tin Kari, 2/2/2, Tinkori Ghosh Rd, near Nildanga, Bolpur, West Bengal - 731204',
    phones: ['9046062999'],
    email: 'bolpur@bonvoyagers.co',
    mapQuery: 'Tinkori+Ghosh+Road+Bolpur+731204',
  },
  {
    id: 6,
    office: 'Bon Burdwan Office',
    city: 'Burdwan',
    region: 'westbengal',
    address: 'Baranilpur More, Near Great Eastern Electronics, Post - Sripally, Burdwan - 713103',
    phones: ['9732306994'],
    email: 'burdwan-westbengal@bonvoyagers.co',
    mapQuery: 'Baranilpur+More+Burdwan+713103',
  },
  {
    id: 7,
    office: 'Bon Darjeeling Office',
    city: 'Darjeeling',
    region: 'westbengal',
    address: 'Dr. SM Das Rd, near Big Bazzar Inox, Limbugaon, Darjeeling, West Bengal - 734101',
    phones: ['9051144414'],
    email: 'darjeeling@bonvoyagers.co',
    mapQuery: 'SM+Das+Road+Darjeeling+734101',
  },
  {
    id: 8,
    office: 'Bon Delhi Office',
    city: 'Delhi',
    region: 'northwestindia',
    address: '10315, 1st Floor, Ram Kumar Marg, Jhandewalan Road, New Delhi - 110055',
    phones: ['9312237990'],
    email: 'delhi@bonvoyagers.co',
    mapQuery: 'Jhandewalan+Road+New+Delhi+110055',
  },
  {
    id: 9,
    office: 'Bon Diamond Harbour Office',
    city: 'Diamond Harbour',
    region: 'westbengal',
    address: 'Bharati Global Tour and Travels, 2nd Floor, Pump House, Girls School Rd, Roynagar, Diamond Harbour - 743331',
    phones: ['7478214753', '7548966588', '8582948848'],
    email: 'diamondharbour@bonvoyagers.co',
    mapQuery: 'Girls+School+Road+Diamond+Harbour+743331',
  },
  {
    id: 10,
    office: 'Bon Durgapur Office',
    city: 'Durgapur',
    region: 'westbengal',
    address: '2/248 Ramkrishna Pally North Ground Floor, Benachity, Durgapur - 713213',
    phones: ['9333795150', '9332649486', '9064554387'],
    email: 'durgapur@bonvoyagers.co',
    mapQuery: 'Ramkrishna+Pally+Benachity+Durgapur+713213',
  },
  {
    id: 11,
    office: 'Bon Durgapur Station Road Office',
    city: 'Durgapur Station Road',
    region: 'westbengal',
    address: '56/52 Ghanti Cloth Building, 1st Floor, Durgapur Station Bazar - 713201',
    phones: ['8972190854', '8927043729'],
    email: 'durgapurstationroad@bonvoyagers.co',
    mapQuery: 'Durgapur+Station+Bazar+713201',
  },
  {
    id: 12,
    office: 'Bon Gangtok Office',
    city: 'Gangtok, Sikkim',
    region: 'northeastindia',
    address: 'Opposite All India Radio Staff Quarter, Upper Arithang, Gangtok, Sikkim - 737101',
    phones: ['9051144414'],
    email: 'gangtok-sikkim@bonvoyagers.co',
    mapQuery: 'Upper+Arithang+Gangtok+Sikkim+737101',
  },
  {
    id: 13,
    office: 'Bon Gujarat Office',
    city: 'Vadodara, Gujarat',
    region: 'northwestindia',
    address: 'Bhalerav Tekari, Kharivav Road, Nr. GPO, Raopura, Vadodara - 01',
    phones: ['9725040289'],
    email: 'gujarat@bonvoyagers.co',
    mapQuery: 'Kharivav+Road+Raopura+Vadodara',
  },
  {
    id: 14,
    office: 'Bon Habra Office',
    city: 'Habra',
    region: 'westbengal',
    address: 'Habra, Hatthuba, Loknath Sarani, 24 PGS North, Opposite Dominos Pizza - 743263',
    phones: ['9734516080'],
    email: 'habra-westbengal@bonvoyagers.co',
    mapQuery: 'Loknath+Sarani+Habra+743263',
  },
  {
    id: 15,
    office: 'Bon Jharkhand Office',
    city: 'Bokaro, Jharkhand',
    region: 'northeastindia',
    address: 'Road No. 3, Krishnapuri, Chas, Bokaro Steel City - 827013',
    phones: ['9135756969'],
    email: 'jharkhand@bonvoyagers.co',
    mapQuery: 'Krishnapuri+Chas+Bokaro+Steel+City+827013',
  },
  {
    id: 16,
    office: 'Bon Kashmir Office',
    city: 'Srinagar, Kashmir',
    region: 'northeastindia',
    address: 'Karan Nagar Gole Market Rd, adjoining Royal Heritage Tower, Karan Nagar, Srinagar - 190010',
    phones: ['9051144414'],
    email: 'kashmir@bonvoyagers.co',
    mapQuery: 'Karan+Nagar+Srinagar+Kashmir+190010',
  },
  {
    id: 17,
    office: 'Bon Ladakh Office',
    city: 'Leh, Ladakh',
    region: 'northeastindia',
    address: 'Laba House, Near Rancho School Druk Padma Shey, UT Ladakh',
    phones: ['8617718012', '9830644431'],
    email: 'utladakh@bonvoyagers.co',
    mapQuery: 'Druk+Padma+Shey+Leh+Ladakh',
  },
  {
    id: 18,
    office: 'Bon Maharashtra Office',
    city: 'Nagpur, Maharashtra',
    region: 'northwestindia',
    address: 'Plot No 19, 1st Floor, behind Ayyappa temple, Mankapur Ring Road, Nagpur - 440013',
    phones: ['8605356883'],
    email: 'maharashtra@bonvoyagers.co',
    mapQuery: 'Mankapur+Ring+Road+Nagpur+440013',
  },
  {
    id: 19,
    office: 'Bon Nepal Office',
    city: 'Kathmandu, Nepal',
    region: 'international',
    address: 'Lazimpat, Kathmandu - 44600, Nepal',
    phones: ['+977 976-3769668'],
    email: 'nepal@bonvoyagers.co',
    mapQuery: 'Lazimpat+Kathmandu+Nepal',
  },
  {
    id: 20,
    office: 'Bon New Garia Office',
    city: 'New Garia, Kolkata',
    region: 'westbengal',
    address: '87, Chakgaria, Gitanjali, New Garia, Kolkata - 700094',
    phones: ['7980245664'],
    email: 'newgaria-kolkata@bonvoyagers.co',
    mapQuery: 'Chakgaria+Gitanjali+New+Garia+Kolkata+700094',
  },
  {
    id: 21,
    office: 'Bon Uttar Pradesh Office',
    city: 'Kanpur, Uttar Pradesh',
    region: 'northwestindia',
    address: '58, Tagore Road, Opposite of Indian Bank, Kanpur Cantonment, Kanpur - 208004',
    phones: ['7478334972'],
    email: 'uttarpradesh@bonvoyagers.co',
    mapQuery: 'Tagore+Road+Kanpur+Cantonment+208004',
  },
]

const FORM_OFFICES = [
  'Kolkata (Head Office)',
  'Port Blair (Andaman)',
  'Asansol',
  'Bangladesh (Dhaka)',
  'Bolpur',
  'Burdwan',
  'Darjeeling',
  'Delhi',
  'Diamond Harbour',
  'Durgapur',
  'Durgapur Station Road',
  'Gangtok (Sikkim)',
  'Gujarat (Vadodara)',
  'Habra',
  'Jharkhand (Bokaro)',
  'Kashmir (Srinagar)',
  'Ladakh',
  'Maharashtra (Nagpur)',
  'Nepal (Kathmandu)',
  'New Garia (Kolkata)',
  'Uttar Pradesh (Kanpur)',
]

const MARQUEE_CITIES = [
  'Kolkata', 'Darjeeling', 'Gangtok', 'Delhi', 'Kashmir', 'Ladakh',
  'Andaman', 'Asansol', 'Bolpur', 'Burdwan', 'Diamond Harbour',
  'Durgapur', 'Habra', 'Jharkhand', 'Gujarat', 'Maharashtra',
  'Nepal', 'Bangladesh', 'Uttar Pradesh', 'New Garia', 'Vadodara',
]

const INTENTS = [
  { id: 'plan',    emoji: '🏔️', label: 'Plan a Trip',    prefill: 'I would like to plan a trip. ' },
  { id: 'quote',   emoji: '💰', label: 'Get a Quote',    prefill: 'I would like to get a quote for ' },
  { id: 'group',   emoji: '👥', label: 'Group Booking',  prefill: 'I am enquiring about a group booking for ' },
  { id: 'partner', emoji: '🤝', label: 'Partnership',    prefill: 'I am interested in partnering with Bon Voyagers. ' },
]

const REGION_TABS = [
  { id: 'all',             label: 'All Offices' },
  { id: 'westbengal',      label: 'West Bengal' },
  { id: 'northeastindia',  label: 'North and East India' },
  { id: 'northwestindia',  label: 'West and South India' },
  { id: 'international',   label: 'International' },
]

// ── Shared input class ─────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1E6B2E] focus:ring-2 focus:ring-[#1E6B2E]/10 transition-all bg-white'

const LABEL_CLS = 'block text-sm font-medium text-gray-700 mb-1.5'

// ── Icons ─────────────────────────────────────────────────────────────────────

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function PhoneIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-2.9-8.64A2 2 0 012.16 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function MapPinIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function MailIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function ShieldIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function StarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  )
}

function LockIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function ClockIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  )
}

function SmallPhoneIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-2.9-8.64A2 2 0 012.16 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function SmallMailIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

// ── OfficeCard sub-component ──────────────────────────────────────────────────

function OfficeCard({ office }: { office: OfficeData }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${office.mapQuery}`
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1E6B2E]/30 transition-all duration-300 overflow-hidden p-5">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8A96A] rounded-l-2xl" />
      <div className="pl-3">
        <p className="text-[#C8A96A] text-xs font-bold uppercase tracking-widest mb-1">{office.city}</p>
        <p className="text-gray-900 font-bold text-base mb-3 leading-snug">{office.office}</p>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 text-xs leading-relaxed">{office.address}</span>
          </div>
          {office.phones.map((ph) => (
            <div key={ph} className="flex items-center gap-2">
              <SmallPhoneIcon />
              <a href={`tel:${ph.replace(/\s/g, '')}`} className="text-[#1E6B2E] text-xs font-medium hover:underline">
                {ph}
              </a>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <SmallMailIcon />
            <a href={`mailto:${office.email}`} className="text-gray-500 text-xs hover:text-[#1E6B2E] hover:underline break-all">
              {office.email}
            </a>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-[#1E6B2E] hover:underline"
        >
          <MapPinIcon className="w-3 h-3" />
          View on Map
        </a>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', office: '',
    date: '', travellers: '', message: '',
  })
  const [selectedIntent, setSelectedIntent] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleIntentSelect(intent: string, prefill: string) {
    setSelectedIntent(intent)
    setFormData((prev) => ({ ...prev, message: prefill }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  function resetForm() {
    setFormData({ name: '', email: '', phone: '', office: '', date: '', travellers: '', message: '' })
    setSelectedIntent('')
    setSubmitted(false)
  }

  const filteredOffices =
    activeTab === 'all' ? OFFICES : OFFICES.filter((o) => o.region === activeTab)

  return (
    <>
      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-16 lg:py-24"
        style={{
          background: 'linear-gradient(135deg, #061A0C 0%, #0D2818 30%, #1A5C26 65%, #0A1F10 100%)'
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[100px] pointer-events-none" style={{ background: '#C8A96A' }} />
        <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.12] blur-[80px] pointer-events-none" style={{ background: '#25D366' }} />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full opacity-[0.08] blur-[120px] pointer-events-none" style={{ background: '#C8A96A' }} />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

            {/* Left */}
            <div className="min-w-0">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="opacity-60">
                <ol className="flex items-center gap-2 text-sm text-white/60 tracking-wide list-none p-0 m-0">
                  <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li>/</li>
                  <li>Contact</li>
                </ol>
              </nav>

              {/* Gold pill */}
              <div className="mt-4 inline-flex items-center bg-[#C8A96A]/15 border border-[#C8A96A]/50 backdrop-blur-sm shadow-sm shadow-[#C8A96A]/10 rounded-full px-4 py-1.5">
                <span className="text-[#C8A96A] text-xs font-semibold tracking-widest uppercase">
                  ✦ TRUSTED SINCE 2010
                </span>
              </div>

              {/* H1 */}
              <h1
                className="mt-4 text-4xl sm:text-5xl lg:text-7xl font-bold text-[#F5F0E8] leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Skip the bots.
                <br />
                Talk to a real
                <br />
                <span className="text-[#C8A96A]">travel expert.</span>
              </h1>

              {/* Gold divider */}
              <div className="mt-6 w-20 h-[3px] bg-[#C8A96A] rounded-full" />

              {/* Subtitle */}
              <p className="mt-4 text-[#F5F0E8]/70 text-lg sm:text-xl leading-relaxed max-w-lg">
                Our Kolkata-based team has planned 5,00,000+ trips since 2010.
                We pick up the phone. We reply on WhatsApp. We show up.
              </p>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://wa.me/919836755550"
                  className="relative overflow-hidden bg-[#25D366] text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />
                  <WhatsAppIcon />
                  WhatsApp Now
                </a>
                <a
                  href="tel:+919836755550"
                  className="backdrop-blur-sm border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 hover:bg-white/15 hover:border-white/40 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <PhoneIcon />
                  +91 98367 55550
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 gap-2">
                {[
                  { num: '21',      label: 'Offices Across India' },
                  { num: '5 Lakh+', label: 'Happy Travellers' },
                  { num: '500+',    label: 'Curated Packages' },
                  { num: '15+',     label: 'Years of Experience' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="backdrop-blur-md border border-white/10 hover:border-[#C8A96A]/30 transition-all duration-300 cursor-default rounded-2xl p-4 text-center min-w-0 overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  >
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#C8A96A] break-words">{s.num}</div>
                    <div className="text-[#F5F0E8]/60 text-xs font-medium tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image card (visible on all screens) */}
            <div className="w-full">
              <div className="relative">
                {/* Card with gold border gradient */}
                <div
                  className="relative h-[280px] lg:h-[500px] rounded-3xl p-[2px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200,169,106,0.4) 0%, rgba(200,169,106,0.1) 50%, rgba(200,169,106,0.3) 100%)'
                  }}
                >
                  <div className="relative h-full w-full rounded-[22px] overflow-hidden bg-white/5 backdrop-blur-sm">
                    {/* Gold reflection at top */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#C8A96A]/10 to-transparent z-10 pointer-events-none rounded-t-[22px]" />
                    <Image
                      src={resolveMediaUrl('/api/media/file/Bon-team.webp')!}
                      alt="Bon Voyagers Travel Expert Team"
                      width={800}
                      height={500}
                      className="w-full h-full object-cover object-top"
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-[22px] p-4">
                      <p className="text-white font-semibold text-sm">Our Expert Team</p>
                      <p className="text-white/70 text-xs">Ready to plan your perfect journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — CITY MARQUEE STRIP
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0D1A0F] py-4 overflow-hidden">
        <p className="text-center text-[#C8A96A] text-xs font-semibold tracking-widest uppercase mb-2">
          21 Offices · We Are Near You
        </p>
        <div className="overflow-hidden">
          <div className="animate-marquee">
            {[...MARQUEE_CITIES, ...MARQUEE_CITIES].map((city, i) => (
              <span key={i} className="flex items-center whitespace-nowrap">
                <span className="text-white/60 text-sm font-medium">{city}</span>
                <span className="text-[#C8A96A] mx-3">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — MAIN BODY
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#F7F6F2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* ─────────────────────────────────────────
                CARD A — INTENT + FORM
            ───────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Top band */}
              <div className="bg-[#1E6B2E] px-6 py-4">
                <h2
                  className="text-white text-xl font-bold"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Send an Enquiry
                </h2>
                <p className="text-white/70 text-sm flex items-center gap-1.5 mt-0.5">
                  <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  We respond within 2 hours on business days
                </p>
              </div>

              {submitted ? (
                /* Success state */
                <div className="px-6 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E6B2E]/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-[#1E6B2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <h3
                    className="text-[#1E6B2E] text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Thank You!
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                    We have received your enquiry and will contact you within 2 hours on
                    business days. Our travel experts are excited to plan your journey!
                  </p>
                  <button
                    onClick={resetForm}
                    className="mt-6 px-6 py-2.5 border border-[#1E6B2E] text-[#1E6B2E] font-semibold text-sm rounded-xl hover:bg-[#1E6B2E] hover:text-white transition-all"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <>
                  {/* Intent selector */}
                  <div className="px-6 pt-6">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                      What brings you here today?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {INTENTS.map((intent) => (
                        <button
                          key={intent.id}
                          type="button"
                          onClick={() => handleIntentSelect(intent.id, intent.prefill)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                            selectedIntent === intent.id
                              ? 'bg-[#1E6B2E] border-[#1E6B2E] text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-[#1E6B2E] hover:text-[#1E6B2E]'
                          }`}
                        >
                          {intent.emoji} {intent.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="px-6 pb-6 mt-6" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Full Name */}
                      <div>
                        <label htmlFor="name" className={LABEL_CLS}>
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          className={INPUT_CLS}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className={LABEL_CLS}>
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={INPUT_CLS}
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className={LABEL_CLS}>
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={handleChange}
                          className={INPUT_CLS}
                        />
                      </div>

                      {/* Nearest Office */}
                      <div>
                        <label htmlFor="office" className={LABEL_CLS}>
                          Nearest Office
                        </label>
                        <select
                          id="office"
                          name="office"
                          value={formData.office}
                          onChange={handleChange}
                          className={`${INPUT_CLS} ${formData.office ? 'text-gray-900' : 'text-gray-400'}`}
                        >
                          <option value="" disabled className="text-gray-400">
                            Select preferred office
                          </option>
                          {FORM_OFFICES.map((o) => (
                            <option key={o} value={o} className="text-gray-900">
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Travel Date */}
                      <div>
                        <label htmlFor="date" className={LABEL_CLS}>
                          Preferred Travel Date
                        </label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleChange}
                          className={INPUT_CLS}
                        />
                      </div>

                      {/* Travellers */}
                      <div>
                        <label htmlFor="travellers" className={LABEL_CLS}>
                          Number of Travellers
                        </label>
                        <input
                          id="travellers"
                          name="travellers"
                          type="number"
                          min={1}
                          placeholder="2"
                          value={formData.travellers}
                          onChange={handleChange}
                          className={INPUT_CLS}
                        />
                      </div>

                      {/* Message — full width */}
                      <div className="sm:col-span-2">
                        <label htmlFor="message" className={LABEL_CLS}>
                          Tell us about your travel plan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          required
                          placeholder="Share your travel dates, destinations, budget and any special requirements..."
                          value={formData.message}
                          onChange={handleChange}
                          className={`${INPUT_CLS} resize-y`}
                        />
                      </div>

                      {/* Submit */}
                      <div className="sm:col-span-2 mt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-[#1E6B2E] hover:bg-[#185a26] hover:shadow-lg hover:shadow-[#1E6B2E]/20 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all text-base flex items-center justify-center gap-2"
                        >
                          {submitting ? 'Sending...' : (
                            <>
                              Send Enquiry
                              <ArrowRightIcon />
                            </>
                          )}
                        </button>
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                          <LockIcon className="text-gray-400 w-3.5 h-3.5" />
                          <span className="text-gray-400 text-xs">
                            Your information is secure and never shared.
                          </span>
                        </div>
                      </div>

                    </div>
                  </form>
                </>
              )}
            </div>

            {/* ─────────────────────────────────────────
                CARD B — OUR OFFICES
            ───────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Top band */}
              <div className="bg-[#1E6B2E] px-6 py-4">
                <h2
                  className="text-white text-xl font-bold"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Find Your Nearest Office
                </h2>
                <p className="text-white/70 text-sm mt-0.5">21 offices across India and beyond</p>
              </div>

              {/* Region tabs */}
              <div className="px-6 pt-5">
                <div className="flex flex-wrap gap-2 mb-6">
                  {REGION_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#1E6B2E] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Office grid */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredOffices.map((office) => (
                    <OfficeCard key={office.id} office={office} />
                  ))}
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────
                CARD C — OTHER CONTACT OPTIONS
            ───────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3
                className="text-gray-900 text-lg font-bold mb-4"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Other Ways to Reach Us
              </h3>
              <div className="space-y-3">
                <a href="mailto:info@bonvoyagers.co" className="flex items-center gap-4 p-4 bg-[#F7F6F2] rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-[#1E6B2E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-5 h-5 text-[#1E6B2E]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Email Us</div>
                    <span className="text-[#1E6B2E] font-semibold text-sm">info@bonvoyagers.co</span>
                  </div>
                </a>
                <a href="tel:+919836755550" className="flex items-center gap-4 p-4 bg-[#F7F6F2] rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 bg-[#1E6B2E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-5 h-5 text-[#1E6B2E]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Call Us</div>
                    <span className="text-[#1E6B2E] font-semibold text-sm">+91 98367 55550</span>
                  </div>
                </a>
              </div>
            </div>

            {/* ─────────────────────────────────────────
                CARD D — FAQ
            ───────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3
                className="text-gray-900 text-lg font-bold mb-4"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Quick Answers
              </h3>
              <div>
                <details className="border border-gray-100 rounded-2xl overflow-hidden mb-3">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                    <span className="font-medium text-gray-900 text-sm">How do I book a group trip?</span>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 pt-2 text-gray-600 text-sm leading-relaxed bg-white">
                    Contact us via the form above or call our head office with your travel dates, group
                    size and destination. We handle groups of all sizes from 10 to 500+ travellers.
                  </div>
                </details>
                <details className="border border-gray-100 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                    <span className="font-medium text-gray-900 text-sm">Do you offer custom itineraries?</span>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6,9 12,15 18,9" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 pt-2 text-gray-600 text-sm leading-relaxed bg-white">
                    Yes, every trip we plan is custom-built for your budget, travel dates and group
                    preferences. We cover India and international destinations across 500+ packages.
                  </div>
                </details>
              </div>
            </div>

          </div>

          {/* ── Right column (sticky) ── */}
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24">

            {/* ─────────────────────────────────────────
                SIDEBAR A — WHY CHOOSE US
            ───────────────────────────────────────── */}
            <div className="bg-[#1E6B2E] rounded-3xl p-6 text-white">
              <h3
                className="text-white text-lg font-bold mb-5"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Why Travellers Choose Bon
              </h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <CheckCircleIcon className="w-4 h-4" />,
                    title: 'Real People, Real Support',
                    sub: 'We pick up the phone. Always.',
                  },
                  {
                    icon: <ShieldIcon className="w-4 h-4" />,
                    title: 'Secure Payments',
                    sub: 'SSL encrypted. Razorpay verified.',
                  },
                  {
                    icon: <StarIcon className="w-4 h-4" />,
                    title: '4.8/5 Rating',
                    sub: 'Across 3,200+ verified reviews',
                  },
                  {
                    icon: <MapPinIcon className="w-3.5 h-3.5" />,
                    title: '21 Offices Across India',
                    sub: 'Always a local expert near you',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      <p className="text-white/60 text-xs mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-full h-px bg-white/20 my-5" />
              <a
                href="https://wa.me/919836755550"
                className="bg-[#25D366] hover:bg-[#20c45e] text-white font-semibold py-3.5 rounded-xl w-full flex items-center justify-center gap-2 text-sm transition"
              >
                <WhatsAppIcon />
                Chat With an Expert
              </a>
            </div>

            {/* ─────────────────────────────────────────
                SIDEBAR B — GOOGLE MAPS
            ───────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-gray-900 font-semibold text-sm">Head Office Location</p>
                <p className="text-gray-500 text-xs mt-0.5">206, Raja Ram Mohan Roy Road, Kolkata</p>
              </div>
              <iframe
                title="Bon Voyagers Head Office Location"
                src="https://maps.google.com/maps?q=Bon+Voyagers+206+Raja+Ram+Mohan+Roy+Road+Kolkata&output=embed"
                width="100%"
                height="220"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, display: 'block' }}
              />
            </div>

            {/* ─────────────────────────────────────────
                SIDEBAR C — WORKING HOURS
            ───────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C8A96A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-[#C8A96A]" />
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">Working Hours</p>
                  <p className="text-gray-500 text-xs">We are here when you need us</p>
                </div>
              </div>
              <div className="h-px bg-gray-100 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-gray-700 text-sm font-medium">Monday to Saturday</span>
                <span className="text-[#1E6B2E] font-semibold text-sm">09:00 to 18:00</span>
              </div>
              <div className="mt-3 bg-[#1E6B2E]/5 border border-[#1E6B2E]/15 rounded-xl p-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse flex-shrink-0" />
                <span className="text-[#1E6B2E] text-xs font-medium">
                  24x7 emergency support for booked trips
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — WHATSAPP BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0D1A0F] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">

          {/* Left */}
          <div className="max-w-xl">
            <div className="inline-flex bg-[#25D366]/20 border border-[#25D366]/30 rounded-full px-4 py-1.5 mb-4">
              <span className="text-[#25D366] text-xs font-semibold uppercase tracking-wider">
                Free Consultation
              </span>
            </div>
            <h2
              className="text-white text-3xl sm:text-4xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Talk to a real person.
              <br />
              <span className="text-[#C8A96A]">Not a chatbot.</span>
            </h2>
            <p className="mt-4 text-white/60 text-base leading-relaxed max-w-lg">
              Our Kolkata-based experts have been planning trips since 2010.
              Call us, WhatsApp us, or walk into any of our 21 offices.
              We are always here.
            </p>
          </div>

          {/* Right — buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <a
              href="https://wa.me/919836755550"
              className="bg-[#25D366] hover:bg-[#20c45e] shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 text-base transition-all"
            >
              <WhatsAppIcon className="w-6 h-6" />
              WhatsApp Us Now
            </a>
            <a
              href="tel:+919836755550"
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl flex items-center gap-3 text-base transition"
            >
              <PhoneIcon className="w-5 h-5" />
              +91 98367 55550
            </a>
          </div>

        </div>
      </section>
    </>
  )
}
