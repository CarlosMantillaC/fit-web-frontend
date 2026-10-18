import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  className?: string
}

export function SectionHeading({ eyebrow, title, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-12 text-center', className)}>
      <span className="text-tertiary font-semibold uppercase">{eyebrow}</span>
      <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{title}</h2>
    </div>
  )
}
