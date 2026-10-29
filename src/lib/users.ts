import type { BadgeVariant } from '@/components/ui/Badge'
import type { Role, User } from '@/types/api'

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  RECEPTIONIST: 'Recepción',
  COACH: 'Entrenador',
}

export const ROLE_BADGE: Record<Role, BadgeVariant> = {
  ADMIN: 'accent',
  RECEPTIONIST: 'active',
  COACH: 'neutral',
}

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: ROLE_LABEL.ADMIN },
  { value: 'RECEPTIONIST', label: ROLE_LABEL.RECEPTIONIST },
  { value: 'COACH', label: ROLE_LABEL.COACH },
]

/** Nombre visible del usuario (nombre completo o username). */
export function userDisplayName(user: User): string {
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
  return fullName || user.username
}

export function userRoleLabel(user: User): string {
  return user.role ? ROLE_LABEL[user.role] : 'Sin rol'
}
