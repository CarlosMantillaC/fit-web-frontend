import {
  CalendarCheck,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  ScrollText,
  Ticket,
  Users,
  UserCog,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/members', label: 'Clientes', icon: Users },
  { to: '/app/plans', label: 'Planes', icon: ScrollText },
  { to: '/app/memberships', label: 'Membresías', icon: Ticket },
  { to: '/app/payments', label: 'Pagos', icon: CreditCard },
  { to: '/app/attendance', label: 'Asistencias', icon: CalendarCheck },
  { to: '/app/coaches', label: 'Entrenadores', icon: Dumbbell },
  { to: '/app/users', label: 'Usuarios', icon: UserCog },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/50 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <Dumbbell className="text-brand-500 size-6" aria-hidden />
          <span className="text-lg font-bold text-white">
            Fit<span className="text-brand-500">Web</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/15 text-brand-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 sm:px-6">
          <h2 className="text-sm font-medium text-slate-300">Panel de administración</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-100">{user?.username ?? 'Usuario'}</p>
              <p className="text-xs text-slate-500">{user?.role ?? '—'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut className="size-4" aria-hidden />
              Salir
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
