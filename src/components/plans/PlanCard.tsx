import { CalendarClock, Pencil, ScrollText, Trash2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { formatCurrency, formatDate } from '@/lib/format'
import { isPlanActive, planDurationLabel, planPrice } from '@/lib/plans'
import type { Plan } from '@/types/api'

interface PlanCardProps {
  plan: Plan
  subscriptions: number
  canManage: boolean
  onEdit: (plan: Plan) => void
  onDelete: (plan: Plan) => void
}

export function PlanCard({ plan, subscriptions, canManage, onEdit, onDelete }: PlanCardProps) {
  const active = isPlanActive(plan)
  const price = planPrice(plan)
  const dailyPrice = plan.duration_days > 0 ? price / plan.duration_days : 0

  return (
    <article className="flex flex-col rounded-xl bg-surface-container p-4 shadow-sm transition-colors hover:bg-surface-container-high">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-container-high text-accent">
            <ScrollText className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading truncate text-lg font-bold text-ink">{plan.name}</h3>
            <p className="font-label text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
              {planDurationLabel(plan.duration_days)}
            </p>
          </div>
        </div>
        <Badge variant={active ? 'active' : 'neutral'}>{active ? 'Activo' : 'Inactivo'}</Badge>
      </div>

      <p className="mb-3 line-clamp-2 min-h-10 text-sm text-ink-muted">
        {plan.description?.trim() || 'Sin descripción añadida.'}
      </p>

      <div className="mb-3 flex items-end justify-between gap-2 rounded-lg bg-surface-container-low p-3">
        <div>
          <span className="font-heading block text-2xl leading-none font-extrabold text-ink">
            {formatCurrency(price)}
          </span>
          <span className="text-[11px] text-ink-muted">por {planDurationLabel(plan.duration_days)}</span>
        </div>
        <span className="font-label rounded-lg bg-surface-container-high px-2 py-1 text-[11px] font-semibold text-accent">
          {formatCurrency(dailyPrice)} / día
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5">
          <CalendarClock className="size-4 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0">
            <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
              Duración
            </span>
            <span className="block truncate text-sm font-semibold text-ink">
              {planDurationLabel(plan.duration_days)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5">
          <Users className="size-4 shrink-0 text-accent" aria-hidden />
          <div className="min-w-0">
            <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
              Suscripciones
            </span>
            <span className="block truncate text-sm font-semibold text-ink">
              {subscriptions}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="text-[11px] text-ink-muted">Actualizado {formatDate(plan.updated_at)}</span>
        {canManage ? (
          <div className="flex items-center gap-2">
            <IconButton
              icon={Pencil}
              label="Editar plan"
              className="size-9"
              onClick={() => onEdit(plan)}
            />
            <IconButton
              icon={Trash2}
              label="Eliminar plan"
              variant="danger"
              className="size-9"
              onClick={() => onDelete(plan)}
            />
          </div>
        ) : (
          <Badge variant="neutral">Solo lectura</Badge>
        )}
      </div>
    </article>
  )
}
