import { zodResolver } from '@hookform/resolvers/zod'
import { Banknote, CircleAlert, NotebookPen, ReceiptText } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useMembershipsQuery } from '@/hooks/useMemberships'
import { useCreatePayment } from '@/hooks/usePayments'
import { formatCurrency, formatDate, toDateTimeInputValue } from '@/lib/format'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/payments'
import type { PaymentInput, PaymentMethod } from '@/types/api'

const paymentSchema = z.object({
  membership: z.number().int().min(1, 'Selecciona una membresía'),
  amount: z
    .string()
    .trim()
    .min(1, 'El importe es obligatorio')
    .refine((value) => {
      const parsed = Number(value.replace(',', '.'))
      return Number.isFinite(parsed) && parsed > 0
    }, 'Introduce un importe mayor que 0'),
  payment_date: z
    .string()
    .min(1, 'La fecha es obligatoria')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Fecha no válida'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER']),
  notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface PaymentFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export function PaymentFormModal({ open, onClose, onSuccess }: PaymentFormModalProps) {
  const { data: memberships = [] } = useMembershipsQuery()
  const createPayment = useCreatePayment()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      membership: 0,
      amount: '',
      payment_date: toDateTimeInputValue(),
      method: 'CASH',
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      membership: 0,
      amount: '',
      payment_date: toDateTimeInputValue(),
      method: 'CASH',
      notes: '',
    })
  }, [open, reset])

  const selectedMembershipId = useWatch({ control, name: 'membership' })
  const selectedMembership = memberships.find((item) => item.id === selectedMembershipId)

  function onSubmit(values: PaymentFormValues) {
    const payload: PaymentInput = {
      membership: values.membership,
      amount: String(Number(values.amount.replace(',', '.'))),
      payment_date: new Date(values.payment_date).toISOString(),
      method: values.method as PaymentMethod,
      notes: values.notes?.trim() || undefined,
    }

    createPayment.mutate(payload, {
      onSuccess: () => {
        onSuccess('Pago registrado correctamente.')
        onClose()
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Registrar pago"
      description="Los cobros se asocian a una membresía ya existente."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={createPayment.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="payment-form"
            isLoading={createPayment.isPending}
            disabled={memberships.length === 0}
          >
            Registrar pago
          </Button>
        </div>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {createPayment.isError && <FormError message={getApiErrorMessage(createPayment.error)} />}

        {memberships.length === 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              No hay membresías registradas.{' '}
              <Link to="/app/memberships" className="font-semibold underline">
                Asigna una membresía
              </Link>{' '}
              antes de registrar el cobro.
            </span>
          </div>
        )}

        <FormSection
          icon={ReceiptText}
          title="Membresía"
          description="Cada pago debe quedar vinculado a una membresía."
        >
          <Controller
            control={control}
            name="membership"
            render={({ field }) => (
              <Select
                label="Membresía"
                error={errors.membership?.message}
                placeholder="Selecciona una membresía…"
                searchable
                options={memberships.map((membership) => ({
                  value: membership.id,
                  label: membership.member_details.full_name,
                  description: `${membership.plan_details.name} · vence ${formatDate(membership.end_date)}`,
                }))}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
                onBlur={field.onBlur}
              />
            )}
          />

          {selectedMembership && (
            <div className="flex items-start gap-2 rounded-xl border border-accent-strong/20 bg-accent-strong/10 px-3 py-2.5 text-sm text-ink-muted">
              <ReceiptText className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>
                Precio del plan:{' '}
                {formatCurrency(Number(selectedMembership.plan_details.price))} ·{' '}
                {selectedMembership.plan_details.name}
              </span>
            </div>
          )}
        </FormSection>

        <FormSection
          icon={Banknote}
          title="Detalle del cobro"
          description="Importe, método y momento en que se recibió el pago."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Importe (€)"
              type="number"
              min="0"
              step="0.01"
              placeholder="49.90"
              error={errors.amount?.message}
              {...register('amount')}
            />
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select
                  label="Método de pago"
                  error={errors.method?.message}
                  options={PAYMENT_METHOD_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>

          <Input
            label="Fecha y hora"
            type="datetime-local"
            error={errors.payment_date?.message}
            {...register('payment_date')}
          />
        </FormSection>

        <FormSection
          icon={NotebookPen}
          title="Notas"
          description="Información adicional opcional sobre el cobro."
        >
          <Textarea
            label="Observaciones"
            rows={3}
            placeholder="Observaciones del cobro…"
            {...register('notes')}
          />
        </FormSection>
      </form>
    </Modal>
  )
}
