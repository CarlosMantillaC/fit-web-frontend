import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createPlan, deletePlan, listPlans, updatePlan } from '@/api/plans'
import type { PlanInput } from '@/types/api'

export const plansQueryKey = ['plans'] as const

/** Catálogo completo de planes. */
export function usePlansQuery() {
  return useQuery({
    queryKey: plansQueryKey,
    queryFn: listPlans,
    staleTime: 60_000,
  })
}

function useInvalidatePlans() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: plansQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['memberships'] }),
    ])
}

export function useCreatePlan() {
  const invalidate = useInvalidatePlans()

  return useMutation({
    mutationFn: (input: PlanInput) => createPlan(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlans()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PlanInput }) => updatePlan(id, input),
    onSuccess: () => invalidate(),
  })
}

export function useDeletePlan() {
  const invalidate = useInvalidatePlans()

  return useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => invalidate(),
  })
}
