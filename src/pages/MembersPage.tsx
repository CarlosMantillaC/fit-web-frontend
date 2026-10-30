import {
  CircleAlert,
  Download,
  LayoutGrid,
  Table2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/api/client'
import { MemberCard } from '@/components/members/MemberCard'
import { MemberFormModal } from '@/components/members/MemberFormModal'
import { MemberTable } from '@/components/members/MemberTable'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FilterPills, type FilterOption } from '@/components/ui/FilterPills'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useDebounce } from '@/hooks/useDebounce'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { useDeleteMember, useMembersQuery } from '@/hooks/useMembers'
import { downloadCsv } from '@/lib/csv'
import { formatDate, formatNumber, isCurrentMonth, memberCode } from '@/lib/format'
import type { Member, MemberStatus } from '@/types/api'

type StatusFilter = 'ALL' | MemberStatus
type SortKey = 'recent' | 'oldest' | 'name'
type ViewMode = 'grid' | 'table'

const PAGE_SIZE = 6

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Recientes primero' },
  { value: 'oldest', label: 'Antiguos primero' },
  { value: 'name', label: 'Nombre (A-Z)' },
]

function sortMembers(members: Member[], sort: SortKey): Member[] {
  return [...members].sort((a, b) => {
    if (sort === 'name') return a.full_name.localeCompare(b.full_name, 'es')
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return sort === 'recent' ? bTime - aTime : aTime - bTime
  })
}

export function MembersPage() {
  usePageTitle('Clientes · FitWeb Pro', 'Directorio de clientes del gimnasio.')

  const { data: members = [], isPending, isError, error, refetch } = useMembersQuery()
  const deleteMember = useDeleteMember()
  const { toast, showToast, clearToast } = useToast()

  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const debouncedQuery = useDebounce(query, 250)
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [sort, setSort] = useState<SortKey>('recent')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<ViewMode>('grid')
  const [modalOpen, setModalOpen] = useState(() => searchParams.get('new') === '1')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)

  const counts = useMemo(() => {
    return members.reduce(
      (acc, member) => {
        acc.ALL += 1
        acc[member.status] += 1
        return acc
      },
      { ALL: 0, ACTIVE: 0, INACTIVE: 0, SUSPENDED: 0 } as Record<StatusFilter, number>,
    )
  }, [members])

  const newThisMonth = useMemo(
    () => members.filter((member) => isCurrentMonth(member.created_at)).length,
    [members],
  )

  const filteredMembers = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = members.filter((member) => {
      const matchesStatus = status === 'ALL' || member.status === status
      if (!matchesStatus) return false
      if (!term) return true

      const haystack = [
        member.full_name,
        member.email,
        member.phone ?? '',
        memberCode(member.id),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })

    return sortMembers(result, sort)
  }, [members, status, debouncedQuery, sort])

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const activeRate = counts.ALL > 0 ? Math.round((counts.ACTIVE / counts.ALL) * 100) : 0

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'ALL', label: 'Todos', count: counts.ALL },
    { value: 'ACTIVE', label: 'Activos', count: counts.ACTIVE },
    { value: 'INACTIVE', label: 'Inactivos', count: counts.INACTIVE },
    { value: 'SUSPENDED', label: 'Suspendidos', count: counts.SUSPENDED },
  ]

  function openCreateModal() {
    setEditingMember(null)
    setModalOpen(true)
  }

  function openEditModal(member: Member) {
    setEditingMember(member)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingMember(null)
  }

  function handleDelete(member: Member) {
    setDeletingMember(member)
  }

  function confirmDelete() {
    if (!deletingMember) return

    deleteMember.mutate(deletingMember.id, {
      onSuccess: () => {
        showToast(`${deletingMember.full_name} desactivado. El historial se conserva.`)
        setDeletingMember(null)
      },
      onError: (mutationError) => {
        showToast(getApiErrorMessage(mutationError), 'error')
        setDeletingMember(null)
      },
    })
  }

  function handleExport() {
    downloadCsv(
      `clientes-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredMembers.map((member) => ({
        Codigo: memberCode(member.id),
        Nombre: member.full_name,
        Email: member.email,
        Telefono: member.phone ?? '',
        Estado: member.status,
        Genero: member.gender ?? '',
        Alta: formatDate(member.created_at),
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
        eyebrow="Base de clientes"
        title="Directorio de clientes"
        description="Gestiona altas, estados y expedientes del gimnasio."
        actions={
          <>
            <Button variant="secondary" onClick={handleExport} disabled={filteredMembers.length === 0}>
              <Download className="size-5 text-accent" aria-hidden />
              Exportar
            </Button>
            <Button onClick={openCreateModal}>
              <UserPlus className="size-5" aria-hidden />
              Añadir cliente
            </Button>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total clientes"
          value={formatNumber(counts.ALL)}
          hint={`${formatNumber(counts.ACTIVE)} activos en sala`}
          trend={activeRate > 0 ? `${activeRate}%` : undefined}
          icon={Users}
          progress={activeRate}
        />
        <StatCard
          label="Nuevas altas (mes)"
          value={formatNumber(newThisMonth)}
          hint="Altas registradas este mes"
          icon={UserPlus}
        />
        <StatCard
          label="Clientes activos"
          value={formatNumber(counts.ACTIVE)}
          hint={`${activeRate}% de la base total`}
          icon={UserCheck}
          progress={activeRate}
        />
        <StatCard
          label="Requieren seguimiento"
          value={formatNumber(counts.INACTIVE + counts.SUSPENDED)}
          hint={`${formatNumber(counts.INACTIVE)} inactivos · ${formatNumber(counts.SUSPENDED)} suspendidos`}
          icon={UserX}
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
            placeholder="Buscar por nombre, email o código (ej: FIT-0042)…"
            className="lg:max-w-xl"
          />

          <FilterPills
            options={filterOptions}
            value={status}
            onChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
          />

          <div className="flex items-center gap-2 lg:ml-auto">
            <Select
              aria-label="Ordenar clientes"
              value={sort}
              options={SORT_OPTIONS}
              onChange={(value) => {
                setSort(value as SortKey)
                setPage(1)
              }}
              className="w-full min-w-44"
            />

            <div className="flex items-center rounded-xl bg-surface-container-high p-1">
              <button
                type="button"
                aria-label="Vista de tarjetas"
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                className={
                  view === 'grid'
                    ? 'grid size-9 place-items-center rounded-lg bg-accent-strong text-accent-contrast'
                    : 'grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:text-ink'
                }
              >
                <LayoutGrid className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Vista de tabla"
                aria-pressed={view === 'table'}
                onClick={() => setView('table')}
                className={
                  view === 'table'
                    ? 'grid size-9 place-items-center rounded-lg bg-accent-strong text-accent-contrast'
                    : 'grid size-9 place-items-center rounded-lg text-ink-muted transition-colors hover:text-ink'
                }
              >
                <Table2 className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      {isPending ? (
        <Spinner label="Cargando clientes…" />
      ) : isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudo cargar el directorio"
          description={getApiErrorMessage(error)}
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={
            members.length === 0
              ? 'Aún no hay clientes registrados. Crea el primero para empezar.'
              : 'No hay clientes que coincidan con la búsqueda o los filtros seleccionados.'
          }
          action={
            members.length === 0 ? (
              <Button onClick={openCreateModal}>
                <UserPlus className="size-5" aria-hidden />
                Añadir cliente
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : view === 'grid' ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </section>
      ) : (
        <MemberTable
          members={visibleMembers}
          isLoading={false}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      {!isPending && !isError && filteredMembers.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={filteredMembers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="clientes"
        />
      )}

      <MemberFormModal
        open={modalOpen}
        member={editingMember}
        onClose={closeModal}
        onSuccess={showToast}
      />

      <ConfirmDialog
        open={deletingMember !== null}
        title="Desactivar cliente"
        description={
          deletingMember
            ? `¿Desactivar a ${deletingMember.full_name}? El historial contable se conservará.`
            : ''
        }
        confirmLabel="Desactivar"
        tone="danger"
        isLoading={deleteMember.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingMember(null)}
      />

      <Toast message={toast?.message ?? null} variant={toast?.variant} onClose={clearToast} />
    </div>
  )
}
