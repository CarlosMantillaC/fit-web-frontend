import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="font-label text-[11px] font-bold tracking-wider text-accent uppercase">
              {eyebrow}
            </span>
            <span className="size-1.5 rounded-full bg-accent-strong" />
          </div>
        )}
        <h1 className="font-heading mt-1 text-2xl font-bold text-ink md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </section>
  )
}
