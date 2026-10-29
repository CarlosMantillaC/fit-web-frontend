import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label = 'Cargando…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status">
      <Loader2 className={cn('size-8 animate-spin text-accent', className)} aria-hidden />
      <span className="text-sm text-ink-muted">{label}</span>
    </div>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <Spinner />
    </div>
  )
}
