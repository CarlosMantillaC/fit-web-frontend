import { api } from '@/api/client'
import type { Attendance, ScanResult } from '@/types/api'

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

/** POST /api/attendance/scan/ (identifica y alterna entrada/salida) */
export async function scanQr(code: string): Promise<ScanResult> {
  const { data } = await api.post<ScanResult>('/attendance/scan/', { code })
  return data
}
