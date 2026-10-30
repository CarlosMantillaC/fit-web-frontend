import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createMember, deleteMember, listMembers, updateMember } from '@/api/members'
import type { MemberInput } from '@/types/api'

export const membersQueryKey = ['members'] as const

/** Lista de clientes (activos, sin soft-deleted). */
export function useMembersQuery() {
  return useQuery({
    queryKey: membersQueryKey,
    queryFn: listMembers,
  })
}

function useInvalidateMembers() {
  const queryClient = useQueryClient()

  // Los clientes alimentan métricas del dashboard (clientes activos, altas…).
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: membersQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ])
}

export function useCreateMember() {
  const invalidate = useInvalidateMembers()

  return useMutation({
    mutationFn: (input: MemberInput) => createMember(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateMember() {
  const invalidate = useInvalidateMembers()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MemberInput }) => updateMember(id, input),
    onSuccess: () => invalidate(),
  })
}

export function useDeleteMember() {
  const invalidate = useInvalidateMembers()

  return useMutation({
    mutationFn: (id: number) => deleteMember(id),
    onSuccess: () => invalidate(),
  })
}
