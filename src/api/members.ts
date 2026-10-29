import { api } from '@/api/client'
import type { Member, MemberInput } from '@/types/api'

/** GET /api/members/ */
export async function listMembers(): Promise<Member[]> {
  const { data } = await api.get<Member[]>('/members/')
  return data
}

/** GET /api/members/{id}/ */
export async function getMember(id: number): Promise<Member> {
  const { data } = await api.get<Member>(`/members/${id}/`)
  return data
}

/** POST /api/members/ */
export async function createMember(input: MemberInput): Promise<void> {
  await api.post('/members/', input)
}

/** PATCH /api/members/{id}/ */
export async function updateMember(id: number, input: MemberInput): Promise<void> {
  await api.patch(`/members/${id}/`, input)
}

/** DELETE /api/members/{id}/delete/ (soft delete) */
export async function deleteMember(id: number): Promise<{ detail: string }> {
  const { data } = await api.delete<{ detail: string }>(`/members/${id}/delete/`)
  return data
}
