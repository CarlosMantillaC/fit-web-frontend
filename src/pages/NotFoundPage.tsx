import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-center">
      <p className="font-heading text-6xl font-extrabold text-accent">404</p>
      <h1 className="font-heading text-xl font-semibold text-ink">Página no encontrada</h1>
      <p className="text-sm text-ink-muted">
        La ruta a la que intentas acceder no existe.
      </p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
