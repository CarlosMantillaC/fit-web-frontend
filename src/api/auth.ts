import { api } from '@/api/client'
import type { LoginCredentials, LoginResponse, User } from '@/types/api'

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
