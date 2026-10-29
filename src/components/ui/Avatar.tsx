import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/format'

type AvatarSize = 'sm' | 'md' | 'lg'

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-9 text-xs',
  md: 'size-14 text-base',
  lg: 'size-16 text-lg',
}

const DOT_COLORS = {
  online: 'bg-accent-strong',
  offline: 'bg-danger',
  warning: 'bg-warning',
} as const

interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  status?: keyof typeof DOT_COLORS
  className?: string
}

export function Avatar({ name, src, size = 'md', status, className }: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-xl bg-surface-container-low object-cover', SIZES[size])}
        />
      ) : (
        <span
          className={cn(
            'font-heading grid place-items-center rounded-xl bg-surface-container-high font-bold text-ink',
            SIZES[size],
          )}
          aria-hidden
        >
          {getInitials(name)}
        </span>
      )}
      {status && (
        <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-surface-container">
          <span className={cn('size-2.5 rounded-full', DOT_COLORS[status])} />
        </span>
      )}
    </div>
  )
}
