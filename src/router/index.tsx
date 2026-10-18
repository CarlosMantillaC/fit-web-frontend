import { createBrowserRouter } from 'react-router-dom'

import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { AboutPage } from '@/pages/landing/AboutPage'
import { ContactPage } from '@/pages/landing/ContactPage'
import { FeaturesPage } from '@/pages/landing/FeaturesPage'
import { HomePage } from '@/pages/landing/HomePage'

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'funcionalidades', element: <FeaturesPage /> },
      { path: 'sobre-nosotros', element: <AboutPage /> },
      { path: 'contactanos', element: <ContactPage /> },
    ],
  },
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'app',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'members', element: <PlaceholderPage title="Clientes" /> },
          { path: 'plans', element: <PlaceholderPage title="Planes" /> },
          { path: 'memberships', element: <PlaceholderPage title="Membresías" /> },
          { path: 'payments', element: <PlaceholderPage title="Pagos" /> },
          { path: 'attendance', element: <PlaceholderPage title="Asistencias" /> },
          { path: 'coaches', element: <PlaceholderPage title="Entrenadores" /> },
          { path: 'users', element: <PlaceholderPage title="Usuarios" /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
