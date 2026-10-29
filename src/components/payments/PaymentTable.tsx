import { Eye } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable'
import { IconButton } from '@/components/ui/IconButton'
import { formatCurrency, formatDateTime } from '@/lib/format'
import {
  PAYMENT_METHOD_BADGE,
  PAYMENT_METHOD_LABEL,
  paymentCode,
} from '@/lib/payments'
import type { Payment } from '@/types/api'

interface PaymentTableProps {
  payments: Payment[]
  isLoading: boolean
  onOpen: (payment: Payment) => void
}

export function PaymentTable({ payments, isLoading, onOpen }: PaymentTableProps) {
  const columns: DataTableColumn<Payment>[] = [
    {
      key: 'receipt',
      header: 'Recibo',
      render: (payment) => (
        <span className="font-label text-xs font-bold tracking-wider text-accent">
          {paymentCode(payment.id)}
        </span>
      ),
    },
    {
      key: 'member',
      header: 'Cliente',
      render: (payment) => {
        const member = payment.membership_details.member_details
        return (
          <div className="flex items-center gap-3">
            <Avatar name={member.full_name} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{member.full_name}</p>
              <p className="truncate text-xs text-ink-muted">{member.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (payment) => (
        <span className="text-ink-muted">{payment.membership_details.plan_details.name}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Importe',
      render: (payment) => (
        <span className="font-heading font-bold text-ink">
          {formatCurrency(Number(payment.amount))}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Método',
      render: (payment) => (
        <Badge variant={PAYMENT_METHOD_BADGE[payment.method]}>
          {PAYMENT_METHOD_LABEL[payment.method]}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (payment) => (
        <span className="text-ink-muted">{formatDateTime(payment.payment_date)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (payment) => (
        <div className="flex justify-end">
          <IconButton
            icon={Eye}
            label="Ver detalle del cobro"
            className="size-9"
            onClick={() => onOpen(payment)}
          />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={payments}
      getRowKey={(payment) => payment.id}
      isLoading={isLoading}
    />
  )
}
