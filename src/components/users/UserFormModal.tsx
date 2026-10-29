import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, UserRound } from 'lucide-react'
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
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { ROLE_OPTIONS } from '@/lib/users'
import type { Role, User, UserInput, UserUpdateInput } from '@/types/api'

const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  email: z.string().trim().min(1, 'El email es obligatorio').email('Email no válido'),
  first_name: z.string().trim().min(1, 'El nombre es obligatorio'),
  last_name: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  role: z.enum(['ADMIN', 'RECEPTIONIST', 'COACH']),
  password: z.string().optional(),
  is_active: z.boolean(),
})

type UserFormValues = z.infer<typeof userSchema>

const EMPTY_VALUES: UserFormValues = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'RECEPTIONIST',
  password: '',
  is_active: true,
}

interface UserFormModalProps {
  open: boolean
  user: User | null
  currentUserId?: number
  onClose: () => void
  onSuccess: (message: string) => void
  onSelfUpdated?: (user: User) => void
}

export function UserFormModal({
  open,
  user,
  currentUserId,
  onClose,
  onSuccess,
  onSelfUpdated,
}: UserFormModalProps) {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!open) return

    reset(
      user
        ? {
            username: user.username,
            email: user.email ?? '',
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            role: user.role ?? 'RECEPTIONIST',
            password: '',
            is_active: user.is_active !== false,
          }
        : EMPTY_VALUES,
    )
  }, [open, user, reset])

  const isPending = createUser.isPending || updateUser.isPending
  const mutationError = createUser.error ?? updateUser.error
  const isError = createUser.isError || updateUser.isError

  function onSubmit(values: UserFormValues) {
    if (!user) {
      const password = values.password?.trim() ?? ''
      if (password.length < 8) {
        setError('password', { message: 'La contraseña debe tener al menos 8 caracteres' })
        return
      }

      const payload: UserInput = {
        username: values.username,
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role as Role,
        password,
      }

      createUser.mutate(payload, {
        onSuccess: () => {
          onSuccess('Usuario creado correctamente.')
          onClose()
        },
      })
      return
    }

    const payload: UserUpdateInput = {
      username: values.username,
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      role: values.role as Role,
      is_active: values.is_active,
    }

    updateUser.mutate(
      { id: user.id, input: payload },
      {
        onSuccess: (updatedUser) => {
          if (user.id === currentUserId) onSelfUpdated?.(updatedUser)
          onSuccess('Usuario actualizado correctamente.')
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
      title={user ? 'Editar usuario' : 'Nuevo usuario'}
      description={
        user
          ? 'Actualiza los datos y permisos del usuario.'
          : 'Crea una cuenta de acceso para el equipo.'
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" isLoading={isPending}>
            {user ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {isError && <FormError message={getApiErrorMessage(mutationError)} />}

        <FormSection
          icon={UserRound}
          title="Datos personales"
          description="Identidad del usuario dentro del equipo."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="Carlos"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Apellidos"
              placeholder="Ruiz"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Usuario"
              autoComplete="off"
              placeholder="carlos.ruiz"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="carlos@fitweb.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
        </FormSection>

        <FormSection
          icon={ShieldCheck}
          title="Acceso y permisos"
          description="El rol determina las secciones a las que puede acceder."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  label="Rol"
                  error={errors.role?.message}
                  options={ROLE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            {user ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/70 bg-surface-container-low p-3 transition-colors hover:border-line-hover">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#ff6b00]"
                  {...register('is_active')}
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">Cuenta activa</span>
                  <span className="block text-xs text-ink-muted">
                    Si se desactiva, el usuario no podrá iniciar sesión.
                  </span>
                </span>
              </label>
            ) : (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                hint="Se almacenará cifrada en el backend."
                error={errors.password?.message}
                {...register('password')}
              />
            )}
          </div>
        </FormSection>
      </form>
    </Modal>
  )
}
