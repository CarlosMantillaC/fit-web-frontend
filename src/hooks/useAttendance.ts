import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { checkIn, checkOut, listAttendances } from '@/api/attendance'

export const attendanceKeys = {
  all: ['attendance'] as const,
  byDate: (date: string) => ['attendance', 'date', date] as const,
  byMember: (memberId: number) => ['attendance', 'member', memberId] as const,
}

/** Asistencias de un día concreto (pensado para el feed en vivo). */
export function useAttendancesByDateQuery(date: string) {
  return useQuery({
    queryKey: attendanceKeys.byDate(date),
    queryFn: () => listAttendances({ date }),
    refetchInterval: 20_000,
  })
}

/** Historial de un cliente concreto. */
export function useMemberAttendancesQuery(memberId?: number) {
  return useQuery({
    queryKey: attendanceKeys.byMember(memberId ?? 0),
    queryFn: () => listAttendances({ member: memberId }),
    enabled: Boolean(memberId),
  })
}

function useInvalidateAttendance() {
  const queryClient = useQueryClient()

  // El check-in/out cambia "asistencias de hoy" en el dashboard.
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ])
}

export function useCheckIn() {
  const invalidate = useInvalidateAttendance()

  return useMutation({
    mutationFn: (memberId: number) => checkIn(memberId),
    onSuccess: () => invalidate(),
  })
}

export function useCheckOut() {
  const invalidate = useInvalidateAttendance()

  return useMutation({
    mutationFn: (attendanceId: number) => checkOut(attendanceId),
    onSuccess: () => invalidate(),
  })
}
