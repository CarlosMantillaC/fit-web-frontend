import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createMembership,
  listMemberships,
  updateMembership,
} from '@/api/memberships'
import type { MembershipInput, MembershipUpdateInput } from '@/types/api'

export const membershipsQueryKey = ['memberships'] as const

/** Todas las membresías (para cruzar plan y vigencia con los clientes). */
export function useMembershipsQuery() {
  return useQuery({
    queryKey: membershipsQueryKey,
    queryFn: () => listMemberships(),
    staleTime: 60_000,
  })
}

function useInvalidateMemberships() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: membershipsQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    ])
}

export function useCreateMembership() {
  const invalidate = useInvalidateMemberships()

  return useMutation({
    mutationFn: (input: MembershipInput) => createMembership(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateMembership() {
  const invalidate = useInvalidateMemberships()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MembershipUpdateInput }) =>
      updateMembership(id, input),
    onSuccess: () => invalidate(),
  })
}
