// Label wrapper for a form input, copied verbatim from the identical `Field`
// helper in EnquiryPopup.tsx, MiceEnquiryModal.tsx and CheckAvailabilityButton.tsx.
export function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-[6px]" style={{ fontSize: '12px', fontWeight: 600, color: '#4A4A4A', marginBottom: '6px' }}>
        {icon}
        {label}
      </p>
      {children}
    </div>
  )
}

export default Field
