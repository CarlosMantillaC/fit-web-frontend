import { Users } from 'lucide-react'

import { formatNumber } from '@/lib/format'

interface OccupancyCardProps {
  inside: number
  entries: number
  exits: number
  capacity?: number
}

export function OccupancyCard({ inside, entries, exits, capacity = 200 }: OccupancyCardProps) {
  const percentage = capacity > 0 ? Math.min(100, Math.round((inside / capacity) * 100)) : 0

  const status =
    percentage < 50 ? 'Afluencia óptima' : percentage < 80 ? 'Afluencia moderada' : 'Alta afluencia'

  const statusVariant =
    percentage < 50 ? 'active' : percentage < 80 ? 'warning' : 'danger'

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface-container p-4 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Users className="size-5 text-accent" aria-hidden />
          <span className="font-label text-[11px] font-bold tracking-wider text-ink-muted uppercase">
            Aforo actual de sala
          </span>
        </div>
        <span
          className={
            statusVariant === 'active'
              ? 'rounded-full bg-accent-strong/20 px-2 py-0.5 text-[11px] font-bold text-accent'
              : statusVariant === 'warning'
                ? 'rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-warning'
                : 'rounded-full bg-danger-soft/40 px-2 py-0.5 text-[11px] font-bold text-danger'
          }
        >
          {status}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-4xl leading-none font-extrabold text-ink">
            {formatNumber(inside)}
          </span>
          <span className="text-sm text-ink-muted">/ {formatNumber(capacity)} personas</span>
        </div>
        <span className="font-heading text-xl font-bold text-accent">{percentage}%</span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-lowest p-0.5">
        <div
          className="h-full rounded-full bg-accent-strong shadow-[0_0_10px_#ff6b00] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-surface-container-low p-2 text-center">
          <span className="block text-[11px] text-ink-muted">En sala</span>
          <span className="font-label text-sm font-bold text-ink">{formatNumber(inside)}</span>
        </div>
        <div className="rounded-lg bg-surface-container-low p-2 text-center">
          <span className="block text-[11px] text-ink-muted">Entradas hoy</span>
          <span className="font-label text-sm font-bold text-ink">{formatNumber(entries)}</span>
        </div>
        <div className="rounded-lg bg-surface-container-low p-2 text-center">
          <span className="block text-[11px] text-ink-muted">Salidas hoy</span>
          <span className="font-label text-sm font-bold text-ink">{formatNumber(exits)}</span>
        </div>
      </div>
    </div>
  )
}
