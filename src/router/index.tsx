import { createBrowserRouter } from 'react-router-dom'

import { GuestRoute, ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LandingLayout } from '@/layouts/LandingLayout'
import { AttendancePage } from '@/pages/AttendancePage'
import { CoachesPage } from '@/pages/CoachesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { MembersPage } from '@/pages/MembersPage'
import { MembershipsPage } from '@/pages/MembershipsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PaymentsPage } from '@/pages/PaymentsPage'
import { PlansPage } from '@/pages/PlansPage'
import { UsersPage } from '@/pages/UsersPage'
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
          { path: 'members', element: <MembersPage /> },
          { path: 'plans', element: <PlansPage /> },
          { path: 'memberships', element: <MembershipsPage /> },
          { path: 'payments', element: <PaymentsPage /> },
          { path: 'attendance', element: <AttendancePage /> },
          { path: 'coaches', element: <CoachesPage /> },
          { path: 'users', element: <UsersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
