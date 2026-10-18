import { useEffect } from 'react'

/** Actualiza el título y la meta descripción del documento. */
export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title

    if (!description) return
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) {
      meta.content = description
    }
  }, [title, description])
}
