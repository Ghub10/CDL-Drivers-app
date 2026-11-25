export type UserRole = 'driver' | 'recruiter'

export type CDLClass = 'A' | 'B'
export type Endorsement = 'H' | 'N' | 'T' | 'P' | 'S' | 'X'
export type AvailabilityStatus = 'actively_looking' | 'open_to_offers'
export type EmploymentType = 'full_time' | 'part_time'

/** Used only for RandomUser placeholder portraits (`men` vs `women` folders). */
export type DriverPortraitGender = 'male' | 'female'

export interface DriverProfile {
  id: string
  user_id: string
  name: string
  phone: string
  email: string
  /** CDL license number (optional; shown to recruiters when set) */
  license_number?: string
  cdl_classes: CDLClass[]
  endorsements: Endorsement[]
  zip_code: string
  city: string
  state: string
  availability_status: AvailabilityStatus
  availability_start_date: string
  employment_type: EmploymentType
  resume_url: string | null
  /** Optional portrait URL; when unset, a placeholder image is derived from profile id. */
  photo_url?: string
  /** When set, placeholder photo matches this set; omit for pseudo-random men/women from id hash. */
  portrait_gender?: DriverPortraitGender
  created_at: string
  updated_at: string
}

export type SubscriptionTier = 'free' | 'pro' | 'team'

export interface RecruiterProfile {
  id: string
  user_id: string
  name: string
  company_name: string
  phone: string
  /** Metro area the recruiter is hiring in (replaces the hard-coded SLC default). */
  area_city?: string
  area_state?: string
  area_zip?: string
  /** Subscription tier — gating logic lives in src/lib/subscription.ts */
  subscription_tier?: SubscriptionTier
  /** Stripe customer id — set by webhook after first payment. */
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  /** ISO timestamp set when the recipient reads the message; null = unread. */
  read_at: string | null
  /**
   * Deterministic thread key: least(sender_id, recipient_id) + '_' + greatest(…).
   * Computed by the DB; populated manually in localStorage demo mode.
   */
  thread_id: string
}

export interface SearchFilters {
  city?: string
  state?: string
  zip?: string
  radiusMiles?: number
  cdlClasses?: CDLClass[]
  endorsements?: Endorsement[]
  availabilityStatus?: AvailabilityStatus
}

/** Demo hiring employers shown on the driver “opportunities” page (not live job data). */
export interface HiringCompany {
  id: string
  name: string
  city: string
  state: string
  summary: string
  accepting_applications: boolean
  /** Driver must hold at least one of these CDL classes. */
  needs_cdl_classes: CDLClass[]
  /** Driver must hold all of these endorsements (empty = none required). */
  required_endorsements: Endorsement[]
  /** Demo careers inbox for Apply mailto link. */
  apply_email?: string
}

/**
 * A hiring-company listing posted by a recruiter (simple contact card).
 * Drivers see these on the "Companies hiring" page.
 */
export interface JobPosting {
  id: string
  recruiter_user_id: string
  company_name: string
  /** Company website (optional). */
  website?: string
  /** Company phone (optional). */
  phone?: string
  /** Contact / apply email (optional). */
  apply_email?: string
  /** City the company is hiring in (optional; e.g. Salt Lake City). */
  city?: string
  /** Short job description shown to drivers on the opportunities page. */
  summary?: string
  status: 'open' | 'closed'
  created_at: string
  updated_at: string
}

/** Recruiter saved filter sets in localStorage (`cdl_recruiter_saved_searches`). */
export interface SavedRecruiterSearch {
  id: string
  recruiter_user_id: string
  name: string
  radius: number
  cdl_classes: CDLClass[]
  endorsements: Endorsement[]
  availability?: AvailabilityStatus
  city: string
  state: string
  zip: string
  created_at: string
  /** null = never reviewed; badge shows full match count as "new" once. */
  last_seen_at: string | null
}
