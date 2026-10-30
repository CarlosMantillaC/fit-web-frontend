import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createPayment, listPayments, updatePayment } from '@/api/payments'
import type { PaymentInput, PaymentUpdateInput } from '@/types/api'

export const paymentsQueryKey = ['payments'] as const

/** Historial completo de cobros. */
export function usePaymentsQuery() {
  return useQuery({
    queryKey: paymentsQueryKey,
    queryFn: () => listPayments(),
  })
}

function useInvalidatePayments() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
    ])
}

export function useCreatePayment() {
  const invalidate = useInvalidatePayments()

  return useMutation({
    mutationFn: (input: PaymentInput) => createPayment(input),
    onSuccess: () => invalidate(),
  })
}

export function useUpdatePayment() {
  const invalidate = useInvalidatePayments()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PaymentUpdateInput }) =>
      updatePayment(id, input),
    onSuccess: () => invalidate(),
  })
}
