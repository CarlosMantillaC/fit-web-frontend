import type { Plan } from '@/types/api'

/** Un plan es visible si el backend no marca lo contrario. */
export function isPlanActive(plan: Plan): boolean {
  return plan.is_active !== false
}

/** Precio del plan como número (el API lo envía como string decimal). */
export function planPrice(plan: Plan): number {
  const value = Number(plan.price)
  return Number.isFinite(value) ? value : 0
}

/** Texto legible de la duración (`30 días` → `1 mes`). */
export function planDurationLabel(days: number): string {
  if (days <= 0) return 'Sin duración'
  if (days % 365 === 0) return days === 365 ? '1 año' : `${days / 365} años`
  if (days % 30 === 0) return days === 30 ? '1 mes' : `${days / 30} meses`
  return days === 1 ? '1 día' : `${days} días`
}
