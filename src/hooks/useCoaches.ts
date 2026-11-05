import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  coachCheckIn,
  coachCheckOut,
  createCoach,
  deleteCoach,
  getCoach,
  getCoachHistory,
  listCoaches,
  updateCoach,
  type CoachHistoryFilters,
} from '@/api/coaches'
import type { CoachInput } from '@/types/api'

export const coachesQueryKey = ['coaches'] as const

export const coachKeys = {
  all: coachesQueryKey,
  detail: (id: number) => ['coaches', 'detail', id] as const,
  history: (id: number, filters: CoachHistoryFilters = {}) =>
    ['coaches', 'history', id, filters] as const,
}

/** Entrenadores activos. */
export function useCoachesQuery() {
  return useQuery({
    queryKey: coachesQueryKey,
    queryFn: listCoaches,
    staleTime: 60_000,
  })
}

/** Detalle de un entrenador. */
export function useCoachQuery(id?: number) {
  return useQuery({
    queryKey: coachKeys.detail(id ?? 0),
    queryFn: () => getCoach(id as number),
    enabled: Boolean(id),
  })
}

/** Historial de asistencia de un entrenador. */
export function useCoachHistoryQuery(id?: number, filters: CoachHistoryFilters = {}) {
  return useQuery({
    queryKey: coachKeys.history(id ?? 0, filters),
    queryFn: () => getCoachHistory(id as number, filters),
    enabled: Boolean(id),
  })
}

function useInvalidateCoaches() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: coachesQueryKey })
}

function useInvalidateCoachHistory(coachId: number) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: coachesQueryKey }),
      queryClient.invalidateQueries({
        queryKey: ['coaches', 'history', coachId],
      }),
    ])
}

export function useCreateCoach() {
  const invalidate = useInvalidateCoaches()

  return useMutation({
    mutationFn: (input: CoachInput) => createCoach(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateCoach() {
  const invalidate = useInvalidateCoaches()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CoachInput }) => updateCoach(id, input),
    onSuccess: () => invalidate(),
  })
}

export function useDeleteCoach() {
  const invalidate = useInvalidateCoaches()

  return useMutation({
    mutationFn: (id: number) => deleteCoach(id),
    onSuccess: () => invalidate(),
  })
}

export function useCoachCheckIn(coachId: number) {
  const invalidate = useInvalidateCoachHistory(coachId)

  return useMutation({
    mutationFn: () => coachCheckIn(coachId),
    onSuccess: () => invalidate(),
  })
}

export function useCoachCheckOut(coachId: number) {
  const invalidate = useInvalidateCoachHistory(coachId)

  return useMutation({
    mutationFn: () => coachCheckOut(coachId),
    onSuccess: () => invalidate(),
  })
}
