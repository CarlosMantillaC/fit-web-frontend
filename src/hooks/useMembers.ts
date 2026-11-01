import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createMember, deleteMember, getMember, listMembers, updateMember } from '@/api/members'
import type { MemberInput } from '@/types/api'

export const membersQueryKey = ['members'] as const
export const memberQueryKey = (id: number) => ['members', id] as const

/** Lista de clientes (activos, sin soft-deleted). */
export function useMembersQuery() {
  return useQuery({
    queryKey: membersQueryKey,
    queryFn: listMembers,
  })
}

/** Expediente de un cliente concreto. */
export function useMemberQuery(id?: number) {
  return useQuery({
    queryKey: memberQueryKey(id ?? 0),
    queryFn: () => getMember(id as number),
    enabled: Boolean(id),
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
