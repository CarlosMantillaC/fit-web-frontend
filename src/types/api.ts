/**
 * Tipos alineados con el esquema OpenAPI del backend
 * (`fit-web-backend/schema.yaml`). Mantener sincronizados ante cambios de API.
 */

/* ----------------------------- Auth / Users ----------------------------- */

export type Role = 'ADMIN' | 'RECEPTIONIST' | 'COACH'

export interface User {
  id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  role?: Role
  is_active?: boolean
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface RefreshResponse {
  access: string
  refresh: string
}

export interface LoginCredentials {
  username: string
  password: string
}

/* ------------------------------- Members -------------------------------- */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | ''
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface Member {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string | null
  gender?: Gender
  status: MemberStatus
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type MemberInput = Pick<Member, 'first_name' | 'last_name' | 'email'> &
  Partial<Pick<Member, 'phone' | 'date_of_birth' | 'gender' | 'status'>>

/* -------------------------------- Plans --------------------------------- */

export interface Plan {
  id: number
  name: string
  description?: string
  price: string
  duration_days: number
  is_active?: boolean
  created_at: string
  updated_at: string
}

export type PlanInput = Partial<Omit<Plan, 'id' | 'created_at' | 'updated_at'>> & {
  name: string
  price: string
  duration_days: number
}

/* ----------------------------- Memberships ------------------------------ */

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface Membership {
  id: number
  member: number
  plan: number
  start_date: string
  end_date: string
  status: MembershipStatus
  is_valid: boolean
  created_by: number | null
  member_details: Member
  plan_details: Plan
  created_at: string
  updated_at: string
}

export interface MembershipInput {
  member: number
  plan: number
  start_date: string
  status: MembershipStatus
}

export interface MembershipUpdateInput {
  status: MembershipStatus
}

/* ------------------------------- Payments ------------------------------- */

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER'

export interface Payment {
  id: number
  membership: number
  amount: string
  payment_date: string
  method: PaymentMethod
  notes?: string
  received_by: number | null
  membership_details: Membership
  created_at: string
  updated_at: string
}

export interface PaymentInput {
  membership: number
  amount: string
  payment_date: string
  method: PaymentMethod
  notes?: string
}

export interface PaymentUpdateInput {
  notes: string
}

/* ------------------------------ Attendance ------------------------------ */

export interface Attendance {
  id: number
  member: number
  check_in: string
  check_out: string | null
  registered_by: number | null
  member_details: Member
}

/* -------------------------------- Coaches ------------------------------- */

export interface Coach {
  id: number
  first_name: string
  last_name: string
  specialty: string
  phone?: string
  bio?: string
  is_active?: boolean
  user?: number | null
  created_at: string
  updated_at: string
}

export interface CoachInput {
  first_name: string
  last_name: string
  specialty: string
  phone?: string
  bio?: string
  is_active?: boolean
}

/* --------------------------------- Users -------------------------------- */

export interface UserInput {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  role: Role
}

export interface UserUpdateInput {
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
  is_active: boolean
}

/* ------------------------------- Dashboard ------------------------------ */

export interface DashboardStats {
  active_members: number
  monthly_revenue: number
  todays_attendance: number
  expiring_memberships: number
  month: string
}

/* --------------------------------- Misc --------------------------------- */

export interface ApiError {
  detail?: string
  error?: string
  attendance_id?: number
  [key: string]: unknown
}
