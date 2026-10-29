import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createUser, deleteUser, listUsers, updateUser } from '@/api/users'
import type { UserInput, UserUpdateInput } from '@/types/api'

export const usersQueryKey = ['users'] as const

/** Usuarios del staff (solo admin). */
export function useUsersQuery(enabled = true) {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: listUsers,
    enabled,
    staleTime: 60_000,
  })
}

function useInvalidateUsers() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: usersQueryKey })
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: (input: UserInput) => createUser(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserUpdateInput }) => updateUser(id, input),
    onSuccess: () => invalidate(),
  })
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers()

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => invalidate(),
  })
}
