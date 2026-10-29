import { ChevronDown, LogOut, User, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/format'
import { ROLE_BADGE, userDisplayName, userRoleLabel } from '@/lib/users'
import { cn } from '@/lib/utils'

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-surface-container-low p-3">
      <dt className="font-label text-[10px] tracking-wider text-ink-muted uppercase">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  function handleOpenProfile() {
    setMenuOpen(false)
    setProfileOpen(true)
  }

  function handleLogout() {
    setMenuOpen(false)
    setProfileOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user ? userDisplayName(user) : 'Usuario'
  const roleLabel = user ? userRoleLabel(user) : 'Sin rol'
  const roleBadge = user?.role ? ROLE_BADGE[user.role] : 'neutral'
  const initials = user ? getInitials(displayName) : ''

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls="user-menu"
        aria-label="Abrir menú de usuario"
        className={cn(
          'flex items-center gap-2 rounded-xl p-1 pr-2 text-left transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-accent-strong/40 focus-visible:outline-none',
          menuOpen && 'bg-surface-container',
        )}
      >
        <span className="font-heading grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-contrast">
          {user ? initials : <User className="size-4" aria-hidden />}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-ink">
            {displayName}
          </span>
          <span className="font-label block text-[10px] tracking-wide text-ink-muted uppercase">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-muted transition-transform duration-200',
            menuOpen && 'rotate-180 text-accent',
          )}
          aria-hidden
        />
      </button>

      {menuOpen && (
        <div
          id="user-menu"
          role="menu"
          aria-label="Menú de usuario"
          className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line bg-surface-container shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface-container-high/40 p-4">
            <span className="font-heading grid size-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-contrast">
              {user ? initials : <User className="size-5" aria-hidden />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{displayName}</p>
              <p className="truncate text-xs text-ink-muted">@{user?.username ?? 'usuario'}</p>
              <Badge variant={roleBadge} className="mt-1.5">
                {roleLabel}
              </Badge>
            </div>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              autoFocus
              onClick={handleOpenProfile}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface-container-high focus-visible:bg-surface-container-high focus-visible:outline-none"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-surface-container-low text-accent">
                <UserRound className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Perfil</span>
                <span className="block text-xs text-ink-muted">Consulta tus datos de cuenta</span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger-soft/30 focus-visible:bg-danger-soft/30 focus-visible:outline-none"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-danger-soft/30 text-danger">
                <LogOut className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Cerrar sesión</span>
                <span className="block text-xs text-danger/70">Salir del panel</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {user && (
        <Modal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          title="Mi perfil"
          description="Información de tu cuenta en FitWeb."
          size="sm"
          footer={
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setProfileOpen(false)}>
                Cerrar
              </Button>
            </div>
          }
        >
          <div className="flex items-center gap-3 rounded-xl border border-line/70 bg-surface-container-low p-4">
            <span className="font-heading grid size-14 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold text-accent-contrast">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink">{displayName}</p>
              <p className="truncate text-sm text-ink-muted">@{user.username}</p>
              <Badge variant={roleBadge} className="mt-1.5">
                {roleLabel}
              </Badge>
            </div>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProfileField label="Usuario" value={user.username} />
            <ProfileField label="Email" value={user.email || 'No registrado'} />
            <ProfileField label="Rol" value={roleLabel} />
            <ProfileField label="Estado" value={user.is_active === false ? 'Inactiva' : 'Activa'} />
          </dl>
        </Modal>
      )}
    </div>
  )
}
