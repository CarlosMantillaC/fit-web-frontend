import { api } from '@/api/client'
import type { Coach, CoachAttendance, CoachHistory, CoachInput } from '@/types/api'

/** GET /api/coaches/ (solo entrenadores activos) */
export async function listCoaches(): Promise<Coach[]> {
  const { data } = await api.get<Coach[]>('/coaches/')
  return data
}

/** GET /api/coaches/{id}/ */
export async function getCoach(id: number): Promise<Coach> {
  const { data } = await api.get<Coach>(`/coaches/${id}/`)
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

export interface CoachHistoryFilters {
  date_from?: string
  date_to?: string
}

/** GET /api/coaches/{id}/history/ (solo asistencias) */
export async function getCoachHistory(
  id: number,
  filters: CoachHistoryFilters = {},
): Promise<CoachHistory> {
  const { data } = await api.get<CoachHistory>(`/coaches/${id}/history/`, {
    params: filters,
  })
  return data
}

/** POST /api/coaches/{id}/check-in/ */
export async function coachCheckIn(id: number): Promise<CoachAttendance> {
  const { data } = await api.post<CoachAttendance>(`/coaches/${id}/check-in/`)
  return data
}

/** POST /api/coaches/{id}/check-out/ */
export async function coachCheckOut(id: number): Promise<CoachAttendance> {
  const { data } = await api.post<CoachAttendance>(`/coaches/${id}/check-out/`)
  return data
}
