/**
 * Merges the demo recruiter account into localStorage if missing (idempotent).
 * Mirrors the same pattern as seedDemoDrivers.ts.
 */
import {
  createUser,
  saveUser,
  getUserByEmail,
  getRecruiterProfileByUserId,
  saveRecruiterProfile,
} from './storage'
import {
  DEMO_RECRUITER_PASSWORD,
  demoRecruiterUser,
  demoRecruiterProfile,
} from '../data/demoRecruiter'

export function ensureDemoRecruiter(): void {
  if (typeof window === 'undefined') return

  const correctHash = btoa(DEMO_RECRUITER_PASSWORD)
  const existing = getUserByEmail(demoRecruiterUser.email)
  if (!existing) {
    createUser({ ...demoRecruiterUser, passwordHash: correctHash })
  } else if (existing.passwordHash !== correctHash || !existing.emailVerified) {
    saveUser({ ...existing, passwordHash: correctHash, emailVerified: true })
  }

  if (!getRecruiterProfileByUserId(demoRecruiterUser.id)) {
    saveRecruiterProfile(demoRecruiterProfile)
  }
}
