import type { Coach } from '@/types/api'

/** Nombre completo del entrenador. */
export function coachFullName(coach: Pick<Coach, 'first_name' | 'last_name'>): string {
  return `${coach.first_name} ${coach.last_name}`.trim()
}
