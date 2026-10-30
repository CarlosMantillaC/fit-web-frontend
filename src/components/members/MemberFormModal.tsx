import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { useCreateMember, useUpdateMember } from '@/hooks/useMembers'
import { GENDER_OPTIONS, MEMBER_STATUS_OPTIONS } from '@/lib/members'
import type { Member, MemberInput } from '@/types/api'

const memberSchema = z.object({
  first_name: z.string().trim().min(1, 'El nombre es obligatorio'),
  last_name: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  email: z.string().trim().min(1, 'El email es obligatorio').email('Email no válido'),
  phone: z.string().trim().max(20, 'Máximo 20 caracteres').optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['', 'MALE', 'FEMALE', 'OTHER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
})

type MemberFormValues = z.infer<typeof memberSchema>

const EMPTY_VALUES: MemberFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  status: 'ACTIVE',
}

interface MemberFormModalProps {
  open: boolean
  member: Member | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export function MemberFormModal({ open, member, onClose, onSuccess }: MemberFormModalProps) {
  const createMember = useCreateMember()
  const updateMember = useUpdateMember()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      member
        ? {
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone ?? '',
            date_of_birth: member.date_of_birth ?? '',
            gender: member.gender ?? '',
            status: member.status,
          }
        : EMPTY_VALUES,
    )
  }, [open, member, reset])

  const isPending = createMember.isPending || updateMember.isPending
  const mutationError = createMember.error ?? updateMember.error
  const isError = createMember.isError || updateMember.isError

  function onSubmit(values: MemberFormValues) {
    const payload: MemberInput = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || undefined,
      date_of_birth: values.date_of_birth || undefined,
      gender: values.gender,
      status: values.status,
    }

    if (member) {
      updateMember.mutate(
        { id: member.id, input: payload },
        {
          onSuccess: () => {
            onSuccess(`${member.full_name} actualizado correctamente.`)
            onClose()
          },
        },
      )
      return
    }

    createMember.mutate(payload, {
      onSuccess: () => {
        onSuccess('Cliente añadido al directorio.')
        onClose()
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={member ? 'Editar cliente' : 'Nuevo cliente'}
      description={
        member
          ? 'Actualiza los datos del expediente del cliente.'
          : 'Registra un nuevo cliente en el directorio.'
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="member-form" isLoading={isPending}>
            {member ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </div>
      }
    >
      <form id="member-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {isError && <FormError message={getApiErrorMessage(mutationError)} />}

        <FormSection
          icon={UserRound}
          title="Datos personales"
          description="Información básica y datos de contacto del cliente."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="Alejandro"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Apellidos"
              placeholder="Morales"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="cliente@ejemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+34 600 000 000"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Fecha de nacimiento"
              type="date"
              error={errors.date_of_birth?.message}
              {...register('date_of_birth')}
            />
          </div>
        </FormSection>

        <FormSection
          icon={BadgeCheck}
          title="Clasificación"
          description="Estos datos ayudan a segmentar y dar seguimiento al cliente."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  label="Género"
                  error={errors.gender?.message}
                  options={GENDER_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Estado"
                  error={errors.status?.message}
                  options={MEMBER_STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </FormSection>
      </form>
    </Modal>
  )
}
