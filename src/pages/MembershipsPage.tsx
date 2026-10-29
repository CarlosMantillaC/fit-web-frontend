import {
  BadgeCheck,
  Ban,
  CalendarClock,
  CircleAlert,
  Download,
  Plus,
  Ticket,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { MembershipFormModal } from '@/components/memberships/MembershipFormModal'
import { MembershipStatusModal } from '@/components/memberships/MembershipStatusModal'
import { MembershipTable } from '@/components/memberships/MembershipTable'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterPills, type FilterOption } from '@/components/ui/FilterPills'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useMembershipsQuery } from '@/hooks/useMemberships'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { useDebounce } from '@/hooks/useDebounce'
import { downloadCsv } from '@/lib/csv'
import { formatDate, formatNumber, memberCode, todayIsoDate } from '@/lib/format'
import {
  MEMBERSHIP_STATUS_LABEL,
  isExpiringSoon,
  membershipBadgeLabel,
} from '@/lib/memberships'
import type { Membership } from '@/types/api'

type StatusFilter = 'ALL' | 'VALID' | 'EXPIRING' | 'ENDED' | 'CANCELLED'
type SortKey = 'end-asc' | 'end-desc' | 'name' | 'recent'

const PAGE_SIZE = 8

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'end-asc', label: 'Vencimiento próximo' },
  { value: 'end-desc', label: 'Vencimiento lejano' },
  { value: 'recent', label: 'Más recientes' },
  { value: 'name', label: 'Cliente (A-Z)' },
]

function sortMemberships(memberships: Membership[], sort: SortKey): Membership[] {
  return [...memberships].sort((a, b) => {
    if (sort === 'name') {
      return a.member_details.full_name.localeCompare(b.member_details.full_name, 'es')
    }
    if (sort === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    const diff = new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    return sort === 'end-asc' ? diff : -diff
  })
}

export function MembershipsPage() {
  usePageTitle('Membresías · FitWeb Pro', 'Altas, vigencias y renovaciones de clientes.')

  const { data: memberships = [], isPending, isError, error, refetch } = useMembershipsQuery()
  const { toast, showToast, clearToast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [sort, setSort] = useState<SortKey>('end-asc')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [seed, setSeed] = useState<{ memberId?: number; planId?: number }>({})
  const [statusMembership, setStatusMembership] = useState<Membership | null>(null)

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      ALL: memberships.length,
      VALID: 0,
      EXPIRING: 0,
      ENDED: 0,
      CANCELLED: 0,
    }

    for (const membership of memberships) {
      if (membership.status === 'CANCELLED') {
        base.CANCELLED += 1
      } else if (membership.is_valid && isExpiringSoon(membership)) {
        base.EXPIRING += 1
      } else if (membership.is_valid) {
        base.VALID += 1
      } else {
        base.ENDED += 1
      }
    }

    return base
  }, [memberships])

  const filteredMemberships = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = memberships.filter((membership) => {
      if (status === 'CANCELLED' && membership.status !== 'CANCELLED') return false
      if (status === 'EXPIRING' && !(membership.is_valid && isExpiringSoon(membership))) return false
      if (
        status === 'VALID' &&
        !(membership.is_valid && !isExpiringSoon(membership))
      ) {
        return false
      }
      if (
        status === 'ENDED' &&
        (membership.status === 'CANCELLED' || membership.is_valid)
      ) {
        return false
      }
      if (!term) return true

      const member = membership.member_details
      const haystack = [
        member.full_name,
        member.email,
        memberCode(member.id),
        membership.plan_details.name,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })

    return sortMemberships(result, sort)
  }, [memberships, status, debouncedQuery, sort])

  const pageCount = Math.max(1, Math.ceil(filteredMemberships.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleMemberships = filteredMemberships.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'ALL', label: 'Todas', count: counts.ALL },
    { value: 'VALID', label: 'Vigentes', count: counts.VALID },
    { value: 'EXPIRING', label: 'Por vencer', count: counts.EXPIRING },
    { value: 'ENDED', label: 'Vencidas', count: counts.ENDED },
    { value: 'CANCELLED', label: 'Canceladas', count: counts.CANCELLED },
  ]

  function openCreate() {
    setSeed({})
    setFormOpen(true)
  }

  function openRenew(membership: Membership) {
    setSeed({ memberId: membership.member, planId: membership.plan })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setSeed({})
  }

  function handleExport() {
    downloadCsv(
      `membresias-${todayIsoDate()}.csv`,
      filteredMemberships.map((membership) => ({
        Cliente: membership.member_details.full_name,
        Email: membership.member_details.email,
        Codigo: memberCode(membership.member_details.id),
        Plan: membership.plan_details.name,
        Inicio: formatDate(membership.start_date),
        Fin: formatDate(membership.end_date),
        Estado: MEMBERSHIP_STATUS_LABEL[membership.status],
        Vigencia: membershipBadgeLabel(membership),
      })),
    )
  }

  function clearFilters() {
    setQuery('')
    setStatus('ALL')
    setPage(1)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Control de vigencias"
        title="Membresías"
        description="Asigna planes, renueva periodos y controla los vencimientos."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={filteredMemberships.length === 0}
            >
              <Download className="size-5 text-accent" aria-hidden />
              Exportar
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-5" aria-hidden />
              Asignar membresía
            </Button>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Membresías totales"
          value={formatNumber(counts.ALL)}
          hint="Historial completo"
          icon={Ticket}
        />
        <StatCard
          label="Vigentes"
          value={formatNumber(counts.VALID)}
          hint="Activas y con fecha futura"
          icon={BadgeCheck}
          progress={counts.ALL > 0 ? Math.round((counts.VALID / counts.ALL) * 100) : 0}
        />
        <StatCard
          label="Vencen en 7 días"
          value={formatNumber(counts.EXPIRING)}
          hint="Requieren renovación próxima"
          icon={CalendarClock}
        />
        <StatCard
          label="Vencidas o canceladas"
          value={formatNumber(counts.ENDED + counts.CANCELLED)}
          hint={`${formatNumber(counts.ENDED)} vencidas · ${formatNumber(counts.CANCELLED)} canceladas`}
          icon={Ban}
        />
      </section>

      <section className="mb-6 rounded-xl bg-surface-container p-4 shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Buscar por cliente, email, código o plan…"
            className="lg:max-w-md"
          />

          <FilterPills
            options={filterOptions}
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          />

          <Select
            aria-label="Ordenar membresías"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) => {
              setSort(value as SortKey)
              setPage(1)
            }}
            className="w-full lg:ml-auto lg:max-w-52"
          />
        </div>
      </section>

      {isPending ? (
        <Spinner label="Cargando membresías…" />
      ) : isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudieron cargar las membresías"
          description={getApiErrorMessage(error)}
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : filteredMemberships.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={
            memberships.length === 0
              ? 'Aún no hay membresías. Asigna un plan a un cliente para empezar.'
              : 'No hay membresías que coincidan con la búsqueda o los filtros.'
          }
          action={
            memberships.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus className="size-5" aria-hidden />
                Asignar membresía
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <MembershipTable
          memberships={visibleMemberships}
          isLoading={false}
          onRenew={openRenew}
          onStatus={setStatusMembership}
        />
      )}

      {!isPending && !isError && filteredMemberships.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={filteredMemberships.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="membresías"
        />
      )}

      <MembershipFormModal
        open={formOpen}
        initialMemberId={seed.memberId}
        initialPlanId={seed.planId}
        onClose={closeForm}
        onSuccess={showToast}
      />

      <MembershipStatusModal
        open={statusMembership !== null}
        membership={statusMembership}
        onClose={() => setStatusMembership(null)}
        onSuccess={showToast}
      />

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={clearToast}
      />
    </div>
  )
}
