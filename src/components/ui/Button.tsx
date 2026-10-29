import type { ComponentPropsWithRef } from 'react'

import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-strong text-accent-contrast shadow-[0_2px_10px_rgba(255,107,0,0.28)] hover:bg-accent-strong/90 focus-visible:outline-accent-strong',
  secondary:
    'border border-line bg-surface-high text-ink hover:bg-surface-bright focus-visible:outline-line-hover',
  outline:
    'border border-line bg-transparent text-ink hover:border-line-hover hover:bg-surface-container focus-visible:outline-line-hover',
  ghost:
    'bg-transparent text-ink-muted hover:bg-surface-container hover:text-ink focus-visible:outline-line-hover',
  danger:
    'border border-danger-soft/60 bg-danger-soft/30 text-danger hover:bg-danger-soft/50 focus-visible:outline-danger',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-11 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-sm',
}

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'font-label inline-flex items-center justify-center font-semibold tracking-wide transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
