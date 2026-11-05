import {
  ArrowLeft,
  BadgeCheck,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  CreditCard,
  History,
  Mail,
  Pencil,
  Phone,
  QrCode,
  ReceiptText,
  Ticket,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { MemberFormModal } from '@/components/members/MemberFormModal'
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
import { useMemberAttendancesQuery } from '@/hooks/useAttendance'
import { useMemberQuery } from '@/hooks/useMembers'
import { useMembershipsQuery } from '@/hooks/useMemberships'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePaymentsQuery } from '@/hooks/usePayments'
import { useToast } from '@/hooks/useToast'
import {
  daysUntil,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  memberCode,
} from '@/lib/format'
import {
  GENDER_LABEL,
  MEMBER_STATUS_BADGE,
  MEMBER_STATUS_LABEL,
} from '@/lib/members'
import {
  membershipBadgeLabel,
  membershipBadgeVariant,
} from '@/lib/memberships'
import {
  PAYMENT_METHOD_BADGE,
  PAYMENT_METHOD_LABEL,
  paymentCode,
} from '@/lib/payments'
import { cn } from '@/lib/utils'
import type { Attendance, Member, Membership, Payment } from '@/types/api'

type HistoryTab = 'memberships' | 'payments' | 'attendance'

function remainingLabel(membership: Membership): string {
  if (membership.status === 'CANCELLED') return 'Cancelada'
  const remaining = daysUntil(membership.end_date)
  if (remaining === null) return '—'
  if (remaining > 1) return `Quedan ${remaining} días`
  if (remaining === 1) return 'Vence mañana'
  if (remaining === 0) return 'Vence hoy'
  return `Venció hace ${Math.abs(remaining)} días`
}

function attendanceDuration(attendance: Attendance): string | null {
  if (!attendance.check_out) return null

  const milliseconds =
    new Date(attendance.check_out).getTime() - new Date(attendance.check_in).getTime()
  if (Number.isNaN(milliseconds) || milliseconds < 0) return null

  const minutes = Math.round(milliseconds / 60_000)
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

export function MemberDetailPage() {
  const params = useParams()
  const memberId = Number(params.id)
  const isValidId = Number.isInteger(memberId) && memberId > 0

  const {
    data: member,
    isPending,
    isError,
    error,
    refetch,
  } = useMemberQuery(isValidId ? memberId : undefined)
  const { data: memberships = [] } = useMembershipsQuery()
  const { data: payments = [] } = usePaymentsQuery()
  const { data: attendances = [] } = useMemberAttendancesQuery(isValidId ? memberId : undefined)

  const { toast, showToast, clearToast } = useToast()
  const [tab, setTab] = useState<HistoryTab>('memberships')
  const [editOpen, setEditOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  usePageTitle(
    member ? `${member.full_name} · Clientes · FitWeb Pro` : 'Expediente del cliente · FitWeb Pro',
    'Estado del cliente e historial de membresías, pagos y asistencias.',
  )

  const memberMemberships = useMemo(() => {
    if (!member) return []
    return memberships
      .filter((membership) => membership.member === member.id)
      .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
  }, [memberships, member])

  const memberPayments = useMemo(() => {
    if (!member) return []
    return payments
      .filter((payment) => payment.membership_details?.member === member.id)
      .sort(
        (a, b) =>
          new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
      )
  }, [payments, member])

  const memberAttendances = useMemo(
    () =>
      [...attendances].sort(
        (a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime(),
      ),
    [attendances],
  )

  const activeMembership = memberMemberships.find((membership) => membership.is_valid)
  const currentMembership = activeMembership ?? memberMemberships[0]
  const totalPaid = memberPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  const lastAttendance = memberAttendances[0]

  if (!isValidId) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="Cliente no encontrado"
        description="El identificador del cliente no es válido."
        action={
          <Link
            to="/app/members"
            className="font-label inline-flex h-11 items-center rounded-xl bg-surface-high px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-bright"
          >
            Volver al directorio
          </Link>
        }
      />
    )
  }

  if (isPending) return <Spinner label="Cargando expediente…" />

  if (isError || !member) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudo cargar el expediente"
        description={getApiErrorMessage(error)}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => void refetch()}>Reintentar</Button>
            <Link
              to="/app/members"
              className="font-label inline-flex h-11 items-center rounded-xl bg-surface-high px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-bright"
            >
              Volver al directorio
            </Link>
          </div>
        }
      />
    )
  }

  const isActive = member.status === 'ACTIVE'
  const avatarStatus = isActive
    ? 'online'
    : member.status === 'SUSPENDED'
      ? 'warning'
      : 'offline'

  const tabs: { value: HistoryTab; label: string; icon: LucideIcon; count: number }[] = [
    {
      value: 'memberships',
      label: 'Membresías',
      icon: Ticket,
      count: memberMemberships.length,
    },
    {
      value: 'payments',
      label: 'Pagos',
      icon: CreditCard,
      count: memberPayments.length,
    },
    {
      value: 'attendance',
      label: 'Asistencias',
      icon: CalendarCheck,
      count: memberAttendances.length,
    },
  ]

  return (
    <div className="flex flex-col">
      <Link
        to="/app/members"
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Volver al directorio
      </Link>

      <PageHeader
        eyebrow="Expediente del cliente"
        title={member.full_name}
        description={`${memberCode(member.id)} · ${member.email}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setQrOpen(true)}>
              <QrCode className="size-5" aria-hidden />
              Ver QR
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="size-5" aria-hidden />
              Editar cliente
            </Button>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Estado del cliente"
          value={MEMBER_STATUS_LABEL[member.status]}
          hint={isActive ? 'Habilitado para acceder al gimnasio' : 'Requiere revisión'}
          icon={BadgeCheck}
        />
        <StatCard
          label="Membresía actual"
          value={activeMembership ? 'Vigente' : 'Sin plan'}
          hint={
            currentMembership
              ? `${currentMembership.plan_details.name} · ${remainingLabel(currentMembership)}`
              : 'Sin membresía asignada'
          }
          icon={Ticket}
        />
        <StatCard
          label="Total pagado"
          value={formatCurrency(totalPaid)}
          hint={`${formatNumber(memberPayments.length)} cobros registrados`}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Asistencias"
          value={formatNumber(memberAttendances.length)}
          hint={
            lastAttendance
              ? `Última visita ${formatDateTime(lastAttendance.check_in)}`
              : 'Sin visitas registradas'
          }
          icon={CalendarCheck}
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <aside className="flex flex-col gap-4 lg:col-span-4">
          <Card className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <Avatar
                name={member.full_name}
                size="lg"
                status={avatarStatus}
                className={isActive ? undefined : 'opacity-75 grayscale'}
              />
              <div className="min-w-0">
                <h2 className="font-heading truncate text-xl font-bold text-ink">
                  {member.full_name}
                </h2>
                <p className="truncate text-sm text-ink-muted">{member.email}</p>
                <span className="font-label text-[11px] font-semibold tracking-wider text-secondary uppercase">
                  ID: {memberCode(member.id)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant={MEMBER_STATUS_BADGE[member.status]}>
                {MEMBER_STATUS_LABEL[member.status]}
              </Badge>
              <Badge variant="neutral">Género: {GENDER_LABEL[member.gender ?? '']}</Badge>
              <Badge variant={activeMembership ? 'active' : 'danger'}>
                {activeMembership ? 'Membresía vigente' : 'Sin membresía vigente'}
              </Badge>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <InfoRow icon={Mail} label="Email" value={member.email} />
              <InfoRow icon={Phone} label="Teléfono" value={member.phone ?? '—'} />
              <InfoRow
                icon={CalendarDays}
                label="Fecha de nacimiento"
                value={formatDate(member.date_of_birth)}
              />
              <InfoRow
                icon={UserRound}
                label="Alta en el gimnasio"
                value={formatDate(member.created_at)}
              />
              <InfoRow
                icon={History}
                label="Última actualización"
                value={formatDate(member.updated_at)}
              />
            </dl>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-4 text-accent" aria-hidden />
              <h3 className="font-label text-[11px] font-bold tracking-wider text-ink uppercase">
                Membresía actual
              </h3>
            </div>

            {currentMembership ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading truncate text-lg font-bold text-ink">
                      {currentMembership.plan_details.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatCurrency(Number(currentMembership.plan_details.price))} ·{' '}
                      {currentMembership.plan_details.duration_days} días
                    </p>
                  </div>
                  <Badge variant={membershipBadgeVariant(currentMembership)}>
                    {membershipBadgeLabel(currentMembership)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-3">
                  <div>
                    <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
                      Inicio
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {formatDate(currentMembership.start_date)}
                    </span>
                  </div>
                  <div>
                    <span className="font-label block text-[10px] tracking-wider text-ink-muted uppercase">
                      Fin
                    </span>
                    <span className="text-sm font-semibold text-ink">
                      {formatDate(currentMembership.end_date)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-ink-muted">{remainingLabel(currentMembership)}</p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">
                Este cliente todavía no tiene ninguna membresía asignada.
              </p>
            )}
          </Card>
        </aside>

        <section className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl bg-surface-container shadow-sm">
            <div className="flex gap-1 overflow-x-auto border-b border-line px-2 pt-2">
              {tabs.map(({ value, label, icon: Icon, count }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  aria-pressed={tab === value}
                  className={cn(
                    'font-label flex items-center gap-2 rounded-t-lg border-b-2 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors',
                    tab === value
                      ? 'border-accent-strong text-accent'
                      : 'border-transparent text-ink-muted hover:text-ink',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      tab === value
                        ? 'bg-accent-strong text-accent-contrast'
                        : 'bg-surface-container-high text-ink-muted',
                    )}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 p-4">
              {tab === 'memberships' &&
                (memberMemberships.length === 0 ? (
                  <EmptyState
                    icon={Ticket}
                    title="Sin membresías"
                    description="Asigna un plan para empezar a registrar la vigencia del cliente."
                    className="bg-surface-container-low"
                  />
                ) : (
                  memberMemberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-ink">
                            {membership.plan_details.name}
                          </p>
                          <Badge variant={membershipBadgeVariant(membership)}>
                            {membershipBadgeLabel(membership)}
                          </Badge>
                        </div>
                        <p className="text-xs text-ink-muted">
                          {formatDate(membership.start_date)} —{' '}
                          {formatDate(membership.end_date)} ·{' '}
                          {formatCurrency(Number(membership.plan_details.price))}
                        </p>
                      </div>
                      <span className="font-label shrink-0 text-[11px] font-semibold text-ink-muted">
                        {remainingLabel(membership)}
                      </span>
                    </div>
                  ))
                ))}

              {tab === 'payments' &&
                (memberPayments.length === 0 ? (
                  <EmptyState
                    icon={ReceiptText}
                    title="Sin pagos"
                    description="Los cobros asociados a las membresías del cliente aparecerán aquí."
                    className="bg-surface-container-low"
                  />
                ) : (
                  memberPayments.map((payment: Payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
                          <ReceiptText className="size-5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {paymentCode(payment.id)} · {formatCurrency(Number(payment.amount))}
                          </p>
                          <p className="truncate text-xs text-ink-muted">
                            {formatDateTime(payment.payment_date)} ·{' '}
                            {payment.membership_details.plan_details.name}
                          </p>
                          {payment.notes && (
                            <p className="truncate text-xs text-ink-muted">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={PAYMENT_METHOD_BADGE[payment.method]}>
                        {PAYMENT_METHOD_LABEL[payment.method]}
                      </Badge>
                    </div>
                  ))
                ))}

              {tab === 'attendance' &&
                (memberAttendances.length === 0 ? (
                  <EmptyState
                    icon={CalendarCheck}
                    title="Sin asistencias"
                    description="Aún no hay entradas registradas para este cliente."
                    className="bg-surface-container-low"
                  />
                ) : (
                  memberAttendances.map((attendance) => {
                    const duration = attendanceDuration(attendance)
                    const isInside = !attendance.check_out

                    return (
                      <div
                        key={attendance.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-container-high text-accent">
                            <CalendarCheck className="size-5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {formatDate(attendance.check_in)}
                            </p>
                            <p className="truncate text-xs text-ink-muted">
                              Entrada {formatTime(attendance.check_in)} ·{' '}
                              {attendance.check_out
                                ? `Salida ${formatTime(attendance.check_out)}`
                                : 'Sin salida'}
                              {duration ? ` · ${duration}` : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isInside ? 'active' : 'neutral'}>
                          {isInside ? 'En sala' : 'Finalizada'}
                        </Badge>
                      </div>
                    )
                  })
                ))}
            </div>
          </div>
        </section>
      </div>

      <MemberFormModal
        open={editOpen}
        member={member as Member}
        onClose={() => setEditOpen(false)}
        onSuccess={showToast}
      />

      <QrCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        value={member.qr_code}
        title={`QR de ${member.full_name}`}
        description={`Código de acceso ${member.qr_code}`}
      />

      <Toast message={toast?.message ?? null} variant={toast?.variant} onClose={clearToast} />
    </div>
  )
}
