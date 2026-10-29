import { type ComponentPropsWithRef, useId } from 'react'

import { cn } from '@/lib/utils'

interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const messageId = `${textareaId}-message`

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="font-label block text-xs font-medium text-ink-muted"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        aria-describedby={error || hint ? messageId : undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full resize-none rounded-xl border bg-surface-container-low px-3 py-2.5 text-sm text-ink transition-all placeholder:text-ink-muted/50 focus:ring-2 focus:outline-none',
          error
            ? 'border-danger/80 focus:border-danger focus:ring-danger/25'
            : 'border-line-hover hover:border-outline/60 focus:border-accent-strong focus:ring-accent-strong/20',
          className,
        )}
        {...props}
      />
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
