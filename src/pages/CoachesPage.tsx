import { Award, CircleAlert, Dumbbell, FileText, Phone, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { CoachCard } from '@/components/coaches/CoachCard'
import { CoachFormModal } from '@/components/coaches/CoachFormModal'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { StatCard } from '@/components/ui/StatCard'
import { Toast } from '@/components/ui/Toast'
import { useCoachesQuery, useDeleteCoach } from '@/hooks/useCoaches'
import { useDebounce } from '@/hooks/useDebounce'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { coachFullName } from '@/lib/coaches'
import { formatNumber } from '@/lib/format'
import type { Coach } from '@/types/api'

type SortKey = 'name' | 'specialty' | 'recent'

const PAGE_SIZE = 6

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'specialty', label: 'Especialidad' },
  { value: 'recent', label: 'Más recientes' },
]

function sortCoaches(coaches: Coach[], sort: SortKey): Coach[] {
  return [...coaches].sort((a, b) => {
    if (sort === 'specialty') return a.specialty.localeCompare(b.specialty, 'es')
    if (sort === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return coachFullName(a).localeCompare(coachFullName(b), 'es')
  })
}

export function CoachesPage() {
  usePageTitle('Entrenadores · FitWeb Pro', 'Equipo técnico y especialidades del gimnasio.')

  const { data: coaches = [], isPending, isError, error, refetch } = useCoachesQuery()
  const deleteCoach = useDeleteCoach()
  const { toast, showToast, clearToast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [specialty, setSpecialty] = useState('ALL')
  const [sort, setSort] = useState<SortKey>('name')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [deletingCoach, setDeletingCoach] = useState<Coach | null>(null)

  const specialties = useMemo(
    () =>
      Array.from(new Set(coaches.map((coach) => coach.specialty))).sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [coaches],
  )

  const withPhone = coaches.filter((coach) => Boolean(coach.phone)).length
  const withBio = coaches.filter((coach) => Boolean(coach.bio?.trim())).length

  const filteredCoaches = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = coaches.filter((coach) => {
      if (specialty !== 'ALL' && coach.specialty !== specialty) return false
      if (!term) return true

      return [coachFullName(coach), coach.specialty, coach.phone ?? '', coach.bio ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term)
    })

    return sortCoaches(result, sort)
  }, [coaches, specialty, debouncedQuery, sort])

  const pageCount = Math.max(1, Math.ceil(filteredCoaches.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleCoaches = filteredCoaches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function openCreateModal() {
    setEditingCoach(null)
    setModalOpen(true)
  }

  function openEditModal(coach: Coach) {
    setEditingCoach(coach)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingCoach(null)
  }

  function confirmDelete() {
    if (!deletingCoach) return

    deleteCoach.mutate(deletingCoach.id, {
      onSuccess: () => {
        showToast(`${coachFullName(deletingCoach)} desactivado del equipo.`)
        setDeletingCoach(null)
      },
      onError: (mutationError) => {
        showToast(getApiErrorMessage(mutationError), 'error')
        setDeletingCoach(null)
      },
    })
  }

  function clearFilters() {
    setQuery('')
    setSpecialty('ALL')
    setPage(1)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Equipo técnico"
        title="Entrenadores"
        description="Gestiona el equipo, sus especialidades y datos de contacto."
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="size-5" aria-hidden />
            Nuevo entrenador
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Entrenadores activos"
          value={formatNumber(coaches.length)}
          hint="En plantilla actualmente"
          icon={Dumbbell}
        />
        <StatCard
          label="Especialidades"
          value={formatNumber(specialties.length)}
          hint="Disciplinas cubiertas"
          icon={Award}
        />
        <StatCard
          label="Con teléfono"
          value={formatNumber(withPhone)}
          hint="Contacto directo disponible"
          icon={Phone}
          progress={coaches.length > 0 ? Math.round((withPhone / coaches.length) * 100) : 0}
        />
        <StatCard
          label="Perfiles completos"
          value={formatNumber(withBio)}
          hint="Con biografía registrada"
          icon={FileText}
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
            placeholder="Buscar por nombre, especialidad o teléfono…"
            className="lg:max-w-md"
          />

          <Select
            aria-label="Filtrar por especialidad"
            value={specialty}
            options={[
              { value: 'ALL', label: 'Todas las especialidades' },
              ...specialties.map((item) => ({ value: item, label: item })),
            ]}
            onChange={(value) => {
              setSpecialty(value)
              setPage(1)
            }}
            className="w-full lg:max-w-52"
          />

          <Select
            aria-label="Ordenar entrenadores"
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
        <Spinner label="Cargando entrenadores…" />
      ) : isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudo cargar el equipo"
          description={getApiErrorMessage(error)}
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : filteredCoaches.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={
            coaches.length === 0
              ? 'Aún no hay entrenadores en el equipo. Añade el primero para empezar.'
              : 'No hay entrenadores que coincidan con la búsqueda o el filtro.'
          }
          action={
            coaches.length === 0 ? (
              <Button onClick={openCreateModal}>
                <Plus className="size-5" aria-hidden />
                Nuevo entrenador
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visibleCoaches.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              onEdit={openEditModal}
              onDelete={setDeletingCoach}
            />
          ))}
        </section>
      )}

      {!isPending && !isError && filteredCoaches.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={filteredCoaches.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="entrenadores"
        />
      )}

      <CoachFormModal
        open={modalOpen}
        coach={editingCoach}
        onClose={closeModal}
        onSuccess={showToast}
      />

      <ConfirmDialog
        open={deletingCoach !== null}
        title="Desactivar entrenador"
        description={
          deletingCoach
            ? `¿Desactivar a ${coachFullName(deletingCoach)}? Dejará de aparecer en el equipo activo, pero se conservará su historial.`
            : ''
        }
        confirmLabel="Desactivar"
        tone="danger"
        isLoading={deleteCoach.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingCoach(null)}
      />

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={clearToast}
      />
    </div>
  )
}
