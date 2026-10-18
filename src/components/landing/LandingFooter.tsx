import { Mail, MapPin, Smartphone } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/components/icons/BrandIcons'
import {
  contactInfo,
  footerSupportLinks,
  footerUsefulLinks,
  type NavLinkItem,
} from '@/data/landing'

interface SocialLink {
  label: string
  href: string
  icon: ReactNode
}

const socialLinks: SocialLink[] = [
  { label: 'Facebook', href: '#', icon: <FacebookIcon className="size-5" /> },
  { label: 'Twitter', href: '#', icon: <TwitterIcon className="size-5" /> },
  { label: 'YouTube', href: '#', icon: <YoutubeIcon className="size-5" /> },
  { label: 'Instagram', href: '#', icon: <InstagramIcon className="size-5" /> },
  {
    label: 'Correo',
    href: `mailto:${contactInfo.email}`,
    icon: <Mail className="size-5" aria-hidden />,
  },
]

const CURRENT_YEAR = new Date().getFullYear()

function FooterLink({ link }: { link: NavLinkItem }) {
  const className = 'transition-colors hover:text-tertiary hover:underline'

  if (link.to.startsWith('/')) {
    return (
      <Link to={link.to} className={className}>
        {link.label}
      </Link>
    )
  }

  return (
    <a href={link.to} className={className}>
      {link.label}
    </a>
  )
}

export function LandingFooter() {
  return (
    <footer>
      <section className="bg-primary py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap text-center">
            <div className="mb-8 w-full md:mb-0 md:w-1/3">
              <div className="flex flex-col items-center">
                <MapPin
                  className="text-tertiary mb-4 size-12 transition-transform duration-300 hover:scale-110 hover:text-orange-400"
                  aria-hidden
                />
                <p>
                  {contactInfo.address[0]}
                  <br />
                  {contactInfo.address[1]}
                </p>
              </div>
            </div>

            <div className="mb-8 w-full md:mb-0 md:w-1/3">
              <div className="flex flex-col items-center">
                <Smartphone
                  className="text-tertiary mb-4 size-12 transition-transform duration-300 hover:scale-110 hover:text-orange-400"
                  aria-hidden
                />
                <a href={`tel:${contactInfo.phone}`} className="hover:underline">
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            <div className="w-full md:w-1/3">
              <div className="flex flex-col items-center">
                <Mail
                  className="text-tertiary mb-4 size-12 transition-transform duration-300 hover:scale-110 hover:text-orange-400"
                  aria-hidden
                />
                <a href={`mailto:${contactInfo.email}`} className="hover:underline">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary pb-12 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-wrap justify-center text-center">
            <div className="mb-8 w-5/12 md:mb-0 md:w-1/6">
              <Link to="/" aria-label="FitWeb — Inicio">
                <img src="/img/logotipo.png" alt="FitWeb" className="mx-auto mb-4 h-12 w-auto" />
              </Link>
              <div className="flex justify-center space-x-4">
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="hover:text-tertiary text-white transition-colors duration-300"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="mb-8 w-full sm:w-1/2 md:mb-0 md:w-1/3 lg:w-1/6">
              <h4 className="text-tertiary mb-4 text-lg font-semibold">Enlaces útiles</h4>
              <ul className="space-y-2">
                {footerUsefulLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/6">
              <h4 className="text-tertiary mb-4 text-lg font-semibold">Soporte</h4>
              <ul className="space-y-2">
                {footerSupportLinks.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p> &copy; {CURRENT_YEAR} Todos los derechos reservados</p>
          </div>
        </div>
      </section>
    </footer>
  )
}
