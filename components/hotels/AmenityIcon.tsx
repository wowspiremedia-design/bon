interface IconProps {
  size?: number
}

const COLOR = '#1E6B2E'

function svgProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: COLOR,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
}

function WifiIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M8.5 16.05a6 6 0 0 1 7 0" />
      <circle cx="12" cy="20" r="1" fill={COLOR} stroke="none" />
    </svg>
  )
}

function SnowflakeIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="19.07" y2="4.93" />
    </svg>
  )
}

function SunIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4" y1="12" x2="2" y2="12" />
      <line x1="22" y1="12" x2="20" y2="12" />
      <line x1="5.6" y1="5.6" x2="4.2" y2="4.2" />
      <line x1="19.8" y1="19.8" x2="18.4" y2="18.4" />
      <line x1="5.6" y1="18.4" x2="4.2" y2="19.8" />
      <line x1="19.8" y1="4.2" x2="18.4" y2="5.6" />
    </svg>
  )
}

function DropletIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 2c4 5 7 9 7 12a7 7 0 0 1-14 0c0-3 3-7 7-12z" />
    </svg>
  )
}

function TelevisionIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function BalconyIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <line x1="3" y1="4" x2="21" y2="4" />
      <line x1="3" y1="4" x2="3" y2="10" />
      <line x1="21" y1="4" x2="21" y2="10" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="5" y1="10" x2="5" y2="20" />
      <line x1="9" y1="10" x2="9" y2="20" />
      <line x1="13" y1="10" x2="13" y2="20" />
      <line x1="17" y1="10" x2="17" y2="20" />
    </svg>
  )
}

function ParkingIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 16V8h4a3 3 0 0 1 0 6H9" />
    </svg>
  )
}

function BellIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 18a8 8 0 0 1 16 0z" />
      <line x1="2" y1="18" x2="22" y2="18" />
      <line x1="12" y1="18" x2="12" y2="20" />
    </svg>
  )
}

function RestaurantIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <line x1="6" y1="2" x2="6" y2="10" />
      <line x1="9" y1="2" x2="9" y2="10" />
      <line x1="12" y1="2" x2="12" y2="10" />
      <path d="M6 10a3 3 0 0 0 6 0" />
      <line x1="9" y1="13" x2="9" y2="22" />
      <path d="M18 2c-2 0-3 2-3 5s1 4 3 4v11" />
    </svg>
  )
}

function CompassIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="15 9 12.8 12.8 9 15 11.2 11.2 15 9" />
    </svg>
  )
}

function BonfireIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 4c2 3 3 5 3 7a3 3 0 0 1-6 0c0-1 .5-2 1-3" />
      <line x1="5" y1="20" x2="19" y2="20" />
      <line x1="6" y1="20" x2="10" y2="16" />
      <line x1="18" y1="20" x2="14" y2="16" />
    </svg>
  )
}

function PlayBallIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12c3-2 6-2 9 0s6 2 9 0" />
      <path d="M12 3c-2 3-2 6 0 9s2 6 0 9" />
    </svg>
  )
}

function ElevatorIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <rect x="6" y="2" width="12" height="20" rx="1.5" />
      <polyline points="10 9 12 7 14 9" />
      <polyline points="10 15 12 17 14 15" />
    </svg>
  )
}

function BoltIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
    </svg>
  )
}

function CheckIcon({ size = 16 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Maps each known hotel_amenities taxonomy term name to a hand-drawn icon in
// the same inline-SVG style used throughout the rest of the site (no icon
// library is installed in this project). Room Heater uses a sun (warmth) and
// Balcony, Travel Desk / Tour Assistance, Bonfire, and Kids Play Area use the
// closest reasonable approximation since there is no exact glyph for those.
const AMENITY_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  'WiFi': WifiIcon,
  'AC': SnowflakeIcon,
  'Room Heater': SunIcon,
  'Geyser (Hot Water)': DropletIcon,
  'Television': TelevisionIcon,
  'Balcony': BalconyIcon,
  'Parking': ParkingIcon,
  'Room Service': BellIcon,
  'Restaurant': RestaurantIcon,
  'Travel Desk / Tour Assistance': CompassIcon,
  'Bonfire': BonfireIcon,
  'Kids Play Area': PlayBallIcon,
  'Elevator': ElevatorIcon,
  'Power Backup': BoltIcon,
}

export function AmenityIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = AMENITY_ICONS[name] ?? CheckIcon
  return <Icon size={size} />
}
