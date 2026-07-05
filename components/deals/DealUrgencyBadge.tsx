'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface Countdown {
  hours: number
  minutes: number
}

function useCountdown(): Countdown | null {
  const [time, setTime] = useState<Countdown | null>(null)

  useEffect(() => {
    setTime({
      hours: Math.floor(Math.random() * (71 - 12 + 1)) + 12,
      minutes: Math.floor(Math.random() * 60),
    })

    const interval = setInterval(() => {
      setTime((prev) => {
        if (!prev) return prev
        if (prev.hours === 0 && prev.minutes === 0) {
          clearInterval(interval)
          return prev
        }
        if (prev.minutes === 0) {
          return { hours: prev.hours - 1, minutes: 59 }
        }
        return { hours: prev.hours, minutes: prev.minutes - 1 }
      })
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return time
}

function useSeatsLeft(): number | null {
  const [seats, setSeats] = useState<number | null>(null)

  useEffect(() => {
    setSeats(Math.floor(Math.random() * (15 - 3 + 1)) + 3)
  }, [])

  return seats
}

export function SeatsLeftBadge() {
  const seats = useSeatsLeft()
  if (seats === null) return null
  return (
    <span className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full animate-pulse">
      Only {seats} seats left
    </span>
  )
}

export function CountdownText() {
  const time = useCountdown()
  if (!time) return null
  return (
    <span className="inline-flex items-center gap-1">
      <Clock className="w-3.5 h-3.5" />
      Ends in {time.hours}h {time.minutes}m
    </span>
  )
}
