import {
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  History,
  LogIn,
  LogOut,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatDateTime, formatTime, memberCode } from '@/lib/format'
import { GENDER_LABEL, MEMBER_STATUS_BADGE, MEMBER_STATUS_LABEL } from '@/lib/members'
import { membershipName } from '@/lib/memberships'
import type { Attendance, Member, Membership } from '@/types/api'

interface MemberCheckInCardProps {
  member: Member
  membership?: Membership
  openAttendance: Attendance | null
  lastAttendance?: Attendance
  isSubmitting: boolean
  onCheckIn: () => void
  onCheckOut: () => void
  onClear: () => void
}

export function MemberCheckInCard({
  member,
  membership,
  openAttendance,
  lastAttendance,
  isSubmitting,
  onCheckIn,
  onCheckOut,
  onClear,
}: MemberCheckInCardProps) {
  const isActive = member.status === 'ACTIVE'
  const hasValidMembership = membership?.is_valid ?? false
  const memberProfileUrl = `/app/members?q=${encodeURIComponent(member.full_name)}`

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl bg-surface-container p-4 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isActive ? 'active' : 'inactive'}>
            <BadgeCheck className="size-3.5" aria-hidden />
            {isActive ? 'Socio verificado' : 'Cliente inactivo'}
          </Badge>
          <Badge variant="neutral">{memberCode(member.id)}</Badge>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpiar selección"
          className="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-container-high hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex items-start gap-4">
        <Avatar
          name={member.full_name}
          size="lg"
          status={isActive ? 'online' : 'offline'}
          className={isActive ? undefined : 'grayscale'}
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading truncate text-xl font-bold text-ink">{member.full_name}</h2>
          <p className="truncate text-sm font-semibold text-accent">
            {membership ? membershipName(membership) : 'Sin membresía activa'}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={
                hasValidMembership
                  ? 'size-2 rounded-full bg-accent-strong'
                  : 'size-2 rounded-full bg-danger'
              }
            />
            <span className="text-xs text-ink-muted">
              {membership
                ? hasValidMembership
                  ? `Válida hasta ${formatDate(membership.end_date)}`
                  : `Venció el ${formatDate(membership.end_date)}`
                : 'Sin plan asignado'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
            <History className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <span className="font-label block text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
              Última visita
            </span>
            <span className="block truncate text-sm font-bold text-ink">
              {lastAttendance ? formatDateTime(lastAttendance.check_in) : 'Sin registros'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
            <LogIn className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <span className="font-label block text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
              Estado actual
            </span>
            <span className="block truncate text-sm font-bold text-ink">
              {openAttendance ? `En sala · ${formatTime(openAttendance.check_in)}` : 'Fuera de sala'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={MEMBER_STATUS_BADGE[member.status]}>
          Estado: {MEMBER_STATUS_LABEL[member.status]}
        </Badge>
        <Badge variant="neutral">Género: {GENDER_LABEL[member.gender ?? '']}</Badge>
        <Badge variant={hasValidMembership ? 'active' : 'danger'}>
          {hasValidMembership ? 'Membresía vigente' : 'Membresía no vigente'}
        </Badge>
      </div>

      {!isActive && (
        <div className="flex items-start gap-2 rounded-xl border border-danger-soft/60 bg-danger-soft/25 px-3 py-2.5 text-sm text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>No se puede registrar entrada: el cliente está inactivo.</span>
        </div>
      )}

      {isActive && !hasValidMembership && (
        <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Este cliente no tiene una membresía vigente. Revisa el pago antes de permitir el acceso.</span>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-1">
        {openAttendance ? (
          <Button
            size="lg"
            onClick={onCheckOut}
            isLoading={isSubmitting}
            className="h-14 text-base tracking-wider uppercase"
          >
            <LogOut className="size-6" aria-hidden />
            Registrar salida
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onCheckIn}
            isLoading={isSubmitting}
            disabled={!isActive}
            className="h-14 text-base tracking-wider uppercase"
          >
            <LogIn className="size-6" aria-hidden />
            Confirmar entrada
          </Button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={memberProfileUrl}
            className="font-label inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-container-high text-sm font-semibold text-ink transition-colors hover:bg-surface-bright"
          >
            <ExternalLink className="size-4" aria-hidden />
            Ver expediente
          </Link>
          <Button variant="secondary" onClick={onClear}>
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  )
}
