import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, CircleAlert, Ticket, UserRound } from 'lucide-react'
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
import { Select } from '@/components/ui/Select'
import { useMembersQuery } from '@/hooks/useMembers'
import { useCreateMembership } from '@/hooks/useMemberships'
import { usePlansQuery } from '@/hooks/usePlans'
import { addDaysIso, formatCurrency, formatDate, todayIsoDate } from '@/lib/format'
import { MEMBERSHIP_STATUS_OPTIONS } from '@/lib/memberships'
import { isPlanActive, planPrice } from '@/lib/plans'
import type { MembershipInput, MembershipStatus } from '@/types/api'

const membershipSchema = z.object({
  member: z.number().int().min(1, 'Selecciona un cliente'),
  plan: z.number().int().min(1, 'Selecciona un plan'),
  start_date: z.string().min(1, 'La fecha de inicio es obligatoria'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']),
})

type MembershipFormValues = z.infer<typeof membershipSchema>

interface MembershipFormModalProps {
  open: boolean
  initialMemberId?: number
  initialPlanId?: number
  onClose: () => void
  onSuccess: (message: string) => void
}

export function MembershipFormModal({
  open,
  initialMemberId,
  initialPlanId,
  onClose,
  onSuccess,
}: MembershipFormModalProps) {
  const { data: members = [] } = useMembersQuery()
  const { data: plans = [] } = usePlansQuery()
  const createMembership = useCreateMembership()

  const activePlans = plans.filter(isPlanActive)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      member: 0,
      plan: 0,
      start_date: todayIsoDate(),
      status: 'ACTIVE',
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      member: initialMemberId ?? 0,
      plan: initialPlanId ?? 0,
      start_date: todayIsoDate(),
      status: 'ACTIVE',
    })
  }, [open, initialMemberId, initialPlanId, reset])

  const selectedPlanId = useWatch({ control, name: 'plan' })
  const startDate = useWatch({ control, name: 'start_date' })
  const selectedPlan = activePlans.find((plan) => plan.id === selectedPlanId)
  const estimatedEnd =
    selectedPlan && startDate ? addDaysIso(startDate, selectedPlan.duration_days) : ''

  function onSubmit(values: MembershipFormValues) {
    const payload: MembershipInput = {
      member: values.member,
      plan: values.plan,
      start_date: values.start_date,
      status: values.status as MembershipStatus,
    }

    createMembership.mutate(payload, {
      onSuccess: () => {
        onSuccess('Membresía asignada correctamente.')
        onClose()
      },
    })
  }

  const hasPlans = activePlans.length > 0
  const hasMembers = members.length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Asignar membresía"
      description="La fecha de fin se calcula automáticamente según la duración del plan."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={createMembership.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="membership-form"
            isLoading={createMembership.isPending}
            disabled={!hasPlans || !hasMembers}
          >
            Asignar membresía
          </Button>
        </div>
      }
    >
      <form id="membership-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {createMembership.isError && (
          <FormError message={getApiErrorMessage(createMembership.error)} />
        )}

        {!hasPlans && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              No hay planes activos.{' '}
              <Link to="/app/plans" className="font-semibold underline">
                Crea o activa un plan
              </Link>{' '}
              antes de asignar membresías.
            </span>
          </div>
        )}

        <FormSection
          icon={UserRound}
          title="Cliente y plan"
          description="Selecciona a quién pertenece la membresía y qué plan contrata."
        >
          <Controller
            control={control}
            name="member"
            render={({ field }) => (
              <Select
                label="Cliente"
                error={errors.member?.message}
                placeholder="Selecciona un cliente…"
                searchable
                options={members.map((member) => ({
                  value: member.id,
                  label: member.full_name,
                  description: member.email,
                }))}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
                onBlur={field.onBlur}
              />
            )}
          />

          <Controller
            control={control}
            name="plan"
            render={({ field }) => (
              <Select
                label="Plan"
                error={errors.plan?.message}
                placeholder="Selecciona un plan…"
                options={activePlans.map((plan) => ({
                  value: plan.id,
                  label: plan.name,
                  description: `${formatCurrency(planPrice(plan))} · ${plan.duration_days} días`,
                }))}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormSection>

        <FormSection
          icon={CalendarDays}
          title="Periodo y estado"
          description="El vencimiento se calcula automáticamente al crear la membresía."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Fecha de inicio"
              type="date"
              error={errors.start_date?.message}
              {...register('start_date')}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Estado"
                  error={errors.status?.message}
                  options={MEMBERSHIP_STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-accent-strong/20 bg-accent-strong/10 px-3 py-2.5 text-sm text-ink-muted">
            <Ticket className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              {selectedPlan && estimatedEnd
                ? `Vencimiento estimado: ${formatDate(estimatedEnd)} (${selectedPlan.duration_days} días).`
                : 'Selecciona un plan para calcular la fecha de vencimiento.'}
            </span>
          </div>
        </FormSection>
      </form>
    </Modal>
  )
}
