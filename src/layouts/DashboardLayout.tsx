import {
  Bell,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  ScrollText,
  Ticket,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { UserMenu } from '@/components/layout/UserMenu'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/attendance', label: 'Asistencia', icon: CalendarCheck },
  { to: '/app/members', label: 'Clientes', icon: Users },
  { to: '/app/payments', label: 'Pagos', icon: CreditCard },
  { to: '/app/plans', label: 'Planes', icon: ScrollText },
  { to: '/app/memberships', label: 'Membresías', icon: Ticket },
  { to: '/app/coaches', label: 'Entrenadores', icon: Dumbbell },
  { to: '/app/users', label: 'Usuarios', icon: UserCog },
]

export function DashboardLayout() {
  const location = useLocation()
  const currentItem = NAV_ITEMS.find((item) =>
    item.to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(item.to),
  )

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed top-0 left-0 z-50 flex h-full w-20 flex-col items-center bg-surface-low py-4 select-none md:w-28">
        <div className="mb-5 flex flex-col items-center gap-1">
          <div className="grid size-10 place-items-center rounded-xl bg-accent-strong text-accent-contrast shadow-[0_2px_10px_rgba(255,107,0,0.3)]">
            <Dumbbell className="size-6" aria-hidden />
          </div>
          <span className="font-label text-[10px] font-bold tracking-wider text-accent uppercase">
            FitWeb
          </span>
        </div>

        <nav className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-center transition-colors',
                  isActive
                    ? 'bg-accent-strong font-bold text-accent-contrast shadow-[0_2px_10px_rgba(255,107,0,0.3)]'
                    : 'text-ink-muted hover:bg-surface-container hover:text-ink',
                )
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="font-label w-full truncate text-[10px] leading-tight font-semibold">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="pl-20 md:pl-28">
        <header className="fixed top-0 right-0 left-20 z-40 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface-low/90 px-4 backdrop-blur-xl md:left-28 md:px-6">
          <div className="flex min-w-0 items-center gap-3">

            <span className="hidden h-5 w-px bg-line sm:block" />
            <span className="truncate text-sm font-semibold text-ink">
              {currentItem?.label ?? 'Panel'}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 md:gap-2">
            <button
              type="button"
              aria-label="Notificaciones"
              title="Notificaciones"
              className="relative grid size-10 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-container hover:text-ink"
            >
              <Bell className="size-5" aria-hidden />
              <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent-strong" />
            </button>

            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

            <UserMenu />
          </div>
        </header>

        <main className="min-h-screen bg-surface px-4 pt-20 pb-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
