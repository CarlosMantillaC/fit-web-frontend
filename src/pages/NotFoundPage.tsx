import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
      <p className="text-brand-500 text-6xl font-bold">404</p>
      <h1 className="text-xl font-semibold text-white">Página no encontrada</h1>
      <p className="text-sm text-slate-400">La ruta a la que intentas acceder no existe.</p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
