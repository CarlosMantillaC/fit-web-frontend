import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createCoach, deleteCoach, listCoaches, updateCoach } from '@/api/coaches'
import type { CoachInput } from '@/types/api'

export const coachesQueryKey = ['coaches'] as const

/** Entrenadores activos. */
export function useCoachesQuery() {
  return useQuery({
    queryKey: coachesQueryKey,
    queryFn: listCoaches,
    staleTime: 60_000,
  })
}

function useInvalidateCoaches() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: coachesQueryKey })
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
