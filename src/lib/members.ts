import type { BadgeVariant } from '@/components/ui/Badge'
import type { Gender, MemberStatus } from '@/types/api'

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
}

export const MEMBER_STATUS_BADGE: Record<MemberStatus, BadgeVariant> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'warning',
}

export const MEMBER_STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: 'ACTIVE', label: MEMBER_STATUS_LABEL.ACTIVE },
  { value: 'INACTIVE', label: MEMBER_STATUS_LABEL.INACTIVE },
  { value: 'SUSPENDED', label: MEMBER_STATUS_LABEL.SUSPENDED },
]

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Masculino',
  FEMALE: 'Femenino',
  OTHER: 'Otro',
  '': 'Sin especificar',
}

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: '', label: GENDER_LABEL[''] },
  { value: 'MALE', label: GENDER_LABEL.MALE },
  { value: 'FEMALE', label: GENDER_LABEL.FEMALE },
  { value: 'OTHER', label: GENDER_LABEL.OTHER },
]
