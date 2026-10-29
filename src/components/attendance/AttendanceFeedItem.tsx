import { LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatTime, memberCode } from '@/lib/format'
import { membershipName } from '@/lib/memberships'
import type { Attendance, Membership } from '@/types/api'
import { cn } from '@/lib/utils'

interface AttendanceFeedItemProps {
  attendance: Attendance
  membership?: Membership
  onCheckOut: (attendance: Attendance) => void
  isCheckingOut: boolean
}

export function AttendanceFeedItem({
  attendance,
  membership,
  onCheckOut,
  isCheckingOut,
}: AttendanceFeedItemProps) {
  const member = attendance.member_details
  const isInside = !attendance.check_out
  const hasWarning = Boolean(membership && !membership.is_valid)
  const profileUrl = `/app/members?q=${encodeURIComponent(member.full_name)}`

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg p-3 transition-colors sm:flex-row sm:items-center sm:justify-between',
        hasWarning
          ? 'bg-danger-soft/15 hover:bg-danger-soft/25'
          : 'bg-surface-container-low hover:bg-surface-container-high',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          name={member.full_name}
          size="md"
          status={isInside ? 'online' : 'offline'}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-bold text-ink">{member.full_name}</span>
            <Badge variant={isInside ? 'active' : 'neutral'}>
              {isInside ? 'En sala' : 'Finalizado'}
            </Badge>
            {hasWarning && <Badge variant="danger">Membresía vencida</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
            <span>{membership ? membershipName(membership) : 'Sin membresía'}</span>
            <span>•</span>
            <span>{memberCode(member.id)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-right">
          <span className="font-label block text-sm font-bold text-ink">
            Entrada {formatTime(attendance.check_in)}
          </span>
          <span className="block text-[11px] text-ink-muted">
            {attendance.check_out ? `Salida ${formatTime(attendance.check_out)}` : 'Sin salida'}
          </span>
        </div>

        {isInside ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onCheckOut(attendance)}
            isLoading={isCheckingOut}
          >
            <LogOut className="size-4" aria-hidden />
            Salida
          </Button>
        ) : (
          <Link
            to={profileUrl}
            className="font-label inline-flex h-9 items-center rounded-lg bg-surface-container-high px-3 text-xs font-semibold text-ink transition-colors hover:bg-surface-bright"
          >
            Ver ficha
          </Link>
        )}
      </div>
    </div>
  )
}
