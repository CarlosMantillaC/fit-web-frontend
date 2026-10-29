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

export function useCreateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: MemberInput) => createMember(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersQueryKey }),
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MemberInput }) => updateMember(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersQueryKey }),
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteMember(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersQueryKey }),
  })
}
