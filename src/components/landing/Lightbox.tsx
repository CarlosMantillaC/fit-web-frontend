import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import type { GalleryImage } from '@/data/landing'

interface LightboxProps {
  image: GalleryImage
  onClose: () => void
}

export function Lightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={image.title}
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-[85vh] w-full rounded-lg object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar imagen"
          className="hover:bg-tertiary absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-black/60 text-white transition-colors"
        >
          <X className="size-6" aria-hidden />
        </button>
      </div>
    </div>,
    document.body,
  )
}
