import { Pencil, Trash2 } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { ROLE_BADGE, ROLE_LABEL, userDisplayName } from '@/lib/users'
import type { User } from '@/types/api'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  currentUserId?: number
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserTable({
  users,
  isLoading,
  currentUserId,
  onEdit,
  onDelete,
}: UserTableProps) {
  const columns: DataTableColumn<User>[] = [
    {
      key: 'user',
      header: 'Usuario',
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={userDisplayName(user)}
            size="sm"
            status={user.is_active === false ? 'offline' : 'online'}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-ink">{userDisplayName(user)}</p>
              {user.id === currentUserId && <Badge variant="neutral">Tú</Badge>}
            </div>
            <p className="truncate text-xs text-ink-muted">@{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <span className="text-ink-muted">{user.email || '—'}</span>,
    },
    {
      key: 'role',
      header: 'Rol',
      render: (user) =>
        user.role ? (
          <Badge variant={ROLE_BADGE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
        ) : (
          <Badge variant="neutral">Sin rol</Badge>
        ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (user) => (
        <Badge variant={user.is_active === false ? 'inactive' : 'active'}>
          {user.is_active === false ? 'Inactivo' : 'Activo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (user) => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={Pencil}
            label="Editar usuario"
            className="size-9"
            onClick={() => onEdit(user)}
          />
          <IconButton
            icon={Trash2}
            label={
              user.id === currentUserId
                ? 'No puedes eliminar tu propia cuenta'
                : 'Eliminar usuario'
            }
            variant="danger"
            className="size-9"
            disabled={user.id === currentUserId}
            onClick={() => onDelete(user)}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={users}
      getRowKey={(user) => user.id}
      isLoading={isLoading}
    />
  )
}
