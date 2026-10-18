import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { getApiErrorMessage } from '@/api/client'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'

const loginSchema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const inputClassName =
  'w-full rounded-lg border border-gray-600 bg-[#252525] p-4 font-light text-white transition-all duration-500 focus:border-[#f36100] focus:ring focus:ring-[#f36100]/80 focus:outline-none'

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
    <div className="font-display">
      <section className="flex min-h-screen items-center bg-black py-6 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-lg border border-[#2D2D2D] bg-[#151515] shadow-2xl md:my-12">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-5/12">
                <img
                  src="/img/hero/hero8c.webp"
                  alt="Entrenamiento en FitWeb"
                  className="h-56 w-full rounded-t-lg object-cover md:h-full md:rounded-l-lg md:rounded-tr-none"
                />
              </div>

              <div className="w-full p-8 md:w-7/12">
                <div className="mb-6 text-center">
                  <Link to="/" aria-label="FitWeb — Inicio" className="mx-auto block w-1/2 lg:w-1/3">
                    <img
                      src="/img/logotipo.png"
                      alt="FitWeb"
                      className="w-full transition-all duration-500 hover:-translate-y-1 hover:scale-110"
                    />
                  </Link>
                </div>

                {mutation.isError && (
                  <div className="mb-4 rounded-lg bg-red-500 p-4 text-white" role="alert">
                    {getApiErrorMessage(mutation.error)}
                  </div>
                )}

                <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
                  <p className="mt-3 mb-6 text-center text-xl font-bold text-[#f36100]">
                    INICIA SESIÓN EN TU CUENTA
                  </p>

                  <div className="mb-4">
                    <label htmlFor="username" className="sr-only">
                      Usuario
                    </label>
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Usuario"
                      className={inputClassName}
                      {...register('username')}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="password" className="sr-only">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Contraseña"
                        className={`${inputClassName} pr-14`}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-white transition-colors hover:text-[#f36100]"
                      >
                        {showPassword ? (
                          <EyeOff className="size-6" aria-hidden />
                        ) : (
                          <Eye className="size-6" aria-hidden />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="mb-4 w-full cursor-pointer rounded-lg bg-[#f36100] py-3 font-bold text-white transition-all duration-300 hover:bg-[#ff6a00] hover:text-[#151515] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {mutation.isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
                  </button>

                  <Link
                    to="/"
                    className="block w-full rounded-lg border border-gray-500 py-3 text-center text-gray-300 transition-all duration-300 hover:border-[#f36100] hover:text-[#f36100] active:scale-95"
                  >
                    Regresar al Inicio
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
