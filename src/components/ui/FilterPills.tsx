import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

export interface FilterOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface FilterPillsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  return (
    <div className={cn('flex items-center gap-1.5 overflow-x-auto pb-1', className)}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              'font-label flex h-11 items-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap transition-all active:scale-95',
              isActive
                ? 'bg-accent-strong font-bold text-accent-contrast shadow-sm'
                : 'bg-surface-container-high text-ink-muted hover:text-ink',
            )}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={cn(
                  'font-label rounded-lg px-1.5 py-0.5 text-[11px] font-bold',
                  isActive
                    ? 'bg-surface-lowest text-accent'
                    : 'bg-surface-low text-ink',
                )}
              >
                {formatNumber(option.count)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
