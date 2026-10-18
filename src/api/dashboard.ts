import { api } from '@/api/client'
import type { DashboardStats } from '@/types/api'

/** GET /api/dashboard/ */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard/')
  return data
}
