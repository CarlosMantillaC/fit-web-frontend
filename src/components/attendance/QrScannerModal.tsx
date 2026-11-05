import jsQR from 'jsqr'
import { CameraOff, Keyboard, ScanLine } from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface QrScannerModalProps {
  open: boolean
  onClose: () => void
  onDetected: (code: string) => void
}

export function QrScannerModal({ open, onClose, onDetected }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameRef = useRef<number | null>(null)
  const detectedRef = useRef(onDetected)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    detectedRef.current = onDetected
  }, [onDetected])

  useEffect(() => {
    if (!open) return

    let cancelled = false

    function stopCamera() {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    function scanFrame() {
      const video = videoRef.current
      const canvas = canvasRef.current

      if (!video || !canvas || cancelled) return

      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d', { willReadFrequently: true })

        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const result = jsQR(imageData.data, imageData.width, imageData.height)

          if (result?.data) {
            stopCamera()
            detectedRef.current(result.data.trim())
            return
          }
        }
      }

      frameRef.current = requestAnimationFrame(scanFrame)
    }

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Este dispositivo no soporta acceso a la cámara.')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current

        if (!video) return

        video.srcObject = stream
        await video.play()
        frameRef.current = requestAnimationFrame(scanFrame)
      } catch {
        if (!cancelled) {
          setCameraError(
            'No se pudo acceder a la cámara. Revisa los permisos o usa el código manual.',
          )
        }
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [open])

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    onDetected(code)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Escanear QR"
      description="Apunta la cámara al código de un cliente o entrenador. El sistema registra la entrada o salida automáticamente."
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            className="size-full object-cover"
            muted
            playsInline
            aria-label="Vista de la cámara"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative size-3/5 rounded-2xl border-2 border-accent-strong/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
              <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-accent-strong" />
            </div>
          </div>

          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
            <ScanLine className="size-3.5" aria-hidden />
            Cámara en vivo
          </span>
        </div>

        {cameraError && (
          <p className="flex items-start gap-2 rounded-lg bg-danger-soft/40 px-3 py-2 text-xs text-danger">
            <CameraOff className="mt-0.5 size-4 shrink-0" aria-hidden />
            {cameraError}
          </p>
        )}

        <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            label="Código manual"
            leadingIcon={Keyboard}
            placeholder="FIT-M-0001 o FIT-C-0003"
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            autoComplete="off"
            className="uppercase"
          />
          <Button type="submit" disabled={!manualCode.trim()} className="shrink-0">
            Registrar
          </Button>
        </form>

        <p className="text-xs text-ink-muted">
          Los QR de clientes empiezan por <strong>FIT-M-</strong> y los de entrenadores por{' '}
          <strong>FIT-C-</strong>.
        </p>
      </div>
    </Modal>
  )
}
