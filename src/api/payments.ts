import { api } from '@/api/client'
import type { Payment, PaymentInput, PaymentUpdateInput } from '@/types/api'

export interface PaymentFilters {
  member?: number
  membership?: number
}

/** GET /api/payments/ */
export async function listPayments(filters: PaymentFilters = {}): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>('/payments/', { params: filters })
  return data
}

/** POST /api/payments/ */
export async function createPayment(input: PaymentInput): Promise<Payment> {
  const { data } = await api.post<Payment>('/payments/', input)
  return data
}

/** PATCH /api/payments/{id}/ */
export async function updatePayment(id: number, input: PaymentUpdateInput): Promise<Payment> {
  const { data } = await api.patch<Payment>(`/payments/${id}/`, input)
  return data
}
