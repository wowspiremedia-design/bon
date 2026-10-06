// Original line icons, one per vehicle class. Drawn side-on, facing right.
// Stroke only, so they take the colour of the surrounding text.

const wheel = (cx: number, r = 4) => <circle key={cx} cx={cx} cy={23} r={r} />

function Shape({ vehicleClass }: { vehicleClass: string }) {
  switch (vehicleClass) {
    case 'hatchback':
      return (
        <>
          <path d="M7 23 V19 L13 10 H37 L44 16.5 H56 Q59 17 59 20 V23" />
          <path d="M16 13 H33 L38 16.5 H16 Z" />
          <path d="M7 23 H12 M20 23 H44 M52 23 H59" />
          {wheel(16)}
          {wheel(48)}
        </>
      )
    case 'sedan':
      return (
        <>
          <path d="M3 23 V19 Q3 17.5 5 17.5 H14 L20 10 H37 L45 17.5 H58 Q61 18 61 20.5 V23" />
          <path d="M22 12.5 H34 L39 17.5 H22 Z" />
          <path d="M3 23 H12 M20 23 H44 M52 23 H61" />
          {wheel(16)}
          {wheel(48)}
        </>
      )
    case 'suv-muv':
      return (
        <>
          <path d="M4 23 V12 Q4 9 7 9 H38 L46 16 H57 Q61 16.5 61 20 V23" />
          <path d="M12 12 H25 V16 H12 Z M28 12 H37 L42 16 H28 Z" />
          <path d="M4 23 H12 M20 23 H44 M52 23 H61" />
          {wheel(16)}
          {wheel(48)}
        </>
      )
    case 'rugged-suv':
      return (
        <>
          <path d="M8 21.5 V10 H38 L46 15.5 H57 Q60 16 60 19 V21.5" />
          <path d="M11 6.5 H35" />
          <path d="M13 12.5 H36 L40.5 15.5 H13 Z" />
          <circle cx={4} cy={14} r={3} />
          <path d="M8 21.5 H11 M21 21.5 H43 M53 21.5 H60" />
          <circle cx={16} cy={22} r={5} />
          <circle cx={48} cy={22} r={5} />
        </>
      )
    case 'group':
      return (
        <>
          <path d="M2 24 V9 Q2 7 4 7 H50 Q54 7 56 11 L61 18 V24" />
          <path d="M6 10.5 H15 V17 H6 Z M18 10.5 H27 V17 H18 Z M30 10.5 H39 V17 H30 Z M42 10.5 H50 L54 17 H42 Z" />
          <path d="M2 24 H11 M21 24 H43 M53 24 H61" />
          <circle cx={16} cy={24} r={4} />
          <circle cx={48} cy={24} r={4} />
        </>
      )
    default:
      return (
        <>
          <path d="M3 23 V19 Q3 17.5 5 17.5 H14 L20 10 H37 L45 17.5 H58 Q61 18 61 20.5 V23" />
          {wheel(16)}
          {wheel(48)}
        </>
      )
  }
}

export default function VehicleIcon({ vehicleClass, size = 56 }: { vehicleClass: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 64 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <Shape vehicleClass={vehicleClass} />
    </svg>
  )
}
