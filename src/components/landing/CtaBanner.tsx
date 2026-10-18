import { Link } from 'react-router-dom'

export function CtaBanner() {
  return (
    <section
      className="relative bg-cover bg-center py-32"
      style={{ backgroundImage: "url('/img/banner.png')" }}
      data-aos="zoom-in"
      data-aos-duration="500"
    >
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="mb-6 text-4xl font-extrabold text-white drop-shadow-lg md:text-6xl">
          Contáctanos para obtener más información
        </h2>
        <p className="mb-10 text-xl text-gray-300 md:text-2xl">
          Donde el fitness y la tecnología se encuentran.
        </p>
        <Link
          to="/contactanos"
          className="hover:shadow-tertiary/50 inline-block rounded-full bg-linear-to-r from-[#f36100] via-orange-600 to-orange-700 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:scale-110"
        >
          Obtener Información
        </Link>
      </div>
    </section>
  )
}
