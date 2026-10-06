import {
  CAB_TIMEZONE,
  EARLY_PICKUP_CUTOFF_HOUR,
  RIDE_LATER_MAX_ADVANCE_DAYS,
  RIDE_LATER_MIN_NOTICE_HOURS,
  SUPPORT_HOURS_END,
  SUPPORT_HOURS_START,
} from './config'

// Pure cab time helpers. Every function that depends on the current time takes
// an injected `now` Date, and everything is read in Asia/Kolkata through Intl,
// so the browser's own timezone never matters. Dates travel as 'YYYY-MM-DD'
// keys and times as 'HH:mm' strings in India time.

export const SLOT_MINUTES = 15
export const IST_OFFSET = '+05:30'

const SLOT_MS = SLOT_MINUTES * 60 * 1000
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const istFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: CAB_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const pad = (n: number) => String(n).padStart(2, '0')

export interface IstNow {
  date: string
  time: string
  hour: number
  minute: number
}

export interface DateChip {
  date: string
  weekday: string
  day: number
  month: string
  label: string
  isToday: boolean
  disabled: boolean
}

export interface Slot {
  date: string
  time: string
}

export function nowInIst(now: Date): IstNow {
  const parts: Record<string, string> = {}
  for (const p of istFormat.formatToParts(now)) parts[p.type] = p.value
  const hour = Number(parts.hour) % 24
  const minute = Number(parts.minute)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${pad(hour)}:${pad(minute)}`,
    hour,
    minute,
  }
}

function parseDateKey(key: string): { y: number; m: number; d: number } {
  const [y, m, d] = key.split('-').map(Number)
  return { y, m, d }
}

export function addDays(dateKey: string, days: number): string {
  const { y, m, d } = parseDateKey(dateKey)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`
}

function weekdayIndex(dateKey: string): number {
  const { y, m, d } = parseDateKey(dateKey)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function todayKey(now: Date): string {
  return nowInIst(now).date
}

export function maxDateKey(now: Date): string {
  return addDays(todayKey(now), RIDE_LATER_MAX_ADVANCE_DAYS)
}

// Current India time plus the minimum notice, rounded up to the next 15 minutes.
// India is a whole number of quarter hours from UTC, so rounding the epoch
// value gives the same answer as rounding the India clock.
export function earliestSlot(now: Date): Slot {
  const ms = now.getTime() + RIDE_LATER_MIN_NOTICE_HOURS * 60 * 60 * 1000
  const rounded = Math.ceil(ms / SLOT_MS) * SLOT_MS
  const p = nowInIst(new Date(rounded))
  return { date: p.date, time: p.time }
}

// All 15 minute pickup times a customer may choose on a date, oldest first.
// Empty for dates in the past, beyond the advance limit, or with nothing left.
export function slotsForDate(now: Date, dateKey: string): string[] {
  if (dateKey < todayKey(now) || dateKey > maxDateKey(now)) return []
  const earliest = earliestSlot(now)
  const out: string[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += SLOT_MINUTES) {
    const time = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
    if (dateKey > earliest.date || (dateKey === earliest.date && time >= earliest.time)) out.push(time)
  }
  return out
}

export function isSlotAllowed(now: Date, dateKey: string, time: string): boolean {
  return slotsForDate(now, dateKey).includes(time)
}

// Today and every day up to the advance limit. A chip is disabled when the
// date has no slot left (today, late in the evening).
export function buildDateChips(now: Date): DateChip[] {
  const today = todayKey(now)
  const chips: DateChip[] = []
  for (let i = 0; i <= RIDE_LATER_MAX_ADVANCE_DAYS; i++) {
    const date = addDays(today, i)
    const { m, d } = parseDateKey(date)
    const weekday = WEEKDAYS[weekdayIndex(date)]
    const month = MONTHS[m - 1]
    chips.push({
      date,
      weekday,
      day: d,
      month,
      label: `${weekday} ${d} ${month}`,
      isToday: i === 0,
      disabled: slotsForDate(now, date).length === 0,
    })
  }
  return chips
}

// The support desk is closed before the start hour and from the end hour on.
export function isOutsideSupportHours(now: Date): boolean {
  const { hour } = nowInIst(now)
  return hour < SUPPORT_HOURS_START || hour >= SUPPORT_HOURS_END
}

export function isEarlyPickup(time: string): boolean {
  return Number(time.slice(0, 2)) < EARLY_PICKUP_CUTOFF_HOUR
}

// Round trip: the car comes back on the pickup date plus (days - 1).
export function returnDate(pickupDate: string, days: number): string {
  return addDays(pickupDate, Math.max(1, days) - 1)
}

export function formatDateShort(dateKey: string): string {
  const { m, d } = parseDateKey(dateKey)
  return `${WEEKDAYS[weekdayIndex(dateKey)]} ${d} ${MONTHS[m - 1]}`
}

export function formatTime(time: string): string {
  const hour = Number(time.slice(0, 2))
  const minute = time.slice(3, 5)
  return `${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`
}

// "Wed 8 Oct, 9:30 AM"
export function formatSlot(dateKey: string, time: string): string {
  return `${formatDateShort(dateKey)}, ${formatTime(time)}`
}

// "7 AM", "10 PM", "12 PM"
export function formatHour(hour: number): string {
  return `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? 'AM' : 'PM'}`
}

// India has no daylight saving, so the offset is always +05:30.
export function toIstIso(dateKey: string, time: string): string {
  return `${dateKey}T${time}:00${IST_OFFSET}`
}

export function parseIstIso(iso: string): Slot | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):00\+05:30$/.exec(iso)
  return m ? { date: m[1], time: m[2] } : null
}
