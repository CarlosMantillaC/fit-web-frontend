import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { FullPageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

/** Bloquea el acceso a rutas privadas si no hay sesión activa. */
export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <FullPageSpinner />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

/** Evita que un usuario ya autenticado vea las pantallas de acceso. */
export function GuestRoute() {
  const { status } = useAuth()

  if (status === 'idle' || status === 'loading') {
    return <FullPageSpinner />
  }

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
