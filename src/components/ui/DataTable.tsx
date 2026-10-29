import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  render?: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  isLoading?: boolean
  emptyState?: ReactNode
  className?: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (!isLoading && rows.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-surface-container shadow-sm',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-low">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'font-label px-4 py-3 text-[11px] font-semibold tracking-wider text-ink-muted uppercase',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-accent" aria-hidden />
                  <span className="mt-2 block text-sm text-ink-muted">Cargando datos…</span>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="transition-colors hover:bg-surface-container-high"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn('px-4 py-3 align-middle text-ink', column.className)}
                    >
                      {column.render ? column.render(row) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
