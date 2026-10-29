import {
  Banknote,
  CircleAlert,
  CircleDollarSign,
  Download,
  Plus,
  ReceiptText,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/api/client'
import { PaymentDetailModal } from '@/components/payments/PaymentDetailModal'
import { PaymentFormModal } from '@/components/payments/PaymentFormModal'
import { PaymentTable } from '@/components/payments/PaymentTable'
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
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePaymentsQuery } from '@/hooks/usePayments'
import { useToast } from '@/hooks/useToast'
import { useDebounce } from '@/hooks/useDebounce'
import { downloadCsv } from '@/lib/csv'
import { formatCurrency, formatDateTime, formatNumber, isCurrentMonth, todayIsoDate } from '@/lib/format'
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_OPTIONS,
  paymentCode,
} from '@/lib/payments'
import type { Payment, PaymentMethod } from '@/types/api'

type MethodFilter = 'ALL' | PaymentMethod
type PeriodFilter = 'month' | 'all'
type SortKey = 'recent' | 'oldest' | 'amount-desc'

const PAGE_SIZE = 8

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'amount-desc', label: 'Importe (mayor a menor)' },
]

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'month', label: 'Este mes' },
  { value: 'all', label: 'Todo el historial' },
]

function sortPayments(payments: Payment[], sort: SortKey): Payment[] {
  return [...payments].sort((a, b) => {
    if (sort === 'amount-desc') return Number(b.amount) - Number(a.amount)
    const diff =
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    return sort === 'recent' ? diff : -diff
  })
}

export function PaymentsPage() {
  usePageTitle('Pagos · FitWeb Pro', 'Cobros, métodos de pago e ingresos del gimnasio.')

  const { data: payments = [], isPending, isError, error, refetch } = usePaymentsQuery()
  const { toast, showToast, clearToast } = useToast()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 250)
  const [method, setMethod] = useState<MethodFilter>('ALL')
  const [period, setPeriod] = useState<PeriodFilter>('month')
  const [sort, setSort] = useState<SortKey>('recent')
  const [page, setPage] = useState(1)

  const [formOpen, setFormOpen] = useState(false)
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null)

  const monthPayments = useMemo(
    () => payments.filter((payment) => isCurrentMonth(payment.payment_date)),
    [payments],
  )

  const monthRevenue = useMemo(
    () => monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
    [monthPayments],
  )

  const monthCash = useMemo(
    () =>
      monthPayments
        .filter((payment) => payment.method === 'CASH')
        .reduce((sum, payment) => sum + Number(payment.amount), 0),
    [monthPayments],
  )

  const monthAverage = monthPayments.length > 0 ? monthRevenue / monthPayments.length : 0

  const periodPayments = useMemo(
    () => (period === 'month' ? monthPayments : payments),
    [period, monthPayments, payments],
  )

  const methodCounts = useMemo(() => {
    const base: Record<MethodFilter, number> = {
      ALL: periodPayments.length,
      CASH: 0,
      CARD: 0,
      TRANSFER: 0,
    }
    for (const payment of periodPayments) base[payment.method] += 1
    return base
  }, [periodPayments])

  const filteredPayments = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()

    const result = periodPayments.filter((payment) => {
      if (method !== 'ALL' && payment.method !== method) return false
      if (!term) return true

      const member = payment.membership_details.member_details
      const haystack = [
        member.full_name,
        member.email,
        payment.membership_details.plan_details.name,
        payment.notes ?? '',
        paymentCode(payment.id),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })

    return sortPayments(result, sort)
  }, [periodPayments, method, debouncedQuery, sort])

  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visiblePayments = filteredPayments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const filterOptions: FilterOption<MethodFilter>[] = [
    { value: 'ALL', label: 'Todos', count: methodCounts.ALL },
    ...PAYMENT_METHOD_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      count: methodCounts[option.value],
    })),
  ]

  function handleExport() {
    downloadCsv(
      `pagos-${todayIsoDate()}.csv`,
      filteredPayments.map((payment) => ({
        Recibo: paymentCode(payment.id),
        Cliente: payment.membership_details.member_details.full_name,
        Plan: payment.membership_details.plan_details.name,
        Importe: Number(payment.amount).toFixed(2),
        Metodo: PAYMENT_METHOD_LABEL[payment.method],
        Fecha: formatDateTime(payment.payment_date),
        Notas: payment.notes ?? '',
      })),
    )
  }

  function clearFilters() {
    setQuery('')
    setMethod('ALL')
    setPeriod('month')
    setPage(1)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Caja y facturación"
        title="Pagos"
        description="Registra cobros y consulta los ingresos del gimnasio."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={filteredPayments.length === 0}
            >
              <Download className="size-5 text-accent" aria-hidden />
              Exportar
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-5" aria-hidden />
              Registrar pago
            </Button>
          </>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos del mes"
          value={formatCurrency(monthRevenue)}
          hint={`${formatNumber(monthPayments.length)} cobros registrados`}
          icon={TrendingUp}
        />
        <StatCard
          label="Cobros del mes"
          value={formatNumber(monthPayments.length)}
          hint="Movimientos confirmados"
          icon={ReceiptText}
        />
        <StatCard
          label="Ticket medio"
          value={formatCurrency(monthAverage)}
          hint="Importe medio por cobro"
          icon={CircleDollarSign}
        />
        <StatCard
          label="Cobrado en efectivo"
          value={formatCurrency(monthCash)}
          hint="Este mes"
          icon={Banknote}
        />
      </section>

      <section className="mb-6 rounded-xl bg-surface-container p-4 shadow-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Buscar por cliente, plan, recibo o notas…"
            className="lg:max-w-sm"
          />

          <FilterPills
            options={filterOptions}
            value={method}
            onChange={(value) => {
              setMethod(value)
              setPage(1)
            }}
          />

          <div className="flex flex-col gap-2 sm:flex-row lg:ml-auto">
            <Select
              aria-label="Periodo de pagos"
              value={period}
              options={PERIOD_OPTIONS}
              onChange={(value) => {
                setPeriod(value as PeriodFilter)
                setPage(1)
              }}
              className="w-full sm:w-40"
            />
            <Select
              aria-label="Ordenar pagos"
              value={sort}
              options={SORT_OPTIONS}
              onChange={(value) => {
                setSort(value as SortKey)
                setPage(1)
              }}
              className="w-full sm:w-56"
            />
          </div>
        </div>
      </section>

      {isPending ? (
        <Spinner label="Cargando pagos…" />
      ) : isError ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudieron cargar los pagos"
          description={getApiErrorMessage(error)}
          action={<Button onClick={() => void refetch()}>Reintentar</Button>}
        />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={
            payments.length === 0
              ? 'Aún no hay cobros registrados. Registra el primero para empezar.'
              : 'No hay pagos que coincidan con la búsqueda o los filtros.'
          }
          action={
            payments.length === 0 ? (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="size-5" aria-hidden />
                Registrar pago
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <PaymentTable
          payments={visiblePayments}
          isLoading={false}
          onOpen={setDetailPayment}
        />
      )}

      {!isPending && !isError && filteredPayments.length > 0 && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          total={filteredPayments.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="pagos"
        />
      )}

      <PaymentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={showToast}
      />

      <PaymentDetailModal
        key={detailPayment?.id ?? 'none'}
        open={detailPayment !== null}
        payment={detailPayment}
        onClose={() => setDetailPayment(null)}
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
