import type { BadgeVariant } from '@/components/ui/Badge'
import type { Membership, MembershipStatus } from '@/types/api'
import { daysUntil } from '@/lib/format'

export const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, string> = {
  ACTIVE: 'Activa',
  EXPIRED: 'Vencida',
  CANCELLED: 'Cancelada',
}

export const MEMBERSHIP_STATUS_BADGE: Record<MembershipStatus, BadgeVariant> = {
  ACTIVE: 'active',
  EXPIRED: 'warning',
  CANCELLED: 'neutral',
}

export const MEMBERSHIP_STATUS_OPTIONS: { value: MembershipStatus; label: string }[] = [
  { value: 'ACTIVE', label: MEMBERSHIP_STATUS_LABEL.ACTIVE },
  { value: 'EXPIRED', label: MEMBERSHIP_STATUS_LABEL.EXPIRED },
  { value: 'CANCELLED', label: MEMBERSHIP_STATUS_LABEL.CANCELLED },
]

/**
 * Agrupa las membresías por cliente y se queda con la más relevante:
 * primero las vigentes y, entre ellas, la que vence más tarde.
 */
export function pickLatestMemberships(memberships: Membership[]): Map<number, Membership> {
  const result = new Map<number, Membership>()

  for (const membership of memberships) {
    const current = result.get(membership.member)
    if (!current) {
      result.set(membership.member, membership)
      continue
    }

    const currentEnd = new Date(current.end_date).getTime()
    const nextEnd = new Date(membership.end_date).getTime()

    const isBetter =
      (membership.is_valid && !current.is_valid) ||
      (membership.is_valid === current.is_valid && nextEnd > currentEnd)

    if (isBetter) result.set(membership.member, membership)
  }

  return result
}

/** Texto corto con el plan de la membresía (`Sin membresía` si no hay). */
export function membershipName(membership?: Membership): string {
  return membership?.plan_details?.name ?? 'Sin membresía'
}

/** Indica si una membresía activa vence dentro de los próximos días. */
export function isExpiringSoon(membership: Membership, withinDays = 7): boolean {
  if (membership.status !== 'ACTIVE') return false
  const remaining = daysUntil(membership.end_date)
  return remaining !== null && remaining >= 0 && remaining <= withinDays
}

/** Estado visual de una membresía (distingue vigente, por vencer, vencida y cancelada). */
export function membershipBadgeLabel(membership: Membership): string {
  if (membership.status === 'CANCELLED') return MEMBERSHIP_STATUS_LABEL.CANCELLED
  if (membership.is_valid) {
    return isExpiringSoon(membership) ? 'Por vencer' : MEMBERSHIP_STATUS_LABEL.ACTIVE
  }
  return MEMBERSHIP_STATUS_LABEL.EXPIRED
}

export function membershipBadgeVariant(membership: Membership): BadgeVariant {
  if (membership.status === 'CANCELLED') return 'neutral'
  if (membership.is_valid) return isExpiringSoon(membership) ? 'warning' : 'active'
  return 'danger'
}
