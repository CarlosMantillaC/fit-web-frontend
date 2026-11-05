import { Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useRef } from 'react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface QrCodeModalProps {
  open: boolean
  onClose: () => void
  value: string
  title: string
  description?: string
}

export function QrCodeModal({ open, onClose, value, title, description }: QrCodeModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  function handleDownload() {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-${value}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="size-4" aria-hidden />
            Descargar SVG
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div
          ref={containerRef}
          className="rounded-2xl bg-white p-4 shadow-md"
          aria-label={`Código QR ${value}`}
        >
          <QRCodeSVG value={value} size={220} level="M" marginSize={2} />
        </div>
        <p className="font-label text-center text-lg font-bold tracking-[0.2em] text-ink">
          {value}
        </p>
        <p className="text-center text-xs text-ink-muted">
          Muestra este código en recepción para registrar tu entrada o salida.
        </p>
      </div>
    </Modal>
  )
}
