import type { LucideIcon } from 'lucide-react'
import { type ComponentPropsWithRef, type ReactNode, useId } from 'react'

import { cn } from '@/lib/utils'

interface InputProps extends ComponentPropsWithRef<'input'> {
  label?: string
  error?: string
  hint?: string
  leadingIcon?: LucideIcon
  trailing?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  leadingIcon: LeadingIcon,
  trailing,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="font-label block text-xs font-medium text-ink-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
        )}
        <input
          id={inputId}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            'h-12 w-full rounded-xl border bg-surface-container-low px-3 text-sm text-ink transition-all placeholder:text-ink-muted/50 focus:ring-2 focus:outline-none',
            LeadingIcon && 'pl-10',
            trailing && 'pr-12',
            error
              ? 'border-danger/80 focus:border-danger focus:ring-danger/25'
              : 'border-line-hover hover:border-outline/60 focus:border-accent-strong focus:ring-accent-strong/20',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {trailing && (
          <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error ? (
        <p id={messageId} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-xs text-ink-muted/70">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
