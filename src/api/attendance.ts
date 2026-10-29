import { api } from '@/api/client'
import type { Attendance } from '@/types/api'

export interface AttendanceFilters {
  member?: number
  date?: string
}

/** GET /api/attendance/ */
export async function listAttendances(filters: AttendanceFilters = {}): Promise<Attendance[]> {
  const { data } = await api.get<Attendance[]>('/attendance/', { params: filters })
  return data
}

/** POST /api/attendance/check-in/ */
export async function checkIn(memberId: number): Promise<Attendance> {
  const { data } = await api.post<Attendance>('/attendance/check-in/', { member_id: memberId })
  return data
}

/** POST /api/attendance/{id}/check-out/ */
export async function checkOut(attendanceId: number): Promise<Attendance> {
  const { data } = await api.post<Attendance>(`/attendance/${attendanceId}/check-out/`)
  return data
}
