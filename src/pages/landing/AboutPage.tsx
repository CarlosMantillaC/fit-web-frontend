import { Dumbbell, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageBreadcrumb } from '@/components/landing/PageBreadcrumb'
import { missionCards } from '@/data/landing'
import { usePageTitle } from '@/hooks/usePageTitle'

export function AboutPage() {
  usePageTitle(
    'FitWeb Sobre Nosotros',
    'Conoce la historia, misión, visión y el equipo detrás de FitWeb, la plataforma de gestión para gimnasios.',
  )

  return (
    <>
      <PageBreadcrumb title="Nosotros" current="Nosotros" />

      {/* Historia */}
      <section className="bg-primary flex items-center py-16 text-white">
        <div className="container mx-auto flex flex-col gap-16 px-4 lg:flex-row lg:gap-32">
          <div
            className="mx-auto flex justify-center overflow-hidden rounded-xl px-10 shadow-2xl transition-all duration-500 hover:scale-105 hover:rotate-3 lg:w-1/2 lg:px-0"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            <img
              src="/img/about-us.jpg"
              alt="Nuestro equipo"
              loading="lazy"
              className="h-auto w-full rounded-xl shadow-lg transition-all duration-300"
            />
          </div>

          <div className="mx-auto px-5 text-center lg:w-1/2" data-aos="fade-up">
            <div className="mb-8">
              <span className="text-tertiary text-lg font-semibold tracking-wider uppercase">
                Nuestra Historia
              </span>
              <h2 className="mt-2 text-4xl leading-tight font-extrabold text-white">
                Transformando la gestión de gimnasios desde 2025
              </h2>
            </div>

            <p className="mb-8 text-lg font-light text-gray-300">
              En FitWeb combinamos pasión por el fitness con tecnología innovadora para ofrecer la
              solución más completa en gestión deportiva. Nuestro equipo de expertos en software y
              gestión deportiva trabaja para simplificar las operaciones diarias de tu gimnasio.
            </p>

            <div className="mb-12 flex flex-wrap justify-center gap-8">
              <div
                className="bg-secondary hover:border-tertiary grid grid-cols-1 gap-4 rounded-xl border-2 border-transparent p-6 shadow-xl transition-all duration-300 hover:scale-105"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <Dumbbell
                  className="text-tertiary mx-auto size-10 transition-transform duration-500 hover:scale-125"
                  aria-hidden
                />
                <div>
                  <h3 className="text-xl font-semibold">+6 Gimnasios</h3>
                  <p className="text-sm text-gray-400">Confían en nuestra plataforma</p>
                </div>
              </div>

              <div
                className="bg-secondary hover:border-tertiary grid grid-cols-1 gap-4 rounded-xl border-2 border-transparent p-6 shadow-xl transition-all duration-300 hover:scale-105"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <TrendingUp
                  className="text-tertiary mx-auto size-10 transition-transform duration-500 hover:scale-125"
                  aria-hidden
                />
                <div>
                  <h3 className="text-xl font-semibold">100% Satisfacción</h3>
                  <p className="text-sm text-gray-400">Clientes satisfechos</p>
                </div>
              </div>
            </div>

            <Link
              to="/contactanos"
              className="inline-block rounded-lg bg-linear-to-r from-[#f36100] to-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 ease-in-out hover:scale-105 hover:from-orange-400 hover:to-orange-500"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              Ver demostración
            </Link>
          </div>
        </div>
      </section>

      {/* Misión, visión y valores */}
      <section className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {missionCards.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="group bg-primary hover:border-tertiary hover:shadow-tertiary/50 cursor-pointer rounded-2xl border-2 border-transparent p-8 text-center shadow-2xl transition-all duration-500 hover:scale-105"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 200}
              >
                <div className="text-tertiary mb-6 flex justify-center">
                  <Icon
                    className="size-14 transition-transform duration-500 group-hover:-translate-y-2"
                    aria-hidden
                  />
                </div>
                <h3 className="group-hover:text-tertiary mb-4 text-2xl font-extrabold text-white transition-colors">
                  {title}
                </h3>
                <p className="text-lg font-light text-gray-200 opacity-90">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
