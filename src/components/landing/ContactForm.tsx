import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Ingresa tu nombre'),
  email: z.email('Ingresa un correo electrónico válido'),
  numero: z.string().optional(),
  comment: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

const fieldClass =
  'w-full rounded-xl border border-gray-700 bg-[#252525] p-4 text-base text-white transition-all duration-500 placeholder-gray-400 focus:border-tertiary focus:ring-2 focus:ring-tertiary/70 focus:outline-none'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', numero: '', comment: '' },
  })

  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(false), 4000)
    return () => clearTimeout(timer)
  }, [success])

  async function onSubmit(_values: ContactFormValues) {
    setIsSubmitting(true)
    setSuccess(false)

    // Envío simulado: no hay integración real con ningún servicio.
    await new Promise((resolve) => setTimeout(resolve, 900))

    setIsSubmitting(false)
    setSuccess(true)
    reset()
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <input
          type="text"
          placeholder="Tu Nombre"
          aria-label="Tu nombre"
          className={fieldClass}
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Correo Electrónico"
          aria-label="Correo electrónico"
          className={fieldClass}
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="text"
          placeholder="Número de Teléfono"
          aria-label="Número de teléfono"
          className={fieldClass}
          {...register('numero')}
        />
      </div>

      <div>
        <textarea
          rows={4}
          placeholder="Tu Mensaje"
          aria-label="Tu mensaje"
          className={fieldClass}
          {...register('comment')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus:ring-tertiary/70 relative flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#f36100] to-[#ff7300] py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-[#e05500] hover:to-[#e05500] focus:ring-4 focus:outline-none disabled:pointer-events-none disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            <span>Enviando…</span>
          </>
        ) : (
          <span>Enviar Mensaje</span>
        )}
      </button>

      <p
        role="status"
        aria-live="polite"
        className={`text-center text-sm text-green-400 ${success ? 'block animate-bounce' : 'hidden'}`}
      >
        ¡Mensaje enviado correctamente!
      </p>
    </form>
  )
}
