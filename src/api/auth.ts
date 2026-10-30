import { api } from '@/api/client'
import type { LoginCredentials, LoginResponse, UpdateMeInput, User } from '@/types/api'

/** POST /api/auth/login/ */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login/', credentials)
  return data
}

/** GET /api/auth/me/ */
export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me/')
  return data
}

/** PATCH /api/auth/me/ — actualiza el perfil propio (sin contraseña). */
export async function updateMe(input: UpdateMeInput): Promise<User> {
  const { data } = await api.patch<User>('/auth/me/', input)
  return data
}
