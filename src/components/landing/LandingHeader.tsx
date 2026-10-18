import { Home, Mail, Menu, Settings, UserCircle, Users, X, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { navLinks } from '@/data/landing'
import { cn } from '@/lib/utils'

interface MobileNavItem {
  label: string
  to: string
  icon: LucideIcon
}

const mobileNav: MobileNavItem[] = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Funcionalidades', to: '/funcionalidades', icon: Settings },
  { label: 'Sobre nosotros', to: '/sobre-nosotros', icon: Users },
  { label: 'Contáctanos', to: '/contactanos', icon: Mail },
]

export function LandingHeader() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <header className="absolute inset-x-0 top-0 z-30 mt-6 md:mt-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link to="/" className="shrink-0" aria-label="FitWeb — Inicio">
            <img src="/img/logotipo.png" alt="FitWeb" className="h-9 w-auto md:h-11" />
          </Link>

          <nav className="hidden md:block" aria-label="Navegación principal">
            <ul className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'hover:text-tertiary transition-colors',
                        isActive ? 'text-tertiary' : 'text-white',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="bg-tertiary inline-block rounded-md px-5 py-2 font-semibold text-white transition duration-300 hover:bg-orange-600"
                >
                  Soy FitWeb
                </Link>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md bg-black p-3 shadow-md transition-all duration-300 hover:bg-gray-600 md:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
          >
            <Menu className="size-6 text-white" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className={cn('fixed inset-0 z-40 md:hidden', !open && 'pointer-events-none')}
        aria-hidden={!open}
        inert={!open}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setOpen(false)}
        />

        <div
          id="landing-mobile-menu"
          className={cn(
            'border-secondary bg-primary absolute inset-y-0 left-0 w-72 max-w-xs border-r transition-transform duration-300 ease-in-out',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-10 place-items-center rounded-full bg-black transition-colors hover:bg-gray-600"
              aria-label="Cerrar menú"
            >
              <X className="size-6 text-white" aria-hidden />
            </button>
          </div>

          <nav className="mt-2 space-y-3 px-4 py-4" aria-label="Navegación móvil">
            {mobileNav.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-200 transition-all duration-300 hover:bg-gray-700/50 hover:text-white"
              >
                <Icon className="text-tertiary size-5" aria-hidden />
                <span>{label}</span>
              </Link>
            ))}

            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="bg-tertiary mx-4 my-5 flex items-center justify-center gap-3 rounded-lg px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#ff6a00] hover:shadow-lg"
            >
              <UserCircle className="size-5" aria-hidden />
              <span>Soy FitWeb</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
