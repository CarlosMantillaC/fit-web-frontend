import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useUpdateMembership } from '@/hooks/useMemberships'
import { formatDate } from '@/lib/format'
import {
  MEMBERSHIP_STATUS_OPTIONS,
  membershipBadgeLabel,
  membershipBadgeVariant,
} from '@/lib/memberships'
import type { Membership } from '@/types/api'

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']),
})

type StatusFormValues = z.infer<typeof statusSchema>

interface MembershipStatusModalProps {
  open: boolean
  membership: Membership | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function MembershipStatusModal({
  open,
  membership,
  onClose,
  onSuccess,
}: MembershipStatusModalProps) {
  const updateMembership = useUpdateMembership()

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: 'ACTIVE' },
  })

  useEffect(() => {
    if (!open || !membership) return
    reset({ status: membership.status })
  }, [open, membership, reset])

  function onSubmit(values: StatusFormValues) {
    if (!membership) return

    updateMembership.mutate(
      { id: membership.id, input: { status: values.status } },
      {
        onSuccess: () => {
          onSuccess('Estado de la membresía actualizado.')
          onClose()
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cambiar estado de la membresía"
      description="Solo se modifica el estado; la fecha de fin no se recalcula."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={updateMembership.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="membership-status-form" isLoading={updateMembership.isPending}>
            Guardar estado
          </Button>
        </div>
      }
    >
      <form
        id="membership-status-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        {updateMembership.isError && (
          <FormError message={getApiErrorMessage(updateMembership.error)} />
        )}

        {membership && (
          <div className="flex items-start gap-3 rounded-xl border border-line/70 bg-surface-container-low p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
              <CalendarClock className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-ink">
                  {membership.member_details.full_name}
                </span>
                <Badge variant={membershipBadgeVariant(membership)}>
                  {membershipBadgeLabel(membership)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {membership.plan_details.name} · {formatDate(membership.start_date)} —{' '}
                {formatDate(membership.end_date)}
              </p>
            </div>
          </div>
        )}

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label="Nuevo estado"
              error={errors.status?.message}
              options={MEMBERSHIP_STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <p className="text-xs text-ink-muted">
          Reactivar una membresía vencida mantiene su fecha de fin original. Para ampliar el
          periodo, usa la acción de renovar.
        </p>
      </form>
    </Modal>
  )
}
