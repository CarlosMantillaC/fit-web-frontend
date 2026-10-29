import { useEffect, useState } from 'react'

import type { ToastVariant } from '@/components/ui/Toast'

export interface ToastState {
  message: string
  variant: ToastVariant
}

/** Gestiona una notificación temporal con autocierre. */
export function useToast(duration = 4000) {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), duration)
    return () => window.clearTimeout(timeout)
  }, [toast, duration])

  function showToast(message: string, variant: ToastVariant = 'success') {
    setToast({ message, variant })
  }

  return { toast, showToast, clearToast: () => setToast(null) }
}
