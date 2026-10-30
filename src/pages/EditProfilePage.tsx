import { ArrowLeft, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Toast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/hooks/useToast'
import { getInitials } from '@/lib/format'
import { ROLE_BADGE, userDisplayName, userRoleLabel } from '@/lib/users'

export function EditProfilePage() {
  usePageTitle('Mi perfil · FitWeb Pro', 'Edita los datos personales de tu cuenta.')

  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast, clearToast } = useToast()

  if (!user) return null

  const displayName = userDisplayName(user)
  const roleLabel = userRoleLabel(user)
  const roleBadge = user.role ? ROLE_BADGE[user.role] : 'neutral'
  const initials = getInitials(displayName)

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        description="Actualiza tus datos personales y de contacto."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Resumen de la cuenta (solo lectura) */}
        <section className="border-line bg-surface-container-low flex items-center gap-4 rounded-2xl border p-5">
          <span className="font-heading bg-accent text-accent-contrast grid size-16 shrink-0 place-items-center rounded-full text-xl font-bold">
            {initials || <UserRound className="size-7" aria-hidden />}
          </span>
          <div className="min-w-0">
            <p className="text-ink truncate text-lg font-bold">{displayName}</p>
            <p className="text-ink-muted truncate text-sm">@{user.username}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={roleBadge}>{roleLabel}</Badge>
              <Badge variant={user.is_active === false ? 'danger' : 'active'}>
                {user.is_active === false ? 'Inactiva' : 'Activa'}
              </Badge>
            </div>
          </div>
        </section>

        {/* Formulario de edición */}
        <section className="border-line bg-surface-container rounded-2xl border p-5 shadow-md">
          <EditProfileForm
            user={user}
            onUpdated={setUser}
            onSuccess={showToast}
            onCancel={() => navigate(-1)}
          />
        </section>
      </div>

      <Toast message={toast?.message ?? null} variant={toast?.variant} onClose={clearToast} />
    </div>
  )
}
