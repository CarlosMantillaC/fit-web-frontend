import type { LucideIcon } from 'lucide-react'
import type { ComponentPropsWithRef } from 'react'

import { cn } from '@/lib/utils'

type IconButtonVariant = 'surface' | 'ghost' | 'danger' | 'primary'

const VARIANTS: Record<IconButtonVariant, string> = {
  surface:
    'bg-surface-container-low text-ink-muted hover:bg-surface-container hover:text-accent',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-container hover:text-ink',
  danger: 'bg-surface-container-low text-ink-muted hover:bg-danger-soft/50 hover:text-danger',
  primary: 'bg-accent-strong text-accent-contrast hover:bg-accent-strong/90',
}

interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  icon: LucideIcon
  label: string
  variant?: IconButtonVariant
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'surface',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-11 shrink-0 place-items-center rounded-xl transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      <Icon className="size-5" aria-hidden />
    </button>
  )
}
