import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeEuro, Dumbbell } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useCreatePlan, useUpdatePlan } from '@/hooks/usePlans'
import type { Plan, PlanInput } from '@/types/api'

const planSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  price: z
    .string()
    .trim()
    .min(1, 'El precio es obligatorio')
    .refine((value) => {
      const parsed = Number(value.replace(',', '.'))
      return Number.isFinite(parsed) && parsed >= 0
    }, 'Introduce un precio válido'),
  duration_days: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(3650, 'Máximo 3650 días'),
  is_active: z.boolean(),
})

type PlanFormValues = z.infer<typeof planSchema>

const EMPTY_VALUES: PlanFormValues = {
  name: '',
  description: '',
  price: '',
  duration_days: 30,
  is_active: true,
}

interface PlanFormModalProps {
  open: boolean
  plan: Plan | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function PlanFormModal({ open, plan, onClose, onSuccess }: PlanFormModalProps) {
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      plan
        ? {
            name: plan.name,
            description: plan.description ?? '',
            price: String(plan.price),
            duration_days: plan.duration_days,
            is_active: plan.is_active !== false,
          }
        : EMPTY_VALUES,
    )
  }, [open, plan, reset])

  const isPending = createPlan.isPending || updatePlan.isPending
  const mutationError = createPlan.error ?? updatePlan.error
  const isError = createPlan.isError || updatePlan.isError

  function onSubmit(values: PlanFormValues) {
    const payload: PlanInput = {
      name: values.name,
      description: values.description?.trim() || undefined,
      price: String(Number(values.price.replace(',', '.'))),
      duration_days: values.duration_days,
      is_active: values.is_active,
    }

    if (plan) {
      updatePlan.mutate(
        { id: plan.id, input: payload },
        {
          onSuccess: () => {
            onSuccess('Plan actualizado correctamente.')
            onClose()
          },
        },
      )
      return
    }

    createPlan.mutate(payload, {
      onSuccess: () => {
        onSuccess('Plan creado correctamente.')
        onClose()
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={plan ? 'Editar plan' : 'Nuevo plan'}
      description={
        plan
          ? 'Actualiza las condiciones del plan y su disponibilidad.'
          : 'Define un nuevo plan para asignarlo a los clientes.'
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="plan-form" isLoading={isPending}>
            {plan ? 'Guardar cambios' : 'Crear plan'}
          </Button>
        </div>
      }
    >
      <form id="plan-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {isError && <FormError message={getApiErrorMessage(mutationError)} />}

        <FormSection
          icon={Dumbbell}
          title="Información del plan"
          description="Nombre y descripción visibles para el equipo."
        >
          <Input
            label="Nombre del plan"
            placeholder="Plan Mensual Premium"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Descripción"
            rows={3}
            placeholder="Acceso ilimitado a sala y clases colectivas…"
            {...register('description')}
          />
        </FormSection>

        <FormSection
          icon={BadgeEuro}
          title="Precio y vigencia"
          description="Define el costo y la duración que tendrá cada membresía."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Precio (€)"
              type="number"
              min="0"
              step="0.01"
              placeholder="49.90"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Duración (días)"
              type="number"
              min="1"
              step="1"
              placeholder="30"
              error={errors.duration_days?.message}
              {...register('duration_days', { valueAsNumber: true })}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/70 bg-surface-container-low p-3 transition-colors hover:border-line-hover">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[#ff6b00]"
              {...register('is_active')}
            />
            <span>
              <span className="block text-sm font-semibold text-ink">Plan activo</span>
              <span className="block text-xs text-ink-muted">
                Solo los planes activos se pueden asignar a nuevos clientes.
              </span>
            </span>
          </label>
        </FormSection>
      </form>
    </Modal>
  )
}
