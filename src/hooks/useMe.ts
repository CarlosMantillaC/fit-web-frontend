import { useMutation } from '@tanstack/react-query'

import { updateMe } from '@/api/auth'
import type { UpdateMeInput } from '@/types/api'

/**
 * Mutación para actualizar el perfil del usuario autenticado.
 * No invalida ninguna query de React Query: el usuario vive en el store de
 * auth (zustand), así que el componente que lo use debe llamar a `setUser`
 * con el resultado para refrescar la sesión en memoria.
 */
export function useUpdateMe() {
  return useMutation({
    mutationFn: (input: UpdateMeInput) => updateMe(input),
  })
}
