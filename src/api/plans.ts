import { api } from '@/api/client'
import type { Plan, PlanInput } from '@/types/api'

/** GET /api/plans/ */
export async function listPlans(): Promise<Plan[]> {
  const { data } = await api.get<Plan[]>('/plans/')
  return data
}

/** POST /api/plans/ (solo admin) */
export async function createPlan(input: PlanInput): Promise<Plan> {
  const { data } = await api.post<Plan>('/plans/', input)
  return data
}

/** PATCH /api/plans/{id}/ (solo admin) */
export async function updatePlan(id: number, input: PlanInput): Promise<Plan> {
  const { data } = await api.patch<Plan>(`/plans/${id}/`, input)
  return data
}

/** DELETE /api/plans/{id}/ (solo admin) */
export async function deletePlan(id: number): Promise<void> {
  await api.delete(`/plans/${id}/`)
}
