import { Maximize } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { CtaBanner } from '@/components/landing/CtaBanner'
import { Lightbox } from '@/components/landing/Lightbox'
import { SectionHeading } from '@/components/landing/SectionHeading'
import {
  benefits,
  businessModel,
  galleryImages,
  homeFeatures,
  problemCards,
  type GalleryImage,
} from '@/data/landing'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'

export function HomePage() {
  usePageTitle(
    'FitWeb - Tu Socio Digital',
    'FitWeb es la plataforma todo-en-uno para la gestión de gimnasios: clientes, membresías, pagos y asistencias.',
  )
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[50rem] items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/img/hero/hero8.webp')" }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/60 to-black" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            <div className="lg:w-1/2" data-aos="fade-right" data-aos-delay="200" />

            <div className="flex items-center justify-center text-white lg:w-1/2">
              <div className="mt-20 space-y-6 text-center">
                <span className="animate__animated animate__fadeIn animate__delay-1s block text-2xl font-semibold text-white/80">
                  Transforma tu gimnasio hoy mismo
                </span>
                <h1 className="animate__animated animate__fadeIn animate__delay-1s text-5xl leading-tight font-extrabold text-white md:text-7xl">
                  <span className="text-tertiary">FitWeb</span> - Tu Socio Digital
                </h1>
                <Link
                  to="/contactanos"
                  className="hover:shadow-tertiary mt-8 inline-block rounded-lg bg-linear-to-r from-[#f36100] to-[#ff6500] px-8 py-4 text-lg font-extrabold text-white transition-all duration-500 hover:scale-110 hover:bg-linear-to-r hover:from-[#ff6500] hover:to-[#f3a00b] hover:shadow-2xl md:text-xl"
                  data-aos="zoom-in"
                  data-aos-delay="300"
                  data-aos-duration="300"
                >
                  Agendar Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problemas que resolvemos */}
      <section className="bg-black py-20" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Problemas que Resolvemos"
            title="GESTIÓN DE GIMNASIOS"
            className="mb-16"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {problemCards.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="group hover:border-tertiary hover:shadow-tertiary/50 cursor-pointer rounded-xl border-2 border-transparent bg-[#151515] p-8 text-center shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-xl"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 200}
              >
                <Icon
                  className="text-tertiary mx-auto mb-6 size-12 transition-transform duration-500 group-hover:-translate-y-2"
                  aria-hidden
                />
                <h3 className="group-hover:text-tertiary mb-4 text-2xl font-extrabold text-white transition-colors">
                  {title}
                </h3>
                <p className="text-lg font-light text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades clave */}
      <section className="bg-secondary py-20" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Funcionalidades Clave"
            title="PLATAFORMA TODO-EN-UNO"
            className="mb-16"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {homeFeatures.map(({ image, alt, icon: Icon, category, title }, index) => (
              <div
                key={title}
                className="overflow-hidden rounded-lg bg-[#0e0e0e] shadow-md transition duration-300 hover:shadow-lg"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 200}
              >
                <img src={image} alt={alt} loading="lazy" className="h-48 w-full object-cover" />
                <div className="bg-[#0A0A0A] p-6 text-white">
                  <div className="text-tertiary mb-2 flex items-center">
                    <Icon className="mr-2 size-4" aria-hidden />
                    <span className="font-semibold">{category}</span>
                  </div>
                  <h3 className="text-lg font-bold">{title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section
        className="relative bg-cover bg-center py-24"
        style={{ backgroundImage: "url('/img/classes/gym-background.webp')" }}
        data-aos="fade-up"
      >
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="mb-24 text-center text-white">
              <h2 className="text-tertiary text-3xl font-bold md:text-5xl">
                Beneficios para Administradores
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, subtitle }, index) => (
                <div
                  key={title}
                  className="text-center text-white"
                  data-aos="fade-up"
                  data-aos-delay={(index + 1) * 200}
                >
                  <Icon className="text-tertiary mx-auto mb-4 size-10" aria-hidden />
                  <h3 className="mb-2 text-2xl font-bold">{title}</h3>
                  <h4 className="text-lg">{subtitle}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modelo de negocio */}
      <section className="bg-primary py-20" data-aos="fade-up">
        <div className="container mx-auto px-4">
          <SectionHeading
            eyebrow="Modelo de Negocio"
            title="INVERSIÓN INTELIGENTE"
            className="mb-16"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {businessModel.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className="text-center"
                data-aos="fade-up"
                data-aos-delay={(index + 1) * 200}
              >
                <span className="bg-tertiary mx-auto mb-4 grid size-16 place-items-center rounded-full text-white">
                  <Icon className="size-7" aria-hidden />
                </span>
                <h3 className="text-tertiary mb-3 text-xl font-bold">{title}</h3>
                <p className="font-light text-white">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />

      {/* Galería */}
      <div className="container mx-auto px-4 pt-12" data-aos="fade-up">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            SE PARTE DE LA ERA MODERNA
          </h2>
          <div className="bg-tertiary mx-auto h-1 w-24" />
        </div>

        <div className="grid grid-cols-1 gap-8 pb-16 md:grid-cols-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setSelectedImage(image)}
              aria-label={`Ampliar imagen: ${image.title}`}
              className={cn(
                'group relative overflow-hidden rounded-xl shadow-xl transition-all duration-500 hover:shadow-2xl',
                image.wide && 'md:col-span-2',
              )}
              data-aos="fade-up"
              data-aos-delay={(index + 1) * 100}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className={cn(
                  'w-full object-cover transition-transform duration-700 group-hover:scale-110',
                  image.wide ? 'h-80 md:h-[32rem]' : 'h-96',
                )}
              />
              <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Maximize
                  className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                  aria-hidden
                />
                <h3 className="translate-y-4 text-xl font-bold text-white transition-transform duration-500 group-hover:translate-y-0">
                  {image.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedImage && <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}
    </>
  )
}
