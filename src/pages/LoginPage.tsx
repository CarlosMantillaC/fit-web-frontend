import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  Dumbbell,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'

const loginSchema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const FEATURES = [
  'Clientes, planes y pagos en un solo panel.',
  'Control de membresías y renovaciones.',
  'Seguimiento de asistencia en tiempo real.',
]

export function LoginPage() {
  usePageTitle('FitWeb Login', 'Inicia sesión en tu cuenta de FitWeb.')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/app'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => navigate(from, { replace: true }),
  })

  return (
    <div>
      <section className="relative flex min-h-screen items-center overflow-hidden bg-surface-lowest py-10">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 size-96 rounded-full bg-accent-strong/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-24 size-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-4">
          <div className="grid overflow-hidden rounded-2xl border border-line bg-surface-container shadow-2xl lg:grid-cols-[1.05fr_1fr]">
            <div className="relative hidden min-h-[580px] lg:block">
              <img
                src="/img/hero/hero8c.webp"
                alt="Entrenamiento en FitWeb"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />
              <div className="relative flex h-full flex-col justify-between p-8">
                <Link to="/" className="flex items-center gap-2.5" aria-label="FitWeb — Inicio">
                  <span className="grid size-10 place-items-center rounded-xl bg-accent-strong text-accent-contrast">
                    <Dumbbell className="size-5" aria-hidden />
                  </span>
                  <span className="font-display text-2xl font-bold tracking-wide text-white uppercase">
                    FitWeb
                  </span>
                </Link>

                <div>
                  <p className="font-label text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
                    Panel de gestión
                  </p>
                  <h1 className="font-display mt-2 max-w-sm text-4xl leading-[0.95] tracking-wide text-white uppercase">
                    Entrena. Gestiona. Crece.
                  </h1>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                    Todo lo que tu estudio necesita para operar cada día con claridad y control.
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                        <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-10">
              <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-strong text-accent-contrast">
                  <Dumbbell className="size-5" aria-hidden />
                </span>
                <span className="font-display text-2xl font-bold tracking-wide text-ink uppercase">
                  FitWeb
                </span>
              </div>

              <p className="font-label text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
                Acceso al panel
              </p>
              <h2 className="font-heading mt-1 text-2xl font-bold text-ink">
                Bienvenido de nuevo
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Ingresa tus credenciales para gestionar el estudio.
              </p>

              <form
                onSubmit={handleSubmit((values) => mutation.mutate(values))}
                noValidate
                className="mt-8 space-y-5"
              >
                {mutation.isError && <FormError message={getApiErrorMessage(mutation.error)} />}

                <Input
                  label="Usuario"
                  type="text"
                  autoComplete="username"
                  placeholder="admin"
                  leadingIcon={UserRound}
                  error={errors.username?.message}
                  {...register('username')}
                />

                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  leadingIcon={LockKeyhole}
                  error={errors.password?.message}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-container-high hover:text-accent"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  }
                  {...register('password')}
                />

                <Button type="submit" size="lg" isLoading={mutation.isPending} className="w-full">
                  Iniciar sesión
                </Button>

                <Link
                  to="/"
                  className="font-label flex items-center justify-center gap-2 text-sm text-ink-muted transition-colors hover:text-accent"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Volver al inicio
                </Link>
              </form>

              <p className="mt-8 text-center text-xs text-ink-muted/70">
                Acceso restringido al personal autorizado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
