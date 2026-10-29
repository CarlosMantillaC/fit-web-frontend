import { Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative flex-1', className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-line-hover bg-surface-container-low pr-10 pl-11 text-sm text-ink transition-all placeholder:text-ink-muted/60 hover:border-outline/60 focus:border-accent-strong focus:ring-2 focus:ring-accent-strong/20 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-container hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
