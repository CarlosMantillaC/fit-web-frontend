import { zodResolver } from '@hookform/resolvers/zod'
import { UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { FormSection } from '@/components/ui/FormSection'
import { Input } from '@/components/ui/Input'
import { useUpdateMe } from '@/hooks/useMe'
import type { UpdateMeInput, User } from '@/types/api'

const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'El nombre es obligatorio'),
  last_name: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  username: z.string().trim().min(3, 'Mínimo 3 caracteres').max(150, 'Máximo 150 caracteres'),
  email: z.string().trim().min(1, 'El email es obligatorio').email('Email no válido'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface EditProfileFormProps {
  user: User
  /** Se invoca con el usuario actualizado cuando el guardado tiene éxito. */
  onUpdated: (user: User) => void
  /** Notificación de feedback (mensaje de éxito). */
  onSuccess: (message: string) => void
  /** Acción del botón secundario (cancelar / volver). */
  onCancel: () => void
}

export function EditProfileForm({ user, onUpdated, onSuccess, onCancel }: EditProfileFormProps) {
  const updateMe = useUpdateMe()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
    },
  })

  // Sincroniza el formulario con los datos del usuario.
  useEffect(() => {
    reset({
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      username: user.username,
      email: user.email ?? '',
    })
  }, [user, reset])

  function onSubmit(values: ProfileFormValues) {
    const payload: UpdateMeInput = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
    }

    updateMe.mutate(payload, {
      onSuccess: (updatedUser) => {
        onUpdated(updatedUser)
        onSuccess('Perfil actualizado correctamente.')
      },
    })
  }

  const isPending = updateMe.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {updateMe.isError && <FormError message={getApiErrorMessage(updateMe.error)} />}

      <FormSection
        icon={UserRound}
        title="Datos personales"
        description="Identidad que se mostrará en tu cuenta y en el panel."
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

      <p className="text-ink-muted text-xs">
        El rol y el estado de la cuenta los gestiona el administrador desde el panel de usuarios. El
        cambio de contraseña no está disponible desde aquí.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
