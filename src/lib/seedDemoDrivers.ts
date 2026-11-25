/**
 * Merges demo drivers into localStorage if missing (idempotent).
 */

import {
  createUser,
  saveUser,
  getUserByEmail,
  getDriverProfiles,
  getRemovedDemoProfileIds,
  saveDriverProfile,
  ensureDriverProfileStubForUser,
  type StoredUser,
} from './storage'
import {
  DEMO_DRIVER_PASSWORD,
  demoDriverUsers,
  demoDriverProfiles,
} from '../data/demoDrivers'

export const DEMO_DRIVER_EMAIL = 'driver@demo.com'
const DEMO_DRIVER_USER_ID = 'demo-driver-user-1'

function passwordHash(): string {
  return btoa(DEMO_DRIVER_PASSWORD)
}

export function ensureDemoDrivers(): void {
  if (typeof window === 'undefined') return

  // Seed the generic driver@demo.com account — always force correct password + verified
  const existingDemo = getUserByEmail(DEMO_DRIVER_EMAIL)
  const correctHash = passwordHash()
  if (!existingDemo) {
    createUser({
      id: DEMO_DRIVER_USER_ID,
      email: DEMO_DRIVER_EMAIL,
      passwordHash: correctHash,
      role: 'driver',
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    })
  } else if (existingDemo.passwordHash !== correctHash || !existingDemo.emailVerified) {
    // Fix stale hash or unverified state
    saveUser({ ...existingDemo, passwordHash: correctHash, emailVerified: true })
  }
  ensureDriverProfileStubForUser(DEMO_DRIVER_USER_ID, DEMO_DRIVER_EMAIL)

  const suppressed = getRemovedDemoProfileIds()

  for (let i = 0; i < demoDriverUsers.length; i++) {
    const profile = demoDriverProfiles[i]
    if (suppressed.has(profile.id)) continue
    const partial = demoDriverUsers[i]
    if (!getUserByEmail(partial.email)) {
      const user: StoredUser = {
        ...partial,
        passwordHash: passwordHash(),
      }
      createUser(user)
    }
  }

  const existingIds = new Set(getDriverProfiles().map((p) => p.id))
  for (const profile of demoDriverProfiles) {
    if (suppressed.has(profile.id)) continue
    if (!existingIds.has(profile.id)) {
      saveDriverProfile(profile)
    }
  }

  const byId = new Map(getDriverProfiles().map((p) => [p.id, p]))
  for (const template of demoDriverProfiles) {
    if (suppressed.has(template.id)) continue
    const existing = byId.get(template.id)
    if (!existing) continue

    if (existing.portrait_gender == null && template.portrait_gender != null) {
      saveDriverProfile({ ...existing, portrait_gender: template.portrait_gender })
    }

    const templatePhoto = template.photo_url
    if (
      templatePhoto &&
      existing.photo_url !== templatePhoto &&
      !existing.photo_url?.startsWith('data:')
    ) {
      saveDriverProfile({ ...existing, photo_url: templatePhoto })
    }
  }
}
