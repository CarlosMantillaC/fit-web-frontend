const numberFormat = new Intl.NumberFormat('es-ES')

const currencyFormat = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormat = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const timeFormat = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const clockFormat = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const weekdayFormat = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })

/** Formatea un número con separadores de miles en español. */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/** Formatea un importe monetario en euros. */
export function formatCurrency(value: number): string {
  return currencyFormat.format(value)
}

/** Formatea una fecha ISO como `dd MMM yyyy`. */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date)
}

/** Formatea una fecha ISO con hora. */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date)
}

/** Formatea una hora ISO como `HH:mm`. */
export function formatTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : timeFormat.format(date)
}

/** Hora actual como `HH:mm:ss` (para el reloj de recepción). */
export function formatClock(date = new Date()): string {
  return clockFormat.format(date)
}

/** Fecha local de hoy en formato `YYYY-MM-DD` (para filtros de API). */
export function todayIsoDate(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

/** Últimos `count` días en formato `YYYY-MM-DD`, del más antiguo al más reciente. */
export function recentIsoDates(count: number): string[] {
  const today = new Date()
  const dates: string[] = []

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - index)
    const offset = date.getTimezoneOffset()
    dates.push(new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10))
  }

  return dates
}

/** Día de la semana abreviado (`lun`, `mar`…) para una fecha ISO. */
export function formatWeekdayShort(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return weekdayFormat.format(date).replace('.', '')
}

/** Devuelve las iniciales de un nombre completo (máx. 2 letras). */
export function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/** Genera un código legible a partir del id (`FIT-0042`). */
export function memberCode(id: number): string {
  return `FIT-${String(id).padStart(4, '0')}`
}

/** Indica si una fecha ISO pertenece al mes y año actuales. */
export function isCurrentMonth(value: string, reference = new Date()): boolean {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear()
}

/** Días de calendario que faltan hasta una fecha (negativo si ya pasó). */
export function daysUntil(value?: string | null): number | null {
  if (!value) return null

  const target = new Date(value)
  if (Number.isNaN(target.getTime())) return null

  const now = new Date()
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return Math.round((targetDay.getTime() - today.getTime()) / 86_400_000)
}

/** Suma días a una fecha `YYYY-MM-DD` y devuelve el mismo formato. */
export function addDaysIso(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''

  date.setDate(date.getDate() + days)
  const pad = (part: number) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Fecha y hora local en el formato que espera `datetime-local`. */
export function toDateTimeInputValue(date = new Date()): string {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}
