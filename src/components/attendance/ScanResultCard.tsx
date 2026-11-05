import { ArrowUpRight, Dumbbell, LogIn, LogOut, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { coachFullName } from '@/lib/coaches'
import { formatTime, memberCode } from '@/lib/format'
import type { ScanResult } from '@/types/api'

interface ScanResultCardProps {
  result: ScanResult
}

export function ScanResultCard({ result }: ScanResultCardProps) {
  const isMember = result.type === 'member'
  const name = isMember ? result.person.full_name : coachFullName(result.person)
  const subtitle = isMember
    ? result.person.email
    : result.person.specialty
  const code = isMember ? memberCode(result.person.id) : result.person.qr_code
  const profileLink = isMember
    ? `/app/members/${result.person.id}`
    : `/app/coaches/${result.person.id}`
  const isCheckIn = result.action === 'check-in'
  const time = isCheckIn
    ? result.attendance.check_in
    : result.attendance.check_out

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-container-low p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={name} status="online" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{name}</p>
            <p className="truncate text-xs text-ink-muted">{subtitle}</p>
            <p className="font-label mt-0.5 text-[10px] font-semibold tracking-wider text-accent uppercase">
              {code} · {isMember ? 'Cliente' : 'Entrenador'}
            </p>
          </div>
        </div>
        <Badge variant={isCheckIn ? 'active' : 'neutral'}>
          {isCheckIn ? (
            <LogIn className="size-3.5" aria-hidden />
          ) : (
            <LogOut className="size-3.5" aria-hidden />
          )}
          {isCheckIn ? 'Entrada' : 'Salida'}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
        <span className="text-xs text-ink-muted">
          {isCheckIn ? 'Entrada' : 'Salida'} registrada a las{' '}
          <strong className="text-ink">{formatTime(time)}</strong>
        </span>
        <Link
          to={profileLink}
          className="font-label inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
        >
          {isMember ? <UserRound className="size-3.5" aria-hidden /> : <Dumbbell className="size-3.5" aria-hidden />}
          Ver ficha
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
