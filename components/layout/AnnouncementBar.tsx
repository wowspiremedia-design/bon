export default function AnnouncementBar() {
  return (
    <div
      className="sticky top-0 z-50 w-full flex items-center justify-between"
      style={{
        background: '#0D1A0F',
        padding: '10px 20px',
      }}
    >
      <p
        className="m-0"
        style={{
          color: '#C8A96A',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        🔥 18% OFF North East Tours — Limited Seats
      </p>

      <span
        style={{
          background: '#C8A96A',
          color: '#0D1A0F',
          borderRadius: '20px',
          padding: '2px 10px',
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        6 left
      </span>
    </div>
  )
}
