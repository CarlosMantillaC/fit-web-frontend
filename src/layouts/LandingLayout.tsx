import AOS from 'aos'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import 'aos/dist/aos.css'
import 'animate.css'

import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { ScrollToTop } from '@/components/ScrollToTop'

export function LandingLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    AOS.init({ once: true, duration: 400, easing: 'ease-out-cubic', offset: 60 })
  }, [])

  useEffect(() => {
    AOS.refreshHard()
  }, [pathname])

  return (
    <div className="bg-primary font-display min-h-screen text-white">
      <ScrollToTop />
      <LandingHeader />
      <main>
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  )
}
