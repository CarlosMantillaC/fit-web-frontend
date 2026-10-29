import {
  CircleAlert,
  Download,
  QrCode,
  Radio,
  RefreshCw,
  ScanLine,
  UserSearch,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { AttendanceFeedItem } from '@/components/attendance/AttendanceFeedItem'
import { MemberCheckInCard } from '@/components/attendance/MemberCheckInCard'
import { OccupancyCard } from '@/components/attendance/OccupancyCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterPills, type FilterOption } from '@/components/ui/FilterPills'
import { IconButton } from '@/components/ui/IconButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Spinner } from '@/components/ui/Spinner'
import { Toast, type ToastVariant } from '@/components/ui/Toast'
import {
  useAttendancesByDateQuery,
  useCheckIn,
  useCheckOut,
  useMemberAttendancesQuery,
} from '@/hooks/useAttendance'
import { useClock } from '@/hooks/useClock'
import { useMembersQuery } from '@/hooks/useMembers'
import { useMembershipsQuery } from '@/hooks/useMemberships'
import { usePageTitle } from '@/hooks/usePageTitle'
import { downloadCsv } from '@/lib/csv'
import { formatDateTime, formatNumber, memberCode, todayIsoDate } from '@/lib/format'
import { pickLatestMemberships } from '@/lib/memberships'
import { cn } from '@/lib/utils'
import type { Attendance, Member } from '@/types/api'

type FeedFilter = 'all' | 'inside' | 'finished'

interface ToastState {
  message: string
  variant: ToastVariant
}

export function AttendancePage() {
  usePageTitle('Asistencia · FitWeb Pro', 'Registro de entrada y salida de clientes.')

  const clock = useClock()
  const today = todayIsoDate()

  const { data: members = [] } = useMembersQuery()
  const { data: memberships = [] } = useMembershipsQuery()

  const {
    data: todayAttendances = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAttendancesByDateQuery(today)

  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)

  const { data: memberAttendances = [] } = useMemberAttendancesQuery(selectedMemberId ?? undefined)

  const checkInMutation = useCheckIn()
  const checkOutMutation = useCheckOut()

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const membershipByMember = useMemo(() => pickLatestMemberships(memberships), [memberships])

  const selectedMember = selectedMemberId
    ? (members.find((member) => member.id === selectedMemberId) ?? null)
    : null
  const selectedMembership = selectedMember
    ? membershipByMember.get(selectedMember.id)
    : undefined
  const openAttendance = memberAttendances.find((item) => !item.check_out) ?? null
  const lastAttendance = memberAttendances.find((item) => item.check_out)

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []

    return members
      .filter((member) =>
        [member.full_name, member.email, member.phone ?? '', memberCode(member.id)]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 6)
  }, [members, search])

  const insideCount = todayAttendances.filter((item) => !item.check_out).length
  const finishedCount = todayAttendances.length - insideCount

  const feedItems = todayAttendances.filter((item) => {
    if (feedFilter === 'inside') return !item.check_out
    if (feedFilter === 'finished') return Boolean(item.check_out)
    return true
  })

  const filterOptions: FilterOption<FeedFilter>[] = [
    { value: 'all', label: 'Todos hoy', count: todayAttendances.length },
    { value: 'inside', label: 'En sala', count: insideCount },
    { value: 'finished', label: 'Finalizados', count: finishedCount },
  ]

  function notify(message: string, variant: ToastVariant = 'success') {
    setToast({ message, variant })
  }

  function selectMember(member: Member) {
    setSelectedMemberId(member.id)
    setSearch(member.full_name)
    setSearchOpen(false)
  }

  function clearSelection() {
    setSelectedMemberId(null)
    setSearch('')
    setSearchOpen(false)
  }

  function handleCheckIn() {
    if (!selectedMember) return

    checkInMutation.mutate(selectedMember.id, {
      onSuccess: () => notify(`Entrada registrada: ${selectedMember.full_name}`),
      onError: (mutationError) => notify(getApiErrorMessage(mutationError), 'error'),
    })
  }

  function handleCheckOut(attendance: Attendance) {
    checkOutMutation.mutate(attendance.id, {
      onSuccess: () => notify(`Salida registrada: ${attendance.member_details.full_name}`),
      onError: (mutationError) => notify(getApiErrorMessage(mutationError), 'error'),
    })
  }

  function handleExport() {
    downloadCsv(
      `asistencias-${today}.csv`,
      todayAttendances.map((attendance) => ({
        Codigo: memberCode(attendance.member_details.id),
        Cliente: attendance.member_details.full_name,
        Email: attendance.member_details.email,
        Entrada: formatDateTime(attendance.check_in),
        Salida: attendance.check_out ? formatDateTime(attendance.check_out) : '',
        Estado: attendance.check_out ? 'Finalizado' : 'En sala',
        Plan: membershipByMember.get(attendance.member)?.plan_details?.name ?? '',
      })),
    )
  }

  const checkingOutId = checkOutMutation.isPending ? checkOutMutation.variables : undefined
  const isSelectedCheckOutPending =
    checkOutMutation.isPending &&
    openAttendance !== null &&
    checkOutMutation.variables === openAttendance.id

  return (
    <div>
      <PageHeader
        eyebrow="Control de acceso"
        title="Registro de asistencia"
        description="Terminal de recepción para entradas, salidas y aforo en vivo."
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <section className="flex w-full flex-col gap-4 lg:col-span-5">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container px-4 py-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-strong opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-accent-strong" />
              </span>
              <span className="font-label text-[11px] font-bold tracking-wider text-ink uppercase">
                Terminal Front-Desk 02
              </span>
            </div>
            <div className="font-label flex items-center gap-1.5 text-sm text-ink-muted">
              <span className="font-bold text-ink tabular-nums">{clock}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-surface-container p-4 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <span className="font-label text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                Escaneo o búsqueda rápida
              </span>
              <span className="font-label flex items-center gap-1 text-[11px] font-semibold text-accent">
                <Radio className="size-3.5" aria-hidden />
                Búsqueda en vivo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setSearchOpen(value.trim().length > 0)
                  if (selectedMemberId) setSelectedMemberId(null)
                }}
                placeholder="Buscar por nombre, email o código FIT-…"
              />
              <button
                type="button"
                aria-label="Escanear QR"
                title="Escanear QR"
                onClick={() => setScannerOpen((value) => !value)}
                className={cn(
                  'grid size-12 shrink-0 place-items-center rounded-lg transition-all',
                  scannerOpen
                    ? 'bg-accent-strong text-accent-contrast'
                    : 'bg-surface-container-high text-ink hover:bg-surface-bright',
                )}
              >
                <QrCode className="size-6" aria-hidden />
              </button>
            </div>

            {scannerOpen && (
              <div className="overflow-hidden rounded-lg bg-surface-container-lowest p-2">
                <div className="relative flex h-36 flex-col items-center justify-center overflow-hidden rounded bg-surface-container-high px-4 text-center">
                  <div className="absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-accent-strong shadow-[0_0_8px_#ff6b00]" />
                  <ScanLine className="size-12 text-ink-muted/40" aria-hidden />
                  <span className="mt-2 text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                    Escáner QR no conectado
                  </span>
                  <span className="mt-1 text-xs text-ink-muted/80">
                    Busca al cliente por nombre o código FIT-XXXX.
                  </span>
                  <span className="absolute top-2 right-2 rounded bg-surface-lowest/80 px-2 py-0.5 text-[10px] font-semibold text-accent">
                    DEMO
                  </span>
                </div>
              </div>
            )}

            {searchOpen && search.trim().length > 0 && (
              <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-1">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-ink-muted">Sin coincidencias.</p>
                ) : (
                  searchResults.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => selectMember(member)}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-container-high"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {member.full_name}
                        </span>
                        <span className="block truncate text-xs text-ink-muted">
                          {member.email}
                        </span>
                      </span>
                      <span className="font-label shrink-0 text-[11px] font-semibold text-accent">
                        {memberCode(member.id)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedMember ? (
            <MemberCheckInCard
              member={selectedMember}
              membership={selectedMembership}
              openAttendance={openAttendance}
              lastAttendance={lastAttendance}
              isSubmitting={checkInMutation.isPending || isSelectedCheckOutPending}
              onCheckIn={handleCheckIn}
              onCheckOut={() => openAttendance && handleCheckOut(openAttendance)}
              onClear={clearSelection}
            />
          ) : (
            <EmptyState
              icon={UserSearch}
              title="Selecciona un cliente"
              description="Busca por nombre, email o código FIT-XXXX para verificar su membresía y registrar la entrada."
              className="bg-surface-container shadow-md"
            />
          )}

          <OccupancyCard
            inside={insideCount}
            entries={todayAttendances.length}
            exits={finishedCount}
          />
        </section>

        <section className="flex w-full flex-col gap-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container p-2 shadow-md">
            <FilterPills options={filterOptions} value={feedFilter} onChange={setFeedFilter} />
            <div className="flex items-center gap-2 pr-1">
              <IconButton
                icon={RefreshCw}
                label="Refrescar lista"
                onClick={() => void refetch()}
                className={cn(isFetching && '[&>svg]:animate-spin')}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleExport}
                disabled={todayAttendances.length === 0}
              >
                <Download className="size-4" aria-hidden />
                Exportar
              </Button>
            </div>
          </div>

          <div className="flex min-h-[580px] flex-col gap-3 rounded-xl bg-surface-container p-4 shadow-md">
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="size-4 text-accent" aria-hidden />
                <h3 className="font-label text-[11px] font-bold tracking-wider text-ink uppercase">
                  Flujo de accesos en vivo
                </h3>
              </div>
              <span className="text-[11px] text-ink-muted">Actualización automática</span>
            </div>

            {isPending ? (
              <Spinner label="Cargando asistencias…" />
            ) : isError ? (
              <EmptyState
                icon={CircleAlert}
                title="No se pudieron cargar las asistencias"
                description={getApiErrorMessage(error)}
                action={<Button onClick={() => void refetch()}>Reintentar</Button>}
                className="bg-surface-container-low"
              />
            ) : feedItems.length === 0 ? (
              <EmptyState
                title={todayAttendances.length === 0 ? 'Aún no hay accesos hoy' : 'Sin registros en este filtro'}
                description={
                  todayAttendances.length === 0
                    ? 'Cuando registres una entrada, aparecerá aquí en tiempo real.'
                    : 'Cambia el filtro para ver otros registros del día.'
                }
                className="bg-surface-container-low"
              />
            ) : (
              <div className="flex max-h-[640px] flex-col gap-2.5 overflow-y-auto pr-1">
                {feedItems.map((attendance) => (
                  <AttendanceFeedItem
                    key={attendance.id}
                    attendance={attendance}
                    membership={membershipByMember.get(attendance.member)}
                    onCheckOut={handleCheckOut}
                    isCheckingOut={checkingOutId === attendance.id}
                  />
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-xs text-ink-muted">
              <span>
                En sala ahora: <strong className="text-ink">{formatNumber(insideCount)}</strong>
              </span>
              <span>{formatNumber(todayAttendances.length)} accesos hoy</span>
            </div>
          </div>
        </section>
      </div>

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
