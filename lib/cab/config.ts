// Cab booking business rules. Constants only, no logic.

// Support desk opens at this hour (24-hour clock, India time).
export const SUPPORT_HOURS_START = 7

// Support desk closes at this hour (24-hour clock, India time).
export const SUPPORT_HOURS_END = 22

// A scheduled ride must be requested at least this many hours before pickup.
export const RIDE_LATER_MIN_NOTICE_HOURS = 2

// A scheduled ride cannot be requested more than this many days ahead.
export const RIDE_LATER_MAX_ADVANCE_DAYS = 60

// Pickups before this hour (24-hour clock, India time) count as early pickups.
export const EARLY_PICKUP_CUTOFF_HOUR = 9

// Longest round trip, in days, that can be booked online.
export const MAX_DAYS_ROUND_TRIP = 15

// Most intermediate stops allowed between pickup and drop on one trip.
export const MAX_VIA_STOPS = 20

// All cab times and support hours are interpreted in this timezone.
export const CAB_TIMEZONE = 'Asia/Kolkata'
