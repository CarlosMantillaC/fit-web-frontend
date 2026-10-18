import { CtaBanner } from '@/components/landing/CtaBanner'
import { PageBreadcrumb } from '@/components/landing/PageBreadcrumb'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { featureCards } from '@/data/landing'
import { usePageTitle } from '@/hooks/usePageTitle'

export function FeaturesPage() {
  usePageTitle(
    'FitWeb Funcionalidades',
    'Conoce las funcionalidades de FitWeb: panel de control, clientes, empleados, programación, reportes y seguridad.',
  )

  return (
    <>
      <PageBreadcrumb title="Funcionalidades" current="Funcionalidades" />

      <section className="bg-primary py-20" data-aos="fade-up" data-aos-duration="500">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Características principales"
            title="Todo lo que necesitas en una plataforma"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, items }, index) => (
              <div
                key={title}
                className="group bg-secondary cursor-pointer rounded-2xl border-2 border-transparent p-8 text-center shadow-2xl transition-all duration-500 hover:scale-105 hover:border-orange-500 hover:shadow-orange-500/50"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 100}
                data-aos-duration="400"
              >
                <div className="text-tertiary mb-6 flex justify-center">
                  <Icon
                    className="size-14 transition-transform duration-500 group-hover:-translate-y-2"
                    aria-hidden
                  />
                </div>
                <h3 className="mb-4 text-2xl font-extrabold text-white transition-colors group-hover:text-orange-500">
                  {title}
                </h3>
                <ul className="space-y-3 text-lg text-gray-400">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
