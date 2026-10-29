import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { listAttendances } from '@/api/attendance'
import { getDashboardStats } from '@/api/dashboard'
import { recentIsoDates } from '@/lib/format'

/** Métricas agregadas del panel. */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  })
}

/** Asistencias de los últimos días para la tendencia semanal. */
export function useDashboardWeekAttendance(days = 7) {
  const dates = useMemo(() => recentIsoDates(days), [days])

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: ['attendance', 'date', date],
      queryFn: () => listAttendances({ date }),
      staleTime: 60_000,
    })),
  })

  return { dates, results }
}
