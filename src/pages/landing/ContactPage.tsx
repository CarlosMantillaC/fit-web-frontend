import { ContactForm } from '@/components/landing/ContactForm'
import { PageBreadcrumb } from '@/components/landing/PageBreadcrumb'
import { usePageTitle } from '@/hooks/usePageTitle'

export function ContactPage() {
  usePageTitle(
    'FitWeb Contactanos',
    'Contáctanos para conocer más sobre FitWeb y agenda una demostración de la plataforma.',
  )

  return (
    <>
      <PageBreadcrumb title="Contáctanos" current="Contáctanos" />

      <section
        className="relative overflow-hidden bg-linear-to-b from-[#151515] via-[#1c1c1c] to-[#151515] py-20"
        data-aos="fade-up"
      >
        <div className="bg-tertiary/20 pointer-events-none absolute top-0 left-0 z-0 size-72 rounded-full opacity-30 blur-3xl" />
        <div className="bg-tertiary/20 pointer-events-none absolute right-0 bottom-0 z-0 size-72 rounded-full opacity-30 blur-3xl" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="mb-14" data-aos="fade-down">
            <h2 className="text-tertiary mb-6 text-4xl font-extrabold tracking-wide drop-shadow-lg md:text-5xl">
              Contáctanos
            </h2>
            <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
              ¡Nos encantaría saber de ti! Llena el formulario y da el primer paso.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <div
                className="rounded-3xl border border-gray-700 bg-[#1f1f1f] p-10 shadow-2xl backdrop-blur-md"
                data-aos="zoom-in"
              >
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
