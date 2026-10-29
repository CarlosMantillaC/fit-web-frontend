import { api } from '@/api/client'
import type { User, UserInput, UserUpdateInput } from '@/types/api'

/** GET /api/users/ (solo admin) */
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users/')
  return data
}

/** POST /api/users/ (solo admin) */
export async function createUser(input: UserInput): Promise<User> {
  const { data } = await api.post<User>('/users/', input)
  return data
}

/** PATCH /api/users/{id}/ (solo admin) */
export async function updateUser(id: number, input: UserUpdateInput): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}/`, input)
  return data
}

/** DELETE /api/users/{id}/ (solo admin) */
export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}/`)
}
