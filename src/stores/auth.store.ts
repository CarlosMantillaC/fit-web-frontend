import { create } from 'zustand'

import { getCurrentUser, login as loginRequest } from '@/api/auth'
import { tokenStorage } from '@/lib/tokens'
import type { LoginCredentials, User } from '@/types/api'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: User | null
  status: AuthStatus
  /** Inicia sesión y persiste los tokens JWT. */
  login: (credentials: LoginCredentials) => Promise<void>
  /** Cierra sesión y limpia los tokens. */
  logout: () => void
  /** Restaura la sesión al arrancar la app usando el token guardado. */
  bootstrap: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  async login(credentials) {
    const { access, refresh, user } = await loginRequest(credentials)
    tokenStorage.set({ access, refresh })
    set({ user, status: 'authenticated' })
  },

  logout() {
    tokenStorage.clear()
    set({ user: null, status: 'unauthenticated' })
  },

  async bootstrap() {
    if (!tokenStorage.getAccess()) {
      set({ user: null, status: 'unauthenticated' })
      return
    }
    set({ status: 'loading' })
    try {
      const user = await getCurrentUser()
      set({ user, status: 'authenticated' })
    } catch {
      tokenStorage.clear()
      set({ user: null, status: 'unauthenticated' })
    }
  },

  setUser(user) {
    set({ user })
  },
}))
