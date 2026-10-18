import { Link } from 'react-router-dom'

interface PageBreadcrumbProps {
  title: string
  current: string
}

export function PageBreadcrumb({ title, current }: PageBreadcrumbProps) {
  return (
    <section
      className="relative flex min-h-[24rem] items-center bg-cover bg-center pt-20 pb-24"
      style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}
      data-aos="fade-in"
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-white md:text-6xl">{title}</h1>
        <div className="space-x-2 text-lg text-white">
          <Link to="/" className="transition-all hover:underline">
            Inicio
          </Link>
          <span>&gt;</span>
          <span className="text-tertiary">{current}</span>
        </div>
      </div>
    </section>
  )
}
