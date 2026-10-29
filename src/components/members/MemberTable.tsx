import { Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { formatDate, memberCode } from '@/lib/format'
import { GENDER_LABEL, MEMBER_STATUS_BADGE, MEMBER_STATUS_LABEL } from '@/lib/members'
import type { Member } from '@/types/api'

interface MemberTableProps {
  members: Member[]
  isLoading: boolean
  onEdit: (member: Member) => void
  onDelete: (member: Member) => void
  emptyState?: ReactNode
}

export function MemberTable({
  members,
  isLoading,
  onEdit,
  onDelete,
  emptyState,
}: MemberTableProps) {
  const columns: DataTableColumn<Member>[] = [
    {
      key: 'member',
      header: 'Cliente',
      render: (member) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={member.full_name}
            size="sm"
            status={member.status === 'ACTIVE' ? 'online' : 'offline'}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{member.full_name}</p>
            <p className="truncate text-xs text-ink-muted">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Código',
      render: (member) => (
        <span className="font-label text-xs font-semibold tracking-wider text-ink-muted">
          {memberCode(member.id)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (member) => (
        <Badge variant={MEMBER_STATUS_BADGE[member.status]}>
          {MEMBER_STATUS_LABEL[member.status]}
        </Badge>
      ),
    },
    {
      key: 'gender',
      header: 'Género',
      render: (member) => <span className="text-ink-muted">{GENDER_LABEL[member.gender ?? '']}</span>,
    },
    {
      key: 'created_at',
      header: 'Alta',
      render: (member) => <span className="text-ink-muted">{formatDate(member.created_at)}</span>,
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (member) => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={Pencil}
            label="Editar cliente"
            className="size-9"
            onClick={() => onEdit(member)}
          />
          <IconButton
            icon={Trash2}
            label="Desactivar cliente"
            variant="danger"
            className="size-9"
            onClick={() => onDelete(member)}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={members}
      getRowKey={(member) => member.id}
      isLoading={isLoading}
      emptyState={emptyState}
    />
  )
}
