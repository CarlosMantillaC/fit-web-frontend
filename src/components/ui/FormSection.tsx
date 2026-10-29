import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn('rounded-xl border border-line/70 bg-surface-container-low/60 p-4', className)}>
      <div className="mb-4 flex items-start gap-2.5">
        {Icon && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
            <Icon className="size-4" aria-hidden />
          </span>
        )}
        <div>
          <h3 className="font-heading text-sm font-bold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}
