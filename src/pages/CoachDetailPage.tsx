import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarCheck,
  CircleAlert,
  Clock,
  History,
  LogIn,
  LogOut,
  NotebookPen,
  Phone,
  QrCode,
  Timer,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { QrCodeModal } from '@/components/qr/QrCodeModal'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import {
  useCoachCheckIn,
  useCoachCheckOut,
  useCoachHistoryQuery,
} from '@/hooks/useCoaches'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { coachFullName } from '@/lib/coaches'
import { formatDate, formatDateTime, formatNumber, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CoachAttendance } from '@/types/api'

function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'En curso'
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`
}

interface InfoRowProps {
  icon: LucideIcon
  label: string
  value: string
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="font-label text-[10px] font-semibold tracking-wider text-ink-muted uppercase">
          {label}
        </dt>
        <dd className="truncate text-sm font-semibold text-ink">{value}</dd>
      </div>
    </div>
  )
}

function AttendanceRow({ attendance }: { attendance: CoachAttendance }) {
  const isInside = !attendance.check_out

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
          <CalendarCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{formatDate(attendance.check_in)}</p>
          <p className="truncate text-xs text-ink-muted">
            Entrada {formatTime(attendance.check_in)} →{' '}
            {attendance.check_out ? `Salida ${formatTime(attendance.check_out)}` : 'Sin salida'}
            {!isInside && ` · ${formatDuration(attendance.duration_minutes)}`}
          </p>
        </div>
      </div>
      <Badge variant={isInside ? 'active' : 'neutral'}>
        {isInside ? 'En sala' : 'Finalizada'}
      </Badge>
    </div>
  )
}

export function CoachDetailPage() {
  const params = useParams()
  const coachId = Number(params.id)
  const isValidId = Number.isInteger(coachId) && coachId > 0

  const {
    data: history,
    isPending,
    isError,
    error,
    refetch,
  } = useCoachHistoryQuery(isValidId ? coachId : undefined)

  const checkIn = useCoachCheckIn(coachId)
  const checkOut = useCoachCheckOut(coachId)
  const { toast, showToast, clearToast } = useToast()
  const [qrOpen, setQrOpen] = useState(false)

  const coach = history?.coach
  usePageTitle(
    coach
      ? `${coachFullName(coach)} · Entrenadores · FitWeb Pro`
      : 'Historial del entrenador · FitWeb Pro',
    'Historial de asistencia y entradas/salidas del entrenador.',
  )

  if (!isValidId) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="Entrenador no encontrado"
        description="El identificador del entrenador no es válido."
        action={
          <Link
            to="/app/coaches"
            className="font-label inline-flex h-11 items-center rounded-xl bg-surface-high px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-bright"
          >
            Volver al equipo
          </Link>
        }
      />
    )
  }

  if (isPending) return <Spinner label="Cargando historial…" />

  if (isError || !history || !coach) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudo cargar el historial"
        description={getApiErrorMessage(error)}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => void refetch()}>Reintentar</Button>
            <Link
              to="/app/coaches"
              className="font-label inline-flex h-11 items-center rounded-xl bg-surface-high px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-bright"
            >
              Volver al equipo
            </Link>
          </div>
        }
      />
    )
  }

  const { summary, attendances } = history
  const fullName = coachFullName(coach)
  const isSubmitting = checkIn.isPending || checkOut.isPending

  function handleCheckIn() {
    checkIn.mutate(undefined, {
      onSuccess: () => showToast(`Entrada registrada: ${fullName}`),
      onError: (mutationError) => showToast(getApiErrorMessage(mutationError), 'error'),
    })
  }

  function handleCheckOut() {
    checkOut.mutate(undefined, {
      onSuccess: () => showToast(`Salida registrada: ${fullName}`),
      onError: (mutationError) => showToast(getApiErrorMessage(mutationError), 'error'),
    })
  }

  return (
    <div className="flex flex-col">
      <Link
        to="/app/coaches"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al equipo
      </Link>

      <PageHeader
        eyebrow="Ficha del entrenador"
        title={fullName}
        description={`${coach.specialty}${coach.phone ? ` · ${coach.phone}` : ''}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setQrOpen(true)}>
              <QrCode className="size-5" aria-hidden />
              Ver QR
            </Button>
            {summary.currently_inside ? (
              <Button
                variant="danger"
                onClick={handleCheckOut}
                isLoading={isSubmitting}
              >
                <LogOut className="size-5" aria-hidden />
                Registrar salida
              </Button>
            ) : (
              <Button onClick={handleCheckIn} isLoading={isSubmitting}>
                <LogIn className="size-5" aria-hidden />
                Registrar entrada
              </Button>
            )}
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Estado"
          value={summary.currently_inside ? 'En sala' : 'Fuera'}
          hint={summary.currently_inside ? 'Entrada abierta ahora mismo' : 'Sin entrada abierta'}
          icon={BadgeCheck}
        />
        <StatCard
          label="Asistencias"
          value={formatNumber(summary.total_attendances)}
          hint="Registros de entrada y salida"
          icon={History}
        />
        <StatCard
          label="Tiempo acumulado"
          value={formatDuration(summary.total_minutes)}
          hint="Solo visitas finalizadas"
          icon={Timer}
        />
        <StatCard
          label="Última visita"
          value={summary.last_attendance ? formatDate(summary.last_attendance) : '—'}
          hint={
            summary.last_attendance
              ? `Entrada ${formatTime(summary.last_attendance)}`
              : 'Sin visitas registradas'
          }
          icon={Clock}
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <aside className="flex flex-col gap-4 lg:col-span-4">
          <Card className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <Avatar
                name={fullName}
                size="lg"
                status={coach.is_active ? 'online' : 'offline'}
                className={coach.is_active ? undefined : 'opacity-75 grayscale'}
              />
              <div className="min-w-0">
                <h2 className="font-heading truncate text-xl font-bold text-ink">{fullName}</h2>
                <Badge variant="accent" className="mt-1">
                  <Award className="size-3.5" aria-hidden />
                  {coach.specialty}
                </Badge>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <InfoRow icon={Phone} label="Teléfono" value={coach.phone || '—'} />
              <InfoRow
                icon={UserRound}
                label="En el equipo desde"
                value={formatDate(coach.created_at)}
              />
              <InfoRow
                icon={CalendarCheck}
                label="Primera asistencia"
                value={formatDateTime(summary.first_attendance)}
              />
            </dl>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <NotebookPen className="size-4 text-accent" aria-hidden />
              <h3 className="font-label text-[11px] font-bold tracking-wider text-ink uppercase">
                Perfil profesional
              </h3>
            </div>
            <p className="text-sm text-ink-muted">
              {coach.bio?.trim() || 'Sin biografía registrada.'}
            </p>
          </Card>
        </aside>

        <section className="lg:col-span-8">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <History className="size-4 text-accent" aria-hidden />
                <h3 className="font-label text-[11px] font-bold tracking-wider text-ink uppercase">
                  Historial de asistencia
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                {formatNumber(attendances.length)} registros
              </span>
            </div>

            {attendances.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="Sin asistencias"
                description="Aún no hay entradas registradas para este entrenador."
                className="bg-surface-container-low"
              />
            ) : (
              <div
                className={cn(
                  'flex max-h-[620px] flex-col gap-2.5 overflow-y-auto pr-1',
                )}
              >
                {attendances.map((attendance) => (
                  <AttendanceRow key={attendance.id} attendance={attendance} />
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>

      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        value={coach.qr_code}
        title={`QR de ${fullName}`}
        description={`Código de acceso ${coach.qr_code}`}
      />

      <Toast message={toast?.message ?? null} variant={toast?.variant} onClose={clearToast} />
    </div>
  )
}
