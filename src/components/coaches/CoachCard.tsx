import { Award, Pencil, Phone, Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { coachFullName } from '@/lib/coaches'
import { formatDate } from '@/lib/format'
import type { Coach } from '@/types/api'

interface CoachCardProps {
  coach: Coach
  onEdit: (coach: Coach) => void
  onDelete: (coach: Coach) => void
}

export function CoachCard({ coach, onEdit, onDelete }: CoachCardProps) {
  const fullName = coachFullName(coach)

  return (
    <article className="flex flex-col rounded-xl bg-surface-container p-4 shadow-sm transition-colors hover:bg-surface-container-high">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={fullName} status="online" />
          <div className="min-w-0">
            <h3 className="font-heading truncate text-lg font-bold text-ink">{fullName}</h3>
            <p className="truncate text-sm text-ink-muted">
              {coach.user ? `Usuario #${coach.user}` : 'Entrenador del equipo'}
            </p>
          </div>
        </div>
        <Badge variant="accent">
          <Award className="size-3.5" aria-hidden />
          {coach.specialty}
        </Badge>
      </div>

      <p className="mb-3 line-clamp-3 min-h-15 text-sm text-ink-muted">
        {coach.bio?.trim() || 'Sin biografía registrada.'}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface-container-low p-2.5">
          <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
            Teléfono
          </span>
          {coach.phone ? (
            <a
              href={`tel:${coach.phone}`}
              className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink hover:text-accent"
            >
              <Phone className="size-3.5 shrink-0 text-accent" aria-hidden />
              {coach.phone}
            </a>
          ) : (
            <span className="text-sm text-ink-muted">Sin teléfono</span>
          )}
        </div>
        <div className="rounded-lg bg-surface-container-low p-2.5">
          <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
            En el equipo desde
          </span>
          <span className="text-sm font-semibold text-ink">{formatDate(coach.created_at)}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="text-[11px] text-ink-muted">Actualizado {formatDate(coach.updated_at)}</span>
        <div className="flex items-center gap-2">
          <IconButton
            icon={Pencil}
            label="Editar entrenador"
            className="size-9"
            onClick={() => onEdit(coach)}
          />
          <IconButton
            icon={Trash2}
            label="Desactivar entrenador"
            variant="danger"
            className="size-9"
            onClick={() => onDelete(coach)}
          />
        </div>
      </div>
    </article>
  )
}
