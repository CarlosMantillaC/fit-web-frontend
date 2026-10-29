import { ReceiptText } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useUpdatePayment } from '@/hooks/usePayments'
import { formatCurrency, formatDateTime } from '@/lib/format'
import {
  PAYMENT_METHOD_BADGE,
  PAYMENT_METHOD_LABEL,
  paymentCode,
} from '@/lib/payments'
import type { Payment } from '@/types/api'

interface PaymentDetailModalProps {
  open: boolean
  payment: Payment | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function PaymentDetailModal({
  open,
  payment,
  onClose,
  onSuccess,
}: PaymentDetailModalProps) {
  const updatePayment = useUpdatePayment()
  const [notes, setNotes] = useState(payment?.notes ?? '')

  function handleSave() {
    if (!payment) return

    updatePayment.mutate(
      { id: payment.id, input: { notes } },
      {
        onSuccess: () => {
          onSuccess('Notas del cobro actualizadas.')
          onClose()
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={payment ? `Cobro ${paymentCode(payment.id)}` : 'Detalle del cobro'}
      description="Consulta los datos del cobro y actualiza sus notas."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={updatePayment.isPending}>
            Cerrar
          </Button>
          <Button onClick={handleSave} isLoading={updatePayment.isPending}>
            Guardar notas
          </Button>
        </div>
      }
    >
      {payment && (
        <div className="space-y-4">
          {updatePayment.isError && <FormError message={getApiErrorMessage(updatePayment.error)} />}

          <div className="flex items-start gap-3 rounded-xl border border-line/70 bg-surface-container-low p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
              <ReceiptText className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">
                  {payment.membership_details.member_details.full_name}
                </span>
                <Badge variant={PAYMENT_METHOD_BADGE[payment.method]}>
                  {PAYMENT_METHOD_LABEL[payment.method]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {payment.membership_details.plan_details.name} ·{' '}
                {formatDateTime(payment.payment_date)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
                Importe
              </span>
              <span className="font-heading text-xl font-bold text-ink">
                {formatCurrency(Number(payment.amount))}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
                Registrado por
              </span>
              <span className="text-sm font-semibold text-ink">
                {payment.received_by ? `Usuario #${payment.received_by}` : 'Sistema'}
              </span>
            </div>
          </div>

          <Textarea
            label="Notas"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Sin notas…"
            hint="Puedes añadir observaciones internas sobre este cobro."
          />
        </div>
      )}
    </Modal>
  )
}
