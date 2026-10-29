import type { BadgeVariant } from '@/components/ui/Badge'
import type { PaymentMethod } from '@/types/api'

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
}

export const PAYMENT_METHOD_BADGE: Record<PaymentMethod, BadgeVariant> = {
  CASH: 'active',
  CARD: 'accent',
  TRANSFER: 'neutral',
}

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: PAYMENT_METHOD_LABEL.CASH },
  { value: 'CARD', label: PAYMENT_METHOD_LABEL.CARD },
  { value: 'TRANSFER', label: PAYMENT_METHOD_LABEL.TRANSFER },
]

/** Código legible del cobro (`PAG-0042`). */
export function paymentCode(id: number): string {
  return `PAG-${String(id).padStart(4, '0')}`
}
