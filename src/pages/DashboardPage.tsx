import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CircleAlert,
  Clock3,
  CreditCard,
  FileDown,
  Gauge,
  Mail,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useAttendancesByDateQuery } from '@/hooks/useAttendance'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats, useDashboardWeekAttendance } from '@/hooks/useDashboardStats'
import { useMembersQuery } from '@/hooks/useMembers'
import { useMembershipsQuery } from '@/hooks/useMemberships'
import { usePaymentsQuery } from '@/hooks/usePayments'
import { usePageTitle } from '@/hooks/usePageTitle'
import { downloadCsv } from '@/lib/csv'
import {
  daysUntil,
  formatCurrency,
  formatDate,
  formatNumber,
  formatWeekdayShort,
  getInitials,
  isCurrentMonth,
  todayIsoDate,
} from '@/lib/format'
import { isExpiringSoon } from '@/lib/memberships'
import { userDisplayName } from '@/lib/users'
import { cn } from '@/lib/utils'

const CAPACITY = 200

const ACTIVE_SPARKLINE = 'M1 20L14 15L27 18L40 10L52 12L63 3'

const DISTRIBUTION_STYLES = [
  { dot: 'bg-accent-strong', stroke: 'text-accent-strong' },
  { dot: 'bg-accent', stroke: 'text-accent' },
  { dot: 'bg-surface-bright', stroke: 'text-surface-bright' },
  { dot: 'bg-outline', stroke: 'text-outline' },
] as const

const HOUR_SLOTS = [
  { label: '06:00 - 09:00', tag: 'Mañana intensa', from: 6, to: 9 },
  { label: '09:00 - 13:00', tag: 'Flujo medio', from: 9, to: 13 },
  { label: '13:00 - 17:00', tag: 'Horas valle', from: 13, to: 17 },
  { label: '18:00 - 21:00', tag: 'Pico crítico', from: 18, to: 21 },
  { label: '21:00 - 23:30', tag: 'Cierre nocturno', from: 21, to: 24 },
]

function buildSparkline(values: number[]): string {
  if (values.length === 0) return 'M1 23L63 23'

  const max = Math.max(...values, 1)

  return values
    .map((value, index) => {
      const x = 1 + (index * 62) / Math.max(values.length - 1, 1)
      const y = 23 - (value / max) * 20
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

interface DashboardStatProps {
  label: string
  value: string
  detail?: string
  trend?: string
  icon: LucideIcon
  sparkline?: string
  progress?: number
}

function DashboardStat({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  sparkline,
  progress,
}: DashboardStatProps) {
  const clampedProgress =
    progress === undefined ? undefined : Math.max(0, Math.min(100, progress))

  return (
    <article className="relative overflow-hidden rounded-xl border border-line/60 bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      <div className="flex items-start justify-between gap-2">
        <span className="font-label text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
          {label}
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-container text-accent">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-heading text-3xl leading-none font-extrabold text-ink">{value}</span>
        {detail && <span className="text-xs text-ink-muted">{detail}</span>}
      </div>

      <div className="mt-2 flex min-h-6 items-center justify-between gap-2">
        {trend && (
          <span className="font-label inline-flex items-center gap-1 rounded bg-accent-strong/15 px-2 py-0.5 text-[11px] font-bold text-accent">
            <TrendingUp className="size-3" aria-hidden />
            {trend}
          </span>
        )}
        {sparkline && (
          <svg
            className="h-6 w-16 text-accent"
            viewBox="0 0 64 24"
            fill="none"
            aria-hidden
            preserveAspectRatio="none"
          >
            <path
              d={sparkline}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {clampedProgress !== undefined && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-accent-strong"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      )}
    </article>
  )
}

export function DashboardPage() {
  usePageTitle('Dashboard · FitWeb Pro', 'Resumen operativo del gimnasio.')

  const navigate = useNavigate()
  const { user } = useAuth()
  const today = todayIsoDate()

  const statsQuery = useDashboardStats()
  const { dates: weekDates, results: weekResults } = useDashboardWeekAttendance(7)
  const { data: todayAttendances = [] } = useAttendancesByDateQuery(today)
  const { data: members = [] } = useMembersQuery()
  const { data: memberships = [] } = useMembershipsQuery()
  const { data: payments = [] } = usePaymentsQuery()

  if (statsQuery.isPending) return <Spinner label="Cargando métricas…" />

  if (statsQuery.isError) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudieron cargar las métricas"
        description={getApiErrorMessage(statsQuery.error)}
        action={<Button onClick={() => void statsQuery.refetch()}>Reintentar</Button>}
      />
    )
  }

  const stats = statsQuery.data
  const displayName = user ? userDisplayName(user) : 'Administrador'
  const firstName = displayName.split(' ')[0]

  const weekCounts = weekResults.map((result) => result.data?.length ?? 0)
  const peakCount = Math.max(...weekCounts, 0)
  const peakIndex = weekCounts.indexOf(peakCount)
  const peakDate = peakCount > 0 ? weekDates[peakIndex] : null
  const maxWeekCount = Math.max(peakCount, 1)

  const revenueByDay = weekDates.map((date) =>
    payments
      .filter((payment) => payment.payment_date.slice(0, 10) === date)
      .reduce((total, payment) => total + Number(payment.amount), 0),
  )

  const newMembersThisMonth = members.filter((member) =>
    isCurrentMonth(member.created_at),
  ).length
  const monthPaymentCount = payments.filter((payment) =>
    isCurrentMonth(payment.payment_date),
  ).length

  const inside = todayAttendances.filter((attendance) => !attendance.check_out).length
  const occupancyRate = Math.min(100, Math.round((inside / CAPACITY) * 100))

  const slotCounts = HOUR_SLOTS.map((slot) => ({
    ...slot,
    count: todayAttendances.filter((attendance) => {
      const hour = new Date(attendance.check_in).getHours()
      return hour >= slot.from && hour < slot.to
    }).length,
  }))
  const peakSlotCount = Math.max(...slotCounts.map((slot) => slot.count), 0)
  const maxSlotCount = Math.max(peakSlotCount, 1)

  const validMemberships = memberships.filter((membership) => membership.is_valid)
  const planTotals = new Map<string, { name: string; description: string; count: number }>()

  for (const membership of validMemberships) {
    const plan = membership.plan_details
    const current = planTotals.get(plan.name)

    if (current) {
      current.count += 1
    } else {
      planTotals.set(plan.name, {
        name: plan.name,
        description: plan.description || 'Plan de membresía',
        count: 1,
      })
    }
  }

  const sortedPlans = [...planTotals.values()].sort((a, b) => b.count - a.count)
  const topPlans = sortedPlans.slice(0, 3)
  const otherPlansCount = sortedPlans.slice(3).reduce((total, plan) => total + plan.count, 0)
  const distribution =
    otherPlansCount > 0
      ? [...topPlans, { name: 'Otros planes', description: 'Otros planes activos', count: otherPlansCount }]
      : topPlans

  const distributionSegments = distribution.map((plan, index) => {
    const percent = validMemberships.length > 0 ? (plan.count / validMemberships.length) * 100 : 0
    const offset = distribution
      .slice(0, index)
      .reduce(
        (total, previous) =>
          total +
          (validMemberships.length > 0 ? (previous.count / validMemberships.length) * 100 : 0),
        0,
      )
    const style = DISTRIBUTION_STYLES[index % DISTRIBUTION_STYLES.length]

    return {
      ...plan,
      percent,
      offset,
      dot: style.dot,
      stroke: style.stroke,
    }
  })

  const expiringMemberships = memberships
    .filter((membership) => membership.is_valid && isExpiringSoon(membership, 7))
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
  const expiringPreview = expiringMemberships.slice(0, 4)

  function handleExport() {
    downloadCsv(`dashboard-${today}.csv`, [
      { Métrica: 'Clientes activos', Valor: stats.active_members },
      { Métrica: 'Ingresos del mes', Valor: stats.monthly_revenue },
      { Métrica: 'Asistencias hoy', Valor: stats.todays_attendance },
      { Métrica: 'Ocupación actual (%)', Valor: occupancyRate },
      { Métrica: 'Aforo actual', Valor: inside },
      { Métrica: 'Membresías por vencer', Valor: expiringMemberships.length },
      ...weekDates.map((date, index) => ({
        Métrica: `Asistencias ${date}`,
        Valor: weekCounts[index],
      })),
    ])
  }

  return (
    <div>
      <section className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label text-[11px] font-bold tracking-wider text-accent uppercase">
              Panel de Control
            </span>
            <span className="size-1.5 animate-pulse rounded-full bg-accent-strong" />
            <span className="text-xs text-ink-muted">En tiempo real</span>
          </div>
          <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Hola, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Rendimiento atlético, capacidad y facturación de la sede central.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-line/60 bg-surface-container px-3 text-ink">
            <CalendarDays className="size-4 text-accent" aria-hidden />
            <span className="font-label text-xs font-semibold">
              {formatDate(weekDates[0])} — {formatDate(weekDates[weekDates.length - 1])}
            </span>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <FileDown className="size-4" aria-hidden />
            Exportar
          </Button>
          <Button onClick={() => navigate('/app/members?new=1')}>
            <UserPlus className="size-4" aria-hidden />
            Nuevo Registro
          </Button>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <DashboardStat
          label="Miembros activos"
          value={formatNumber(stats.active_members)}
          trend={`+${formatNumber(newMembersThisMonth)} este mes`}
          icon={Users}
          sparkline={ACTIVE_SPARKLINE}
        />
        <DashboardStat
          label="Ingresos del mes"
          value={formatCurrency(stats.monthly_revenue)}
          trend={`${formatNumber(monthPaymentCount)} cobros`}
          icon={CreditCard}
          sparkline={buildSparkline(revenueByDay)}
        />
        <DashboardStat
          label="Asistencia hoy"
          value={formatNumber(stats.todays_attendance)}
          trend={`${formatNumber(inside)} dentro ahora`}
          icon={CalendarCheck}
          sparkline={buildSparkline(weekCounts)}
        />
        <DashboardStat
          label="Ocupación actual"
          value={`${occupancyRate}%`}
          detail={`${formatNumber(inside)} / ${formatNumber(CAPACITY)} aforo`}
          icon={Gauge}
          progress={occupancyRate}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <section className="rounded-xl border border-line/60 bg-surface-container-low p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <span className="font-label text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  Telemetría Gym
                </span>
                <h2 className="font-heading mt-0.5 text-lg font-bold text-ink">
                  Tendencia de asistencia semanal
                </h2>
              </div>
              <span className="font-label inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent-strong px-2.5 py-1 text-[11px] font-bold text-accent-contrast">
                <span className="size-1.5 rounded-full bg-accent-contrast" />
                Últimos 7 días
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-surface-container/60 p-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-strong/15 text-accent">
                  <Zap className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-label text-xs font-semibold text-ink">
                    Pico máximo registrado
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {peakDate
                      ? `${formatWeekdayShort(peakDate)} · ${formatDate(peakDate)}`
                      : 'Sin asistencias registradas esta semana'}
                  </p>
                </div>
              </div>
              {peakDate && (
                <span className="font-label shrink-0 rounded bg-accent-strong/15 px-2.5 py-1 text-xs font-bold text-accent">
                  {formatNumber(peakCount)} accesos
                </span>
              )}
            </div>

            <div className="mt-4 flex h-56 items-end gap-2 px-1 pt-4 sm:gap-3">
              {weekDates.map((date, index) => {
                const count = weekCounts[index]
                const isPeak = count > 0 && count === peakCount
                const height = count === 0 ? 4 : Math.max(8, Math.round((count / maxWeekCount) * 100))

                return (
                  <div
                    key={date}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span
                      className={cn(
                        'font-label text-[11px] text-ink-muted transition-colors group-hover:text-accent',
                        isPeak && 'font-bold text-accent',
                      )}
                    >
                      {formatNumber(count)}
                    </span>
                    <div
                      className={cn(
                        'w-full rounded-t transition-all',
                        isPeak
                          ? 'bg-accent-strong shadow-[0_0_12px_rgba(255,107,0,0.35)]'
                          : 'bg-surface-bright group-hover:bg-accent-strong/70',
                      )}
                      style={{ height: `${height}%` }}
                    />
                    <span
                      className={cn(
                        'font-label text-[11px] font-semibold text-ink-muted capitalize',
                        isPeak && 'text-accent',
                      )}
                    >
                      {formatWeekdayShort(date)}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-line/60 bg-surface-container-low p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-label text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  Categorización de ingresos
                </span>
                <h2 className="font-heading mt-0.5 text-lg font-bold text-ink">
                  Distribución de membresías
                </h2>
              </div>
              <span className="text-xs text-ink-muted">
                Total: {formatNumber(validMemberships.length)}
              </span>
            </div>

            {validMemberships.length === 0 ? (
              <div className="mt-4 rounded-lg bg-surface-container/50 p-4 text-sm text-ink-muted">
                Aún no hay membresías vigentes.{' '}
                <Link to="/app/memberships" className="font-semibold text-accent hover:underline">
                  Asigna la primera
                </Link>
                .
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                <div className="relative flex justify-center py-2 md:col-span-5">
                  <svg className="size-36 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.5"
                      className="text-surface-container"
                    />
                    {distributionSegments.map((segment) => (
                      <circle
                        key={segment.name}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                        strokeDashoffset={-segment.offset}
                        className={segment.stroke}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading text-2xl font-bold text-ink">
                      {formatNumber(validMemberships.length)}
                    </span>
                    <span className="font-label text-[10px] tracking-wider text-ink-muted uppercase">
                      Activas
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-7">
                  {distributionSegments.map((segment) => (
                    <div
                      key={segment.name}
                      className="flex items-center justify-between gap-3 rounded-lg bg-surface-container/40 p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className={cn('size-2.5 shrink-0 rounded-full', segment.dot)} />
                        <div className="min-w-0">
                          <p className="font-label truncate text-xs font-bold text-ink">
                            {segment.name}
                          </p>
                          <p className="truncate text-[11px] text-ink-muted">
                            {segment.description}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-label text-xs font-bold text-accent">
                          {Math.round(segment.percent)}%
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {formatNumber(segment.count)} socios
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <section className="rounded-xl border border-line/60 bg-surface-container-low p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-label text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
                  Distribución diaria
                </span>
                <h2 className="font-heading mt-0.5 text-lg font-bold text-ink">
                  Afluencia por horarios
                </h2>
              </div>
              <Clock3 className="size-5 text-ink-muted" aria-hidden />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {slotCounts.map((slot) => {
                const isPeak = slot.count > 0 && slot.count === peakSlotCount
                const width = Math.round((slot.count / maxSlotCount) * 100)

                return (
                  <div key={slot.label} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label text-xs text-ink">
                        {slot.label}{' '}
                        <span className={cn('text-ink-muted', isPeak && 'text-accent')}>
                          ({slot.tag})
                        </span>
                      </span>
                      <span
                        className={cn(
                          'font-label shrink-0 text-[11px] font-semibold text-ink-muted',
                          isPeak && 'font-bold text-accent',
                        )}
                      >
                        {formatNumber(slot.count)} accesos
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          isPeak
                            ? 'bg-accent-strong shadow-[0_0_8px_rgba(255,107,0,0.45)]'
                            : 'bg-surface-bright',
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="flex flex-1 flex-col rounded-xl border border-line/60 bg-surface-container-low p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-label text-[11px] font-semibold tracking-wider text-danger uppercase">
                  Atención requerida
                </span>
                <h2 className="font-heading mt-0.5 text-lg font-bold text-ink">
                  Vencimientos próximos
                </h2>
              </div>
              <span className="font-label shrink-0 rounded bg-danger-soft/35 px-2 py-0.5 text-[11px] font-bold text-danger">
                En 7 días
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Membresías que vencen pronto. Envía un recordatorio por correo con un toque.
            </p>

            <div className="mt-3 flex flex-1 flex-col gap-2">
              {expiringPreview.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg bg-surface-container/40 p-4 text-center text-sm text-ink-muted">
                  No hay vencimientos en los próximos 7 días.
                </div>
              ) : (
                expiringPreview.map((membership) => {
                  const member = membership.member_details
                  const remaining = daysUntil(membership.end_date)
                  const dueLabel =
                    remaining === 0
                      ? 'Vence hoy'
                      : remaining === 1
                        ? 'Vence mañana'
                        : `Vence en ${remaining ?? 0} días`
                  const mailto = member.email
                    ? `mailto:${member.email}?subject=${encodeURIComponent(
                        'Tu membresía está por vencer',
                      )}&body=${encodeURIComponent(
                        `Hola ${member.full_name}, tu membresía ${membership.plan_details.name} vence el ${formatDate(
                          membership.end_date,
                        )}. Te esperamos para renovarla.`,
                      )}`
                    : null

                  return (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-surface-container p-2.5 transition-colors hover:bg-surface-container-high"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="font-heading grid size-10 shrink-0 place-items-center rounded-full bg-surface-container-high text-xs font-bold text-ink">
                          {getInitials(member.full_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-label truncate text-sm font-semibold text-ink">
                            {member.full_name}
                          </p>
                          <p className="truncate text-[11px] text-ink-muted">
                            {membership.plan_details.name} · {dueLabel}
                          </p>
                        </div>
                      </div>

                      {mailto ? (
                        <a
                          href={mailto}
                          className="font-label inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-surface-container-high px-2.5 text-[11px] font-bold text-accent transition-colors hover:bg-accent-strong hover:text-accent-contrast"
                        >
                          <Mail className="size-3.5" aria-hidden />
                          Notificar
                        </a>
                      ) : (
                        <span className="font-label shrink-0 rounded-lg bg-surface-container-high px-2.5 py-2 text-[10px] text-ink-muted">
                          Sin email
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <Link
              to="/app/memberships"
              className="font-label mt-3 flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-surface-container text-xs font-semibold text-ink transition-colors hover:bg-surface-container-high"
            >
              Ver los {formatNumber(expiringMemberships.length)} vencimientos
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
