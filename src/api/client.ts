import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { tokenStorage } from '@/lib/tokens'
import type { RefreshResponse } from '@/types/api'

/**
 * Instancia central de Axios.
 * - Adjunta el `access` token en cada petición.
 * - Ante un 401 intenta refrescar el token (una sola vez por request) y reintenta.
 * - Si el refresh falla, limpia la sesión y redirige al login.
 */
export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) throw new Error('No hay refresh token disponible')

  const { data } = await axios.post<RefreshResponse>(`${env.apiUrl}/auth/refresh/`, { refresh })
  tokenStorage.set({ access: data.access, refresh: data.refresh })
  return data.access
}

const AUTH_ROUTES = ['/auth/login/', '/auth/refresh/']

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const isUnauthorized = error.response?.status === 401
    const isAuthRoute = AUTH_ROUTES.some((route) => original?.url?.includes(route))

    if (isUnauthorized && original && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const access = await refreshPromise
        original.headers.Authorization = `Bearer ${access}`
        return api(original)
      } catch (refreshError) {
        tokenStorage.clear()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login')
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

/** Extrae un mensaje legible de un error de Axios. */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (data) {
      if (typeof data.detail === 'string') return data.detail
      if (typeof data.error === 'string') return data.error
      const firstValue = Object.values(data)[0]
      if (typeof firstValue === 'string') return firstValue
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0]
    }
    if (error.code === 'ECONNABORTED') return 'La petición tardó demasiado. Inténtalo de nuevo.'
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  return 'Ha ocurrido un error inesperado.'
}
