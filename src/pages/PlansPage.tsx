import {
  CircleAlert,
  CircleDollarSign,
  Plus,
  ScrollText,
  Ticket,
  CalendarClock,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { PlanCard } from '@/components/plans/PlanCard'
import { PlanFormModal } from '@/components/plans/PlanFormModal'
import { Badge } from '@/components/ui/Badge'
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
import { useAuth } from '@/hooks/useAuth'
import { useMembershipsQuery } from '@/hooks/useMemberships'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDeletePlan, usePlansQuery } from '@/hooks/usePlans'
import { useToast } from '@/hooks/useToast'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatNumber } from '@/lib/format'
import { isPlanActive, planPrice } from '@/lib/plans'
import type { Plan } from '@/types/api'

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'
type SortKey = 'price-asc' | 'price-desc' | 'name' | 'duration'

const PAGE_SIZE = 6

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'price-asc', label: 'Precio (menor a mayor)' },
  { value: 'price-desc', label: 'Precio (mayor a menor)' },
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'duration', label: 'Duración (menor a mayor)' },
]

function sortPlans(plans: Plan[], sort: SortKey): Plan[] {
  return [...plans].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'es')
    if (sort === 'duration') return a.duration_days - b.duration_days
    const diff = planPrice(a) - planPrice(b)
    return sort === 'price-asc' ? diff : -diff
  })
}

export function PlansPage() {
  usePageTitle('Planes · FitWeb Pro', 'Catálogo de planes y tarifas del gimnasio.')

  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'

  const { data: plans = [], isPending, isError, error, refetch } = usePlansQuery()
  const { data: memberships = [] } = useMembershipsQuery()
  const deletePlan = useDeletePlan()
  const { toast, showToast, clearToast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [sort, setSort] = useState<SortKey>('price-asc')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)

  const subscriptionsByPlan = useMemo(() => {
    const map = new Map<number, number>()
    for (const membership of memberships) {
      map.set(membership.plan, (map.get(membership.plan) ?? 0) + 1)
    }
    return map
  }, [memberships])

  const counts = useMemo(
    () =>
      plans.reduce(
        (acc, plan) => {
          acc.ALL += 1
          acc[isPlanActive(plan) ? 'ACTIVE' : 'INACTIVE'] += 1
          return acc
        },
        { ALL: 0, ACTIVE: 0, INACTIVE: 0 } as Record<StatusFilter, number>,
      ),
    [plans],
  )

  const averagePrice = useMemo(
    () => (plans.length > 0 ? plans.reduce((sum, plan) => sum + planPrice(plan), 0) / plans.length : 0),
    [plans],
  )

  const validSubscriptions = useMemo(
    () => memberships.filter((membership) => membership.is_valid).length,
    [memberships],
  )

  const filteredPlans = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = plans.filter((plan) => {
      const matchesStatus =
        status === 'ALL' || (status === 'ACTIVE' ? isPlanActive(plan) : !isPlanActive(plan))
      if (!matchesStatus) return false
      if (!term) return true

      return [plan.name, plan.description ?? ''].join(' ').toLowerCase().includes(term)
    })

    return sortPlans(result, sort)
  }, [plans, status, debouncedQuery, sort])

  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visiblePlans = filteredPlans.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const filterOptions: FilterOption<StatusFilter>[] = [
    { value: 'ALL', label: 'Todos', count: counts.ALL },
    { value: 'ACTIVE', label: 'Activos', count: counts.ACTIVE },
    { value: 'INACTIVE', label: 'Inactivos', count: counts.INACTIVE },
  ]

  function openCreateModal() {
    setEditingPlan(null)
    setModalOpen(true)
  }

  function openEditModal(plan: Plan) {
    setEditingPlan(plan)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPlan(null)
  }

  function handleDelete(plan: Plan) {
    setDeletingPlan(plan)
  }

  function confirmDelete() {
    if (!deletingPlan) return

    deletePlan.mutate(deletingPlan.id, {
      onSuccess: () => {
        showToast('Plan eliminado correctamente.')
        setDeletingPlan(null)
      },
      onError: (mutationError) => {
        showToast(getApiErrorMessage(mutationError), 'error')
        setDeletingPlan(null)
      },
    })
  }

  function clearFilters() {
    setQuery('')
    setStatus('ALL')
    setPage(1)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Catálogo comercial"
        title="Planes y tarifas"
        description="Define precios, duraciones y disponibilidad de cada plan."
        actions={
          canManage ? (
            <Button onClick={openCreateModal}>
              <Plus className="size-5" aria-hidden />
              Nuevo plan
            </Button>
          ) : (
            <Badge variant="neutral">Solo lectura</Badge>
          )
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Planes totales"
          value={formatNumber(counts.ALL)}
          hint={`${formatNumber(counts.ACTIVE)} activos · ${formatNumber(counts.INACTIVE)} inactivos`}
          icon={ScrollText}
        />
        <StatCard
          label="Planes activos"
          value={formatNumber(counts.ACTIVE)}
          hint="Disponibles para asignar"
          icon={Ticket}
          progress={counts.ALL > 0 ? Math.round((counts.ACTIVE / counts.ALL) * 100) : 0}
        />
        <StatCard
          label="Precio medio"
          value={formatCurrency(averagePrice)}
          hint="Media del catálogo"
          icon={CircleDollarSign}
        />
        <StatCard
          label="Suscripciones vigentes"
          value={formatNumber(validSubscriptions)}
          hint={`${formatNumber(memberships.length)} membresías registradas`}
          icon={CalendarClock}
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
            placeholder="Buscar plan por nombre o descripción…"
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
            aria-label="Ordenar planes"
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) => {
              setSort(value as SortKey)
              setPage(1)
            }}
            className="w-full lg:ml-auto lg:max-w-60"
          />
        </div>
      </section>

      {isPending ? (
        <Spinner label="Cargando planes…" />
      ) : isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudo cargar el catálogo"
          description={getApiErrorMessage(error)}
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : filteredPlans.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={
            plans.length === 0
              ? 'Aún no hay planes creados. Añade el primero para empezar a vender membresías.'
              : 'No hay planes que coincidan con la búsqueda o los filtros.'
          }
          action={
            plans.length === 0 ? (
              canManage ? (
                <Button onClick={openCreateModal}>
                  <Plus className="size-5" aria-hidden />
                  Nuevo plan
                </Button>
              ) : undefined
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              subscriptions={subscriptionsByPlan.get(plan.id) ?? 0}
              canManage={canManage}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      {!isPending && !isError && filteredPlans.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={filteredPlans.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="planes"
        />
      )}

      <PlanFormModal
        open={modalOpen}
        plan={editingPlan}
        onClose={closeModal}
        onSuccess={showToast}
      />

      <ConfirmDialog
        open={deletingPlan !== null}
        title="Eliminar plan"
        description={
          deletingPlan
            ? `¿Eliminar el plan "${deletingPlan.name}"? Esta acción no se puede deshacer. Si tiene membresías asociadas, el backend impedirá borrarlo; en ese caso desactívalo en su lugar.`
            : ''
        }
        confirmLabel="Eliminar plan"
        tone="danger"
        isLoading={deletePlan.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingPlan(null)}
      />

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={clearToast}
      />
    </div>
  )
}
