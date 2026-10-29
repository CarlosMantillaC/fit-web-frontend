import { zodResolver } from '@hookform/resolvers/zod'
import { NotebookPen, UserRound } from 'lucide-react'
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
import { useCreateCoach, useUpdateCoach } from '@/hooks/useCoaches'
import { coachFullName } from '@/lib/coaches'
import type { Coach, CoachInput } from '@/types/api'

const coachSchema = z.object({
  first_name: z.string().trim().min(1, 'El nombre es obligatorio'),
  last_name: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  specialty: z.string().trim().min(1, 'La especialidad es obligatoria'),
  phone: z.string().trim().max(20, 'Máximo 20 caracteres').optional(),
  bio: z.string().optional(),
})

type CoachFormValues = z.infer<typeof coachSchema>

const EMPTY_VALUES: CoachFormValues = {
  first_name: '',
  last_name: '',
  specialty: '',
  phone: '',
  bio: '',
}

interface CoachFormModalProps {
  open: boolean
  coach: Coach | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function CoachFormModal({ open, coach, onClose, onSuccess }: CoachFormModalProps) {
  const createCoach = useCreateCoach()
  const updateCoach = useUpdateCoach()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      coach
        ? {
            first_name: coach.first_name,
            last_name: coach.last_name,
            specialty: coach.specialty,
            phone: coach.phone ?? '',
            bio: coach.bio ?? '',
          }
        : EMPTY_VALUES,
    )
  }, [open, coach, reset])

  const isPending = createCoach.isPending || updateCoach.isPending
  const mutationError = createCoach.error ?? updateCoach.error
  const isError = createCoach.isError || updateCoach.isError

  function onSubmit(values: CoachFormValues) {
    const payload: CoachInput = {
      first_name: values.first_name,
      last_name: values.last_name,
      specialty: values.specialty,
      phone: values.phone?.trim() || undefined,
      bio: values.bio?.trim() || undefined,
      is_active: true,
    }

    if (coach) {
      updateCoach.mutate(
        { id: coach.id, input: payload },
        {
          onSuccess: () => {
            onSuccess(`${coachFullName(coach)} actualizado correctamente.`)
            onClose()
          },
        },
      )
      return
    }

    createCoach.mutate(payload, {
      onSuccess: () => {
        onSuccess('Entrenador añadido al equipo.')
        onClose()
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={coach ? 'Editar entrenador' : 'Nuevo entrenador'}
      description={
        coach
          ? 'Actualiza los datos del perfil del entrenador.'
          : 'Añade un nuevo miembro al equipo técnico.'
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="coach-form" isLoading={isPending}>
            {coach ? 'Guardar cambios' : 'Crear entrenador'}
          </Button>
        </div>
      }
    >
      <form id="coach-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {isError && <FormError message={getApiErrorMessage(mutationError)} />}

        <FormSection
          icon={UserRound}
          title="Datos del entrenador"
          description="Información de contacto y especialidad principal."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="Laura"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Apellidos"
              placeholder="Gómez"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Especialidad"
              placeholder="Crossfit, Pesas, Zumba…"
              error={errors.specialty?.message}
              {...register('specialty')}
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+34 600 000 000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </FormSection>

        <FormSection
          icon={NotebookPen}
          title="Perfil profesional"
          description="Experiencia y certificaciones que verá el equipo."
        >
          <Textarea
            label="Biografía"
            rows={4}
            placeholder="Experiencia, certificaciones, horarios…"
            {...register('bio')}
          />
        </FormSection>
      </form>
    </Modal>
  )
}
