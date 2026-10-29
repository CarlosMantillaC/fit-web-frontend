import { useEffect, useState } from 'react'

import { formatClock } from '@/lib/format'

/** Reloj en vivo actualizado cada segundo. */
export function useClock(): string {
  const [time, setTime] = useState(() => formatClock())

  useEffect(() => {
    const interval = window.setInterval(() => setTime(formatClock()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  return time
}
