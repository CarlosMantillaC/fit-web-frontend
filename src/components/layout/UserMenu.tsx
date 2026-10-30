import { ChevronDown, LogOut, Pencil, User, UserRound } from 'lucide-react'
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
    <div className="border-line/70 bg-surface-container-low rounded-xl border p-3">
      <dt className="font-label text-ink-muted text-[10px] tracking-wider uppercase">{label}</dt>
      <dd className="text-ink mt-0.5 truncate text-sm font-semibold">{value}</dd>
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

  function handleOpenEdit() {
    setProfileOpen(false)
    setMenuOpen(false)
    navigate('/app/profile')
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
          'hover:bg-surface-container focus-visible:ring-accent-strong/40 flex items-center gap-2 rounded-xl p-1 pr-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none',
          menuOpen && 'bg-surface-container',
        )}
      >
        <span className="font-heading bg-accent text-accent-contrast grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold">
          {user ? initials : <User className="size-4" aria-hidden />}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="text-ink block max-w-36 truncate text-sm font-semibold">
            {displayName}
          </span>
          <span className="font-label text-ink-muted block text-[10px] tracking-wide uppercase">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'text-ink-muted size-4 shrink-0 transition-transform duration-200',
            menuOpen && 'text-accent rotate-180',
          )}
          aria-hidden
        />
      </button>

      {menuOpen && (
        <div
          id="user-menu"
          role="menu"
          aria-label="Menú de usuario"
          className="border-line bg-surface-container absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border shadow-2xl"
        >
          <div className="border-line bg-surface-container-high/40 flex items-center gap-3 border-b p-4">
            <span className="font-heading bg-accent text-accent-contrast grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold">
              {user ? initials : <User className="size-5" aria-hidden />}
            </span>
            <div className="min-w-0">
              <p className="text-ink truncate text-sm font-bold">{displayName}</p>
              <p className="text-ink-muted truncate text-xs">@{user?.username ?? 'usuario'}</p>
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
              className="text-ink hover:bg-surface-container-high focus-visible:bg-surface-container-high flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none"
            >
              <span className="bg-surface-container-low text-accent grid size-8 place-items-center rounded-lg">
                <UserRound className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Perfil</span>
                <span className="text-ink-muted block text-xs">Consulta tus datos de cuenta</span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="text-danger hover:bg-danger-soft/30 focus-visible:bg-danger-soft/30 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none"
            >
              <span className="bg-danger-soft/30 text-danger grid size-8 place-items-center rounded-lg">
                <LogOut className="size-4" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">Cerrar sesión</span>
                <span className="text-danger/70 block text-xs">Salir del panel</span>
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProfileOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={handleOpenEdit}>
                <Pencil className="size-4" aria-hidden />
                Editar perfil
              </Button>
            </div>
          }
        >
          <div className="border-line/70 bg-surface-container-low flex items-center gap-3 rounded-xl border p-4">
            <span className="font-heading bg-accent text-accent-contrast grid size-14 shrink-0 place-items-center rounded-full text-lg font-bold">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-ink truncate text-base font-bold">{displayName}</p>
              <p className="text-ink-muted truncate text-sm">@{user.username}</p>
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
