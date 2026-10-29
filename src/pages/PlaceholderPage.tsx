import { Construction } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

interface PlaceholderPageProps {
  title: string
  description?: string
}

/**
 * Página provisional para las secciones aún no implementadas.
 * Reemplazar por el módulo real a medida que se desarrolle cada feature.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader eyebrow="Módulo" title={title} description={description} />
      <EmptyState
        icon={Construction}
        title="Módulo en construcción"
        description={description ?? 'Esta sección se implementará próximamente.'}
      />
    </div>
  )
}
