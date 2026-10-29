import { CircleAlert } from 'lucide-react'

interface FormErrorProps {
  message: string
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-xl border border-danger-soft/60 bg-danger-soft/30 px-3 py-2.5 text-sm text-danger"
      role="alert"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  )
}
