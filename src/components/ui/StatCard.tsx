import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  trend?: string
  icon: LucideIcon
  progress?: number
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon: Icon,
  progress,
  className,
}: StatCardProps) {
  const clampedProgress =
    progress === undefined ? undefined : Math.max(0, Math.min(100, progress))

  return (
    <div
      className={cn(
        'relative flex items-center justify-between overflow-hidden rounded-xl bg-surface-container p-4 shadow-sm',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <span className="font-label block text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl leading-none font-extrabold text-ink">
            {value}
          </span>
          {trend && (
            <span className="font-label flex items-center gap-0.5 text-[11px] font-bold text-accent">
              {trend}
            </span>
          )}
        </div>
        {hint && <span className="block text-xs text-ink-muted">{hint}</span>}
      </div>

      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-container-high text-accent">
        <Icon className="size-6" aria-hidden />
      </div>

      {clampedProgress !== undefined && (
        <div className="absolute right-0 bottom-0 left-0 h-1 bg-surface-lowest">
          <div className="h-full bg-accent-strong" style={{ width: `${clampedProgress}%` }} />
        </div>
      )}
    </div>
  )
}
