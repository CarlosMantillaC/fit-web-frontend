import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string | number | null
  onChange: (value: string) => void
  onBlur?: () => void
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  id?: string
  name?: string
  className?: string
  'aria-label'?: string
}

export function Select({
  options,
  value,
  onChange,
  onBlur,
  label,
  error,
  hint,
  placeholder = 'Selecciona una opción…',
  disabled = false,
  searchable,
  id,
  name,
  className,
  'aria-label': ariaLabel,
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listId = `${selectId}-listbox`

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  const selectedOption = options.find((option) => String(option.value) === String(value ?? ''))
  const showSearch = searchable ?? options.length > 7

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options

    return options.filter((option) =>
      `${option.label} ${option.description ?? ''}`.toLowerCase().includes(term),
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
        setActiveIndex(-1)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open && showSearch) searchRef.current?.focus()
  }, [open, showSearch])

  function closeMenu() {
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  function openMenu() {
    if (disabled) return

    const currentIndex = options.findIndex(
      (option) => String(option.value) === String(value ?? ''),
    )
    setOpen(true)
    setQuery('')
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0)
  }

  function toggleMenu() {
    if (open) {
      closeMenu()
      return
    }
    openMenu()
  }

  function handleSelect(option: SelectOption) {
    if (option.disabled) return
    onChange(String(option.value))
    onBlur?.()
    closeMenu()
    buttonRef.current?.focus()
  }

  function moveActive(delta: number) {
    if (filteredOptions.length === 0) return

    let next = activeIndex
    for (let step = 0; step < filteredOptions.length; step += 1) {
      next = (next + delta + filteredOptions.length) % filteredOptions.length
      if (!filteredOptions[next].disabled) {
        setActiveIndex(next)
        return
      }
    }
  }

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) openMenu()
      else moveActive(1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) openMenu()
      else moveActive(-1)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        openMenu()
        return
      }
      const option = filteredOptions[activeIndex]
      if (option) handleSelect(option)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
      buttonRef.current?.focus()
      return
    }

    if (event.key === 'Tab') closeMenu()
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="font-label block text-xs font-medium text-ink-muted">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          role="combobox"
          name={name}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onClick={toggleMenu}
          onKeyDown={handleKeyboard}
          className={cn(
            'font-label flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-surface-container-low px-3 text-left text-sm text-ink transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55',
            error
              ? 'border-danger/80 focus:border-danger focus:ring-danger/25'
              : 'border-line-hover hover:border-outline/60 focus:border-accent-strong focus:ring-accent-strong/20',
            open && !error && 'border-accent-strong ring-2 ring-accent-strong/20',
          )}
        >
          <span
            className={cn(
              'min-w-0 truncate',
              selectedOption ? 'text-ink' : 'text-ink-muted/60',
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-ink-muted transition-transform duration-200',
              open && 'rotate-180 text-accent',
            )}
            aria-hidden
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface-container shadow-2xl">
            {showSearch && (
              <div className="border-b border-line p-2">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
                    aria-hidden
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      setActiveIndex(0)
                    }}
                    onKeyDown={handleKeyboard}
                    placeholder="Buscar…"
                    autoComplete="off"
                    className="h-9 w-full rounded-lg border border-line-hover bg-surface-container-low pr-2 pl-8 text-sm text-ink transition-colors placeholder:text-ink-muted/60 hover:border-outline/60 focus:border-accent-strong focus:ring-2 focus:ring-accent-strong/20 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <ul
              id={listId}
              role="listbox"
              aria-label={ariaLabel ?? label ?? 'Opciones'}
              className="max-h-64 overflow-y-auto p-1"
            >
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-ink-muted">
                  Sin coincidencias
                </li>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = String(option.value) === String(value ?? '')
                  const isActive = index === activeIndex

                  return (
                    <li key={String(option.value)} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={option.disabled}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                          isActive && 'bg-surface-container-high',
                          isSelected && 'text-accent',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="block truncate text-xs text-ink-muted">
                              {option.description}
                            </span>
                          )}
                        </span>
                        {isSelected && <Check className="size-4 shrink-0" aria-hidden />}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-ink-muted/70">{hint}</p>
      )}
    </div>
  )
}
