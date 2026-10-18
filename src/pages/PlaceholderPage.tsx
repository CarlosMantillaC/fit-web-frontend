import { Construction } from 'lucide-react'

import { Card } from '@/components/ui/Card'

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <Card className="flex flex-col items-center gap-3 py-14 text-center">
        <Construction className="text-brand-500 size-10" aria-hidden />
        <p className="text-slate-300">Módulo en construcción</p>
        <p className="max-w-md text-sm text-slate-500">
          {description ?? 'Esta sección se implementará próximamente.'}
        </p>
      </Card>
    </div>
  )
}
