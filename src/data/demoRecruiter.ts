/**
 * Demo recruiter account seeded into localStorage on app load.
 * Login: recruiter@demo.com / demo123
 */
import type { RecruiterProfile } from '../types'
import type { StoredUser } from '../lib/storage'

export const DEMO_RECRUITER_PASSWORD = 'demo123'

export const DEMO_RECRUITER_USER_ID   = 'demo-recruiter-user-1'
export const DEMO_RECRUITER_PROFILE_ID = 'demo-recruiter-profile-1'

export const demoRecruiterUser: Omit<StoredUser, 'passwordHash'> = {
  id:            DEMO_RECRUITER_USER_ID,
  email:         'recruiter@demo.com',
  role:          'recruiter',
  emailVerified: true,
  createdAt:     '2024-01-01T00:00:00.000Z',
}

export const demoRecruiterProfile: RecruiterProfile = {
  id:           DEMO_RECRUITER_PROFILE_ID,
  user_id:      DEMO_RECRUITER_USER_ID,
  name:         'Demo Recruiter',
  company_name: 'Demo Trucking Co.',
  phone:        '8015550100',
  area_city:    'Salt Lake City',
  area_state:   'UT',
  area_zip:     '84101',
  created_at:   '2024-01-01T00:00:00.000Z',
  updated_at:   '2024-01-01T00:00:00.000Z',
}
