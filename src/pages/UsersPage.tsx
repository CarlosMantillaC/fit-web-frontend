import {
  CircleAlert,
  Dumbbell,
  Plus,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
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
import { UserFormModal } from '@/components/users/UserFormModal'
import { UserTable } from '@/components/users/UserTable'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { useDeleteUser, useUsersQuery } from '@/hooks/useUsers'
import { formatNumber } from '@/lib/format'
import { ROLE_LABEL, ROLE_OPTIONS, userDisplayName } from '@/lib/users'
import type { Role, User } from '@/types/api'

type RoleFilter = 'ALL' | Role
type SortKey = 'name' | 'username' | 'role'

const PAGE_SIZE = 8

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Nombre (A-Z)' },
  { value: 'username', label: 'Usuario (A-Z)' },
  { value: 'role', label: 'Rol' },
]

function sortUsers(users: User[], sort: SortKey): User[] {
  return [...users].sort((a, b) => {
    if (sort === 'username') return a.username.localeCompare(b.username, 'es')
    if (sort === 'role') return (a.role ?? '').localeCompare(b.role ?? '', 'es')
    return userDisplayName(a).localeCompare(userDisplayName(b), 'es')
  })
}

export function UsersPage() {
  usePageTitle('Usuarios · FitWeb Pro', 'Cuentas y permisos del personal del gimnasio.')

  const { user: currentUser, setUser } = useAuth()
  const isAdmin = currentUser?.role === 'ADMIN'

  const { data: users = [], isPending, isError, error, refetch } = useUsersQuery(isAdmin)
  const deleteUser = useDeleteUser()
  const { toast, showToast, clearToast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [role, setRole] = useState<RoleFilter>('ALL')
  const [sort, setSort] = useState<SortKey>('name')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const counts = useMemo(
    () =>
      users.reduce(
        (acc, item) => {
          acc.ALL += 1
          if (item.role) acc[item.role] += 1
          return acc
        },
        { ALL: 0, ADMIN: 0, RECEPTIONIST: 0, COACH: 0 } as Record<RoleFilter, number>,
      ),
    [users],
  )

  const activeUsers = users.filter((item) => item.is_active !== false).length

  const filteredUsers = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = users.filter((item) => {
      if (role !== 'ALL' && item.role !== role) return false
      if (!term) return true

      return [userDisplayName(item), item.username, item.email ?? '', item.role ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term)
    })

    return sortUsers(result, sort)
  }, [users, role, debouncedQuery, sort])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const filterOptions: FilterOption<RoleFilter>[] = [
    { value: 'ALL', label: 'Todos', count: counts.ALL },
    ...ROLE_OPTIONS.map((option) => ({
      value: option.value,
      label: ROLE_LABEL[option.value],
      count: counts[option.value],
    })),
  ]

  if (!isAdmin) {
    return (
      <div>
        <PageHeader
          eyebrow="Seguridad"
          title="Usuarios"
          description="Administración de cuentas y permisos del personal."
        />
        <EmptyState
          icon={ShieldAlert}
          title="Acceso restringido"
          description="Solo los administradores pueden gestionar las cuentas del personal. Contacta con un administrador si necesitas cambios."
        />
      </div>
    )
  }

  function openCreateModal() {
    setEditingUser(null)
    setModalOpen(true)
  }

  function openEditModal(user: User) {
    setEditingUser(user)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingUser(null)
  }

  function confirmDelete() {
    if (!deletingUser) return

    deleteUser.mutate(deletingUser.id, {
      onSuccess: () => {
        showToast('Usuario eliminado correctamente.')
        setDeletingUser(null)
      },
      onError: (mutationError) => {
        showToast(getApiErrorMessage(mutationError), 'error')
        setDeletingUser(null)
      },
    })
  }

  function clearFilters() {
    setQuery('')
    setRole('ALL')
    setPage(1)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Seguridad y accesos"
        title="Usuarios"
        description="Gestiona las cuentas del personal y sus permisos."
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="size-5" aria-hidden />
            Nuevo usuario
          </Button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Usuarios totales"
          value={formatNumber(counts.ALL)}
          hint={`${formatNumber(activeUsers)} cuentas activas`}
          icon={Users}
        />
        <StatCard
          label="Administradores"
          value={formatNumber(counts.ADMIN)}
          hint="Acceso completo al sistema"
          icon={ShieldCheck}
        />
        <StatCard
          label="Recepción"
          value={formatNumber(counts.RECEPTIONIST)}
          hint="Operación diaria del gimnasio"
          icon={UserCheck}
        />
        <StatCard
          label="Entrenadores"
          value={formatNumber(counts.COACH)}
          hint="Cuentas con rol técnico"
          icon={Dumbbell}
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
            placeholder="Buscar por nombre, usuario o email…"
            className="lg:max-w-md"
          />

          <FilterPills
            options={filterOptions}
            value={role}
            onChange={(value) => {
              setRole(value)
              setPage(1)
            }}
          />

          <Select
            aria-label="Ordenar usuarios"
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
        <Spinner label="Cargando usuarios…" />
      ) : isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudieron cargar los usuarios"
          description={getApiErrorMessage(error)}
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={
            users.length === 0
              ? 'Aún no hay usuarios registrados. Crea la primera cuenta del equipo.'
              : 'No hay usuarios que coincidan con la búsqueda o el filtro.'
          }
          action={
            users.length === 0 ? (
              <Button onClick={openCreateModal}>
                <Plus className="size-5" aria-hidden />
                Nuevo usuario
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <UserTable
          users={visibleUsers}
          isLoading={false}
          currentUserId={currentUser?.id}
          onEdit={openEditModal}
          onDelete={setDeletingUser}
        />
      )}

      {!isPending && !isError && filteredUsers.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={filteredUsers.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="usuarios"
        />
      )}

      <UserFormModal
        open={modalOpen}
        user={editingUser}
        currentUserId={currentUser?.id}
        onClose={closeModal}
        onSuccess={showToast}
        onSelfUpdated={setUser}
      />

      <ConfirmDialog
        open={deletingUser !== null}
        title="Eliminar usuario"
        description={
          deletingUser
            ? `¿Eliminar la cuenta de ${userDisplayName(deletingUser)} (@${deletingUser.username})? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar usuario"
        tone="danger"
        isLoading={deleteUser.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeletingUser(null)}
      />

      <Toast
        message={toast?.message ?? null}
        variant={toast?.variant}
        onClose={clearToast}
      />
    </div>
  )
}
