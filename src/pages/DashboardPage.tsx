import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, TrendingUp, UserPlus, Users, type LucideIcon } from 'lucide-react'

import { getDashboardStats } from '@/api/dashboard'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { DashboardStats } from '@/types/api'

const numberFormat = new Intl.NumberFormat('es-ES')
const currencyFormat = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

interface StatCard {
  key: keyof DashboardStats
  label: string
  icon: LucideIcon
  accent: string
  format?: (value: number) => string
}

const STAT_CARDS: StatCard[] = [
  {
    key: 'active_members',
    label: 'Clientes activos',
    icon: Users,
    accent: 'text-brand-400 bg-brand-500/10',
  },
  {
    key: 'monthly_revenue',
    label: 'Ingresos del mes',
    icon: TrendingUp,
    accent: 'text-emerald-400 bg-emerald-500/10',
    format: (value) => currencyFormat.format(value),
  },
  {
    key: 'todays_attendance',
    label: 'Asistencias hoy',
    icon: CalendarCheck,
    accent: 'text-sky-400 bg-sky-500/10',
  },
  {
    key: 'expiring_memberships',
    label: 'Membresías por vencer',
    icon: UserPlus,
    accent: 'text-amber-400 bg-amber-500/10',
  },
]

export function DashboardPage() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  })

  if (isPending) return <Spinner label="Cargando métricas…" />

  if (isError) {
    return (
      <Card className="text-sm text-red-400">
        No se pudieron cargar las métricas: {error instanceof Error ? error.message : 'error'}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Resumen operativo{data.month ? ` · ${data.month}` : ''}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, accent, format }) => {
          const value = data[key]
          return (
            <Card key={key} className="flex items-center gap-4">
              <span className={`grid size-10 place-items-center rounded-lg ${accent}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-2xl font-semibold text-white">
                  {format ? format(value as number) : numberFormat.format(value as number)}
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
