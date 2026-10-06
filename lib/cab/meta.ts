import type { CabRequestPayload } from './payload'

// The Meta pixel's base snippet in app/layout.tsx defines fbq as a global, and
// components/shared/EnquiryPopup.tsx declares its type globally, so no
// declaration is repeated here.

// Fires the CabLead custom event for a successful cab request. Only the ride
// type and trip type are sent: no name, phone, email, notes or place names.
// Guarded so an ad blocker or a missing pixel can never throw into the booking
// success or error handling. Call it once per successful submission.
export function trackCabLead(payload: Pick<CabRequestPayload, 'rideType' | 'tripType'>): void {
  try {
    if (typeof fbq === 'function') {
      fbq('trackCustom', 'CabLead', {
        content_category: 'cab',
        ride_type: payload.rideType,
        trip_type: payload.tripType,
      })
    }
  } catch {
    // Tracking must never affect the booking.
  }
}
