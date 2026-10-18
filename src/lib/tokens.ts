/**
 * Fuente única de verdad para los tokens JWT.
 *
 * Vive fuera del store de Zustand a propósito: así el cliente HTTP (`api`)
 * puede leer/escribir tokens sin crear una dependencia circular con el store.
 */
const ACCESS_KEY = 'fit-web.access'
const REFRESH_KEY = 'fit-web.refresh'

const isBrowser = typeof window !== 'undefined'

export const tokenStorage = {
  getAccess(): string | null {
    return isBrowser ? window.localStorage.getItem(ACCESS_KEY) : null
  },
  getRefresh(): string | null {
    return isBrowser ? window.localStorage.getItem(REFRESH_KEY) : null
  },
  set(tokens: { access: string; refresh: string }): void {
    if (!isBrowser) return
    window.localStorage.setItem(ACCESS_KEY, tokens.access)
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh)
  },
  clear(): void {
    if (!isBrowser) return
    window.localStorage.removeItem(ACCESS_KEY)
    window.localStorage.removeItem(REFRESH_KEY)
  },
}
