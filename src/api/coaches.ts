import { api } from '@/api/client'
import type { Coach, CoachInput } from '@/types/api'

/** GET /api/coaches/ (solo entrenadores activos) */
export async function listCoaches(): Promise<Coach[]> {
  const { data } = await api.get<Coach[]>('/coaches/')
  return data
}

/** POST /api/coaches/ */
export async function createCoach(input: CoachInput): Promise<Coach> {
  const { data } = await api.post<Coach>('/coaches/', input)
  return data
}

/** PATCH /api/coaches/{id}/ */
export async function updateCoach(id: number, input: CoachInput): Promise<Coach> {
  const { data } = await api.patch<Coach>(`/coaches/${id}/`, input)
  return data
}

/** DELETE /api/coaches/{id}/ (soft delete en backend) */
export async function deleteCoach(id: number): Promise<void> {
  await api.delete(`/coaches/${id}/`)
}
