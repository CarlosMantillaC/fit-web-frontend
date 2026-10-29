import { CheckCircle2, XCircle, X } from 'lucide-react'

import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error'

interface ToastProps {
  message: string | null
  variant?: ToastVariant
  onClose?: () => void
}

export function Toast({ message, variant = 'success', onClose }: ToastProps) {
  if (!message) return null

  const Icon = variant === 'success' ? CheckCircle2 : XCircle

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-5 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl px-4 py-3 shadow-2xl',
        variant === 'success'
          ? 'bg-accent-strong text-accent-contrast'
          : 'bg-danger-soft text-danger',
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 text-sm font-semibold">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="grid size-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-black/10"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
