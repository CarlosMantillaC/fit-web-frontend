import { BadgeCheck, Pencil, Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { formatDate, memberCode } from '@/lib/format'
import { GENDER_LABEL, MEMBER_STATUS_BADGE, MEMBER_STATUS_LABEL } from '@/lib/members'
import type { Member } from '@/types/api'

interface MemberCardProps {
  member: Member
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const isActive = member.status === 'ACTIVE'
  const avatarStatus = isActive
    ? 'online'
    : member.status === 'SUSPENDED'
      ? 'warning'
      : 'offline'

  return (
    <article className="flex flex-col justify-between rounded-xl bg-surface-container p-4 shadow-sm transition-colors hover:bg-surface-container-high">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              name={member.full_name}
              status={avatarStatus}
              className={isActive ? undefined : 'opacity-75 grayscale'}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading truncate text-lg font-bold text-ink">
                  {member.full_name}
                </h3>
                {isActive && (
                  <BadgeCheck
                    className="size-4 shrink-0 text-accent"
                    aria-label="Cliente activo"
                  />
                )}
              </div>
              <p className="truncate text-sm text-ink-muted">{member.email}</p>
              <span className="font-label text-[11px] font-semibold tracking-wider text-secondary uppercase">
                ID: {memberCode(member.id)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={MEMBER_STATUS_BADGE[member.status]}>
              {MEMBER_STATUS_LABEL[member.status]}
            </Badge>
            <span className="font-label rounded-lg bg-surface-container-low px-2 py-0.5 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
              {GENDER_LABEL[member.gender ?? '']}
            </span>
          </div>
        </div>

        <div className="my-3 grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-3">
          <div>
            <span className="font-label block text-[11px] text-ink-muted">Alta</span>
            <span className="text-sm font-semibold text-ink">{formatDate(member.created_at)}</span>
          </div>
          <div>
            <span className="font-label block text-[11px] text-ink-muted">Actualizado</span>
            <span className="text-sm font-semibold text-ink">
              {formatDate(member.updated_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <IconButton icon={Pencil} label="Editar cliente" onClick={() => onEdit(member)} />
          <IconButton
            icon={Trash2}
            label="Desactivar cliente"
            variant="danger"
            onClick={() => onDelete(member)}
          />
        </div>
        <Button
          variant="secondary"
          className="flex-1 sm:max-w-[200px]"
          onClick={() => onEdit(member)}
        >
          Ver expediente
        </Button>
      </div>
    </article>
  )
}
