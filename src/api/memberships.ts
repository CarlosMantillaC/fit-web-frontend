import { api } from '@/api/client'
import type {
  Membership,
  MembershipInput,
  MembershipUpdateInput,
} from '@/types/api'

export interface MembershipFilters {
  member?: number
}

/** GET /api/memberships/ */
export async function listMemberships(
  filters: MembershipFilters = {},
): Promise<Membership[]> {
  const { data } = await api.get<Membership[]>('/memberships/', { params: filters })
  return data
}

/** POST /api/memberships/ (calcula end_date en el backend) */
export async function createMembership(input: MembershipInput): Promise<Membership> {
  const { data } = await api.post<Membership>('/memberships/', input)
  return data
}

/** PATCH /api/memberships/{id}/ */
export async function updateMembership(
  id: number,
  input: MembershipUpdateInput,
): Promise<Membership> {
  const { data } = await api.patch<Membership>(`/memberships/${id}/`, input)
  return data
}
