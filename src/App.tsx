import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'

import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

export function App() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    if (status === 'idle') void bootstrap()
  }, [status, bootstrap])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
