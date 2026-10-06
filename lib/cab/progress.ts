// The "sending" view stays up for at least this long, so it reads as calm and
// deliberate rather than flashing past.
export const MIN_PROGRESS_MS = 2500

// How much longer to wait after the sender returned, given when it started.
// Never negative. A failure does not use this: errors show immediately.
export function remainingProgressMs(startedAtMs: number, nowMs: number): number {
  return Math.max(0, MIN_PROGRESS_MS - (nowMs - startedAtMs))
}
