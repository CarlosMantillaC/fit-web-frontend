import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'active'
  | 'inactive'
  | 'warning'
  | 'neutral'
  | 'accent'
  | 'danger'

const VARIANTS: Record<BadgeVariant, string> = {
  active: 'bg-accent-strong/15 text-accent',
  inactive: 'bg-danger-soft/40 text-danger',
  warning: 'bg-warning/15 text-warning',
  neutral: 'bg-surface-container-low text-ink-muted',
  accent: 'bg-accent-strong text-accent-contrast',
  danger: 'bg-danger-soft text-danger',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'font-label inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
