import { useAuthStore } from '@/stores/auth.store'

/** Acceso tipado al estado de autenticación. */
export function useAuth() {
  return useAuthStore()
}
