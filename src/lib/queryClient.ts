import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar en errores de cliente (4xx).
        if (error instanceof AxiosError && error.response && error.response.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})
