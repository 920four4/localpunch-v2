export type UserRole = 'customer' | 'merchant' | 'admin'

export interface Profile {
  id: string
  role: UserRole
  display_name: string | null
  phone: string | null
  marketing_consent: boolean
  created_at: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
}

export interface LoyaltyProgram {
  id: string
  business_id: string
  name: string
  description: string | null
  punches_required: number
  reward_description: string
  is_active: boolean
  created_at: string
  business?: Business
}

export interface PunchCard {
  id: string
  customer_id: string
  program_id: string
  punch_count: number
  is_complete: boolean
  created_at: string
  program?: LoyaltyProgram & { business?: Business }
}

export interface Punch {
  id: string
  card_id: string
  token_hash: string
  punched_at: string
}

export interface Redemption {
  id: string
  card_id: string
  redeemed_at: string
  approved_by: string | null
  notes: string | null
}

export interface QrTokenPayload {
  business_id: string
  program_id: string
  iat: number
  exp: number
}

export interface PunchResult {
  success: boolean
  punch_count: number
  punches_required: number
  is_complete: boolean
  message: string
}

export interface DashboardStats {
  total_customers: number
  total_punches: number
  total_redemptions: number
  active_programs: number
}

export interface PlatformStats {
  total_businesses: number
  total_customers: number
  total_punches: number
  total_redemptions: number
}
