import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/format'

type PageItem = number | 'ellipsis'

function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const items: PageItem[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)

  if (start > 2) items.push('ellipsis')

  for (let current = start; current <= end; current += 1) {
    items.push(current)
  }

  if (end < pageCount - 1) items.push('ellipsis')

  items.push(pageCount)
  return items
}

interface PaginationProps {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  itemLabel = 'registros',
  className,
}: PaginationProps) {
  const safePageCount = Math.max(1, pageCount)
  const currentPage = Math.min(Math.max(1, page), safePageCount)
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  return (
    <footer
      className={cn(
        'mt-6 flex w-full flex-col items-center justify-between gap-4 border-t border-line pt-5 md:flex-row',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <span>Mostrando</span>
        <span className="font-label font-bold text-ink">{formatNumber(from)}</span>
        <span>–</span>
        <span className="font-label font-bold text-ink">{formatNumber(to)}</span>
        <span>
          de <strong className="text-ink">{formatNumber(total)}</strong> {itemLabel}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="grid size-11 place-items-center rounded-xl bg-surface-container text-ink transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        {getPageItems(currentPage, safePageCount).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="w-7 text-center font-bold text-ink-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                'font-label grid size-11 place-items-center rounded-xl text-sm font-semibold transition-colors',
                item === currentPage
                  ? 'bg-accent-strong text-accent-contrast shadow-md'
                  : 'bg-surface-container text-ink hover:bg-surface-container-high',
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Página siguiente"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === safePageCount}
          className="grid size-11 place-items-center rounded-xl bg-surface-container text-ink transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </footer>
  )
}
