import { Pencil, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { daysUntil, formatCurrency, formatDate } from '@/lib/format'
import {
  membershipBadgeLabel,
  membershipBadgeVariant,
} from '@/lib/memberships'
import type { Membership } from '@/types/api'

interface MembershipTableProps {
  memberships: Membership[]
  isLoading: boolean
  onRenew: (membership: Membership) => void
  onStatus: (membership: Membership) => void
}

function remainingLabel(membership: Membership): string {
  if (membership.status === 'CANCELLED') return '—'
  const remaining = daysUntil(membership.end_date)
  if (remaining === null) return '—'
  if (remaining > 1) return `${remaining} días`
  if (remaining === 1) return '1 día'
  if (remaining === 0) return 'Vence hoy'
  return `Vencida hace ${Math.abs(remaining)} días`
}

export function MembershipTable({
  memberships,
  isLoading,
  onRenew,
  onStatus,
}: MembershipTableProps) {
  const columns: DataTableColumn<Membership>[] = [
    {
      key: 'member',
      header: 'Cliente',
      render: (membership) => {
        const member = membership.member_details
        return (
          <div className="flex items-center gap-3">
            <Avatar
              name={member.full_name}
              size="sm"
              status={membership.is_valid ? 'online' : 'offline'}
            />
            <div className="min-w-0">
              <Link
                to={`/app/members?q=${encodeURIComponent(member.full_name)}`}
                className="block truncate font-semibold text-ink hover:text-accent"
              >
                {member.full_name}
              </Link>
              <p className="truncate text-xs text-ink-muted">{member.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (membership) => (
        <div>
          <p className="font-semibold text-ink">{membership.plan_details.name}</p>
          <p className="text-xs text-ink-muted">
            {formatCurrency(Number(membership.plan_details.price))}
          </p>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Periodo',
      render: (membership) => (
        <div className="text-ink-muted">
          <p className="text-sm text-ink">{formatDate(membership.start_date)}</p>
          <p className="text-xs">hasta {formatDate(membership.end_date)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (membership) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={membershipBadgeVariant(membership)}>
            {membershipBadgeLabel(membership)}
          </Badge>
          <span className="text-[11px] text-ink-muted">{remainingLabel(membership)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (membership) => (
        <div className="flex justify-end gap-2">
          <IconButton
            icon={RefreshCw}
            label="Renovar membresía"
            className="size-9"
            onClick={() => onRenew(membership)}
          />
          <IconButton
            icon={Pencil}
            label="Cambiar estado"
            className="size-9"
            onClick={() => onStatus(membership)}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={memberships}
      getRowKey={(membership) => membership.id}
      isLoading={isLoading}
    />
  )
}
