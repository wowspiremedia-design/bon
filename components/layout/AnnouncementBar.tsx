export default function AnnouncementBar() {
  return (
    <div
      className="w-full h-10 flex items-center justify-between"
      style={{
        background: '#0D1A0F',
        padding: '0 20px',
      }}
    >
      <p
        className="m-0 hidden sm:block"
        style={{
          color: '#C8A96A',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        🔥 18% OFF North East Tours • Limited Seats
      </p>

      <p
        className="m-0 sm:hidden"
        style={{
          color: '#C8A96A',
          fontSize: '13px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        🔥 18% OFF North East Tours
      </p>

      <span
        className="hidden sm:inline-flex"
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
