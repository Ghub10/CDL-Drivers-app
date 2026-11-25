/**
 * Local storage API for MVP.
 * Persists auth, driver profiles, recruiter profiles, and messages.
 * Can be swapped for Supabase in production.
 */

import type {
  DriverProfile,
  RecruiterProfile,
  Message,
  UserRole,
  CDLClass,
  JobPosting,
} from '../types'
import {
  DEFAULT_AREA_CITY,
  DEFAULT_AREA_STATE,
  DEFAULT_AREA_ZIP,
} from './recruiterArea'

// Legacy aliases so older call-sites that already imported these names keep compiling.
const RECRUITER_AREA_CITY  = DEFAULT_AREA_CITY
const RECRUITER_AREA_STATE = DEFAULT_AREA_STATE
const RECRUITER_AREA_ZIP   = DEFAULT_AREA_ZIP

const USERS_KEY = 'cdl_users'
export const DRIVER_PROFILES_STORAGE_KEY = 'cdl_driver_profiles'
const DRIVER_PROFILES_KEY = DRIVER_PROFILES_STORAGE_KEY

/** Fired on `window` after any `saveDriverProfile` (same tab). Detail: `{ userId: string }`. */
export const DRIVER_PROFILE_SAVED_EVENT = 'cdl_drivers_driver_profile_saved'
const RECRUITER_PROFILES_KEY = 'cdl_recruiter_profiles'
const MESSAGES_KEY = 'cdl_messages'
/** Demo seed profile ids the recruiter removed — do not re-merge them on `ensureDemoDrivers`. */
const REMOVED_DEMO_PROFILE_IDS_KEY = 'cdl_removed_demo_profile_ids'
/** Saved recruiter searches — migrate legacy Class C in `ensureCdlAbOnlyMigration`. */
const SAVED_RECRUITER_SEARCHES_KEY = 'cdl_recruiter_saved_searches'
const CDL_AB_ONLY_MIGRATION_FLAG = 'cdl_cdl_ab_only_migrated_v1'

/**
 * One-time: strip legacy Class `C` from driver profiles and saved searches in localStorage.
 * Call early (e.g. from `main.tsx`) before seeding demos.
 */
export function ensureCdlAbOnlyMigration(): void {
  if (localStorage.getItem(CDL_AB_ONLY_MIGRATION_FLAG) === '1') return
  try {
    const profiles = load<DriverProfile[]>(DRIVER_PROFILES_KEY, [])
    let profChanged = false
    const nextProf = profiles.map((p) => {
      const cdl = p.cdl_classes.filter((c): c is CDLClass => c === 'A' || c === 'B')
      if (cdl.length === p.cdl_classes.length) return p
      profChanged = true
      return { ...p, cdl_classes: cdl.length > 0 ? cdl : ['A'] }
    })
    if (profChanged) save(DRIVER_PROFILES_KEY, nextProf)

    const rawSaved = localStorage.getItem(SAVED_RECRUITER_SEARCHES_KEY)
    if (rawSaved) {
      type Row = { cdl_classes?: unknown }
      const rows = JSON.parse(rawSaved) as Row[]
      if (Array.isArray(rows)) {
        let savChanged = false
        const nextRows = rows.map((row) => {
          const arr = row.cdl_classes
          if (!Array.isArray(arr)) return row
          const cdl = arr.filter((c): c is CDLClass => c === 'A' || c === 'B')
          if (cdl.length === arr.length) return row
          savChanged = true
          return { ...row, cdl_classes: cdl }
        })
        if (savChanged) localStorage.setItem(SAVED_RECRUITER_SEARCHES_KEY, JSON.stringify(nextRows))
      }
    }
    localStorage.setItem(CDL_AB_ONLY_MIGRATION_FLAG, '1')
  } catch {
    /* corrupt JSON — skip flag so a future load can retry */
  }
}

export interface StoredUser {
  id: string
  email: string
  passwordHash: string
  role: UserRole
  emailVerified: boolean
  createdAt: string
}

function load<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultVal
  } catch {
    return defaultVal
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/** Seeded demo drivers use fixed ids `list-profile-*`; suppress re-seeding after recruiter removal. */
export function getRemovedDemoProfileIds(): Set<string> {
  return new Set(load(REMOVED_DEMO_PROFILE_IDS_KEY, [] as string[]))
}

export function addRemovedDemoProfileId(profileId: string): void {
  const ids = Array.from(getRemovedDemoProfileIds())
  if (!ids.includes(profileId)) {
    ids.push(profileId)
    save(REMOVED_DEMO_PROFILE_IDS_KEY, ids)
  }
}

export function clearRemovedDemoProfileIds(): void {
  save(REMOVED_DEMO_PROFILE_IDS_KEY, [] as string[])
}

/** One row per email — keep the account with the latest createdAt (fixes duplicate-email corruption). */
function dedupeUsersByEmailKeepNewest(users: StoredUser[]): StoredUser[] {
  const byEmail = new Map<string, StoredUser>()
  for (const u of users) {
    const key = u.email.toLowerCase()
    const existing = byEmail.get(key)
    if (!existing) {
      byEmail.set(key, u)
      continue
    }
    const tNew = new Date(u.createdAt).getTime()
    const tOld = new Date(existing.createdAt).getTime()
    byEmail.set(key, tNew >= tOld ? u : existing)
  }
  return Array.from(byEmail.values())
}

/**
 * If multiple rows share an email, `cdl_session` may point at the wrong one (e.g. recruiter id while login resolves driver).
 * Move session to the canonical (newest) user id before deduping storage.
 */
function syncSessionToCanonicalUserId(): void {
  try {
    const rawSession = localStorage.getItem('cdl_session')
    if (!rawSession) return
    const { userId } = JSON.parse(rawSession) as { userId: string }
    const raw = load<StoredUser[]>(USERS_KEY, [])
    const u = raw.find((x) => x.id === userId)
    if (!u) return
    const sameEmail = raw.filter((x) => x.email.toLowerCase() === u.email.toLowerCase())
    if (sameEmail.length <= 1) return
    const canonical = sameEmail.reduce((a, b) =>
      new Date(a.createdAt).getTime() >= new Date(b.createdAt).getTime() ? a : b
    )
    if (canonical.id !== userId) {
      localStorage.setItem('cdl_session', JSON.stringify({ userId: canonical.id }))
    }
  } catch {
    /* ignore */
  }
}

export function getUsers(): StoredUser[] {
  syncSessionToCanonicalUserId()
  const raw = load<StoredUser[]>(USERS_KEY, [])
  const deduped = dedupeUsersByEmailKeepNewest(raw)
  if (deduped.length !== raw.length) {
    save(USERS_KEY, deduped)
  }
  return deduped
}

export function saveUser(user: StoredUser): void {
  const users = getUsers().filter((u) => u.id !== user.id)
  users.push(user)
  save(USERS_KEY, users)
}

export function createUser(user: StoredUser): void {
  saveUser(user)
}

export function setUserVerified(userId: string, verified: boolean): void {
  const users = getUsers()
  const u = users.find((x) => x.id === userId)
  if (u) saveUser({ ...u, emailVerified: verified })
}

/**
 * Local demo only: sets password hash for an existing account (same encoding as sign-in).
 * Returns an error if no user matches — no email is sent.
 */
export function resetPasswordForEmail(
  email: string,
  newPassword: string
): { ok: true } | { ok: false; error: string } {
  const trimmed = email.trim()
  if (!trimmed) return { ok: false, error: 'Enter your email address.' }
  const u = getUserByEmail(trimmed)
  if (!u) return { ok: false, error: 'No account found with that email in this browser.' }
  saveUser({ ...u, passwordHash: btoa(newPassword) })
  return { ok: true }
}

export function getUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserById(id: string): StoredUser | undefined {
  return getUsers().find((u) => u.id === id)
}

export function getDriverProfiles(): DriverProfile[] {
  return load(DRIVER_PROFILES_KEY, [])
}

export function saveDriverProfile(profile: DriverProfile): void {
  const profiles = getDriverProfiles().filter((p) => p.id !== profile.id)
  profiles.push({ ...profile, updated_at: new Date().toISOString() })
  save(DRIVER_PROFILES_KEY, profiles)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(DRIVER_PROFILE_SAVED_EVENT, { detail: { userId: profile.user_id } })
    )
  }
}

export function getDriverProfileById(profileId: string): DriverProfile | undefined {
  return getDriverProfiles().find((p) => p.id === profileId)
}

export function getDriverProfileByUserId(userId: string): DriverProfile | undefined {
  return getDriverProfiles().find((p) => p.user_id === userId)
}

/** Ensures a minimal searchable profile exists for new drivers (recruiter list reads `cdl_driver_profiles` only). Idempotent. */
export function ensureDriverProfileStubForUser(userId: string, email: string): void {
  if (getDriverProfileByUserId(userId)) return
  const now = new Date().toISOString()
  const local = email.split('@')[0]?.replace(/[._+]/g, ' ').trim() || ''
  saveDriverProfile({
    id: crypto.randomUUID(),
    user_id: userId,
    name: email === 'driver@demo.com' ? 'Demo Driver' : local || 'New driver',
    phone: '',
    email,
    cdl_classes: ['A'],
    endorsements: [],
    zip_code: RECRUITER_AREA_ZIP,
    city: RECRUITER_AREA_CITY,
    state: RECRUITER_AREA_STATE,
    availability_status: 'actively_looking',
    availability_start_date: '',
    employment_type: 'full_time',
    resume_url: null,
    created_at: now,
    updated_at: now,
  })
}

export function getRecruiterProfiles(): RecruiterProfile[] {
  return load(RECRUITER_PROFILES_KEY, [])
}

export function saveRecruiterProfile(profile: RecruiterProfile): void {
  const profiles = getRecruiterProfiles().filter((p) => p.id !== profile.id)
  profiles.push({ ...profile, updated_at: new Date().toISOString() })
  save(RECRUITER_PROFILES_KEY, profiles)
}

export function getRecruiterProfileByUserId(userId: string): RecruiterProfile | undefined {
  return getRecruiterProfiles().find((p) => p.user_id === userId)
}

/** Deterministic thread key matching the DB generated column. */
function makeThreadId(a: string, b: string): string {
  return [a, b].sort().join('_')
}

export function getMessages(): Message[] {
  return load(MESSAGES_KEY, [])
}

export function saveMessage(message: Message): void {
  const hydrated: Message = {
    ...message,
    thread_id: makeThreadId(message.sender_id, message.recipient_id),
  }
  const messages = getMessages().filter((m) => m.id !== hydrated.id)
  messages.push(hydrated)
  save(MESSAGES_KEY, messages)
}

/** Stamp read_at on all unread messages sent to userId in a given thread (demo mode). */
export function markThreadRead(threadId: string, userId: string): void {
  const now = new Date().toISOString()
  const messages = getMessages().map((m) =>
    m.thread_id === threadId && m.recipient_id === userId && m.read_at === null
      ? { ...m, read_at: now }
      : m
  )
  save(MESSAGES_KEY, messages)
}

/** Count unread messages for a user across all threads. */
export function getUnreadCount(userId: string): number {
  return getMessages().filter((m) => m.recipient_id === userId && m.read_at === null).length
}

export function getMessagesBetween(userId1: string, userId2: string): Message[] {
  return getMessages()
    .filter(
      (m) =>
        (m.sender_id === userId1 && m.recipient_id === userId2) ||
        (m.sender_id === userId2 && m.recipient_id === userId1)
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function getMessageThreadsForUser(userId: string): string[] {
  const messages = getMessages()
  const seen = new Set<string>()
  messages.forEach((m) => {
    if (m.sender_id === userId) seen.add(m.recipient_id)
    if (m.recipient_id === userId) seen.add(m.sender_id)
  })
  return Array.from(seen)
}

// ── Job postings ─────────────────────────────────────────────────────────────

const JOB_POSTINGS_KEY = 'cdl_job_postings'

export function getJobPostings(): JobPosting[] {
  return load(JOB_POSTINGS_KEY, [])
}

export function getJobPostingsByRecruiter(recruiterUserId: string): JobPosting[] {
  return getJobPostings().filter((p) => p.recruiter_user_id === recruiterUserId)
}

export function getOpenJobPostings(): JobPosting[] {
  return getJobPostings().filter((p) => p.status === 'open')
}

export function saveJobPosting(posting: JobPosting, actingUserId?: string): void {
  const all = getJobPostings()
  const existing = all.find((p) => p.id === posting.id)
  if (existing && actingUserId && existing.recruiter_user_id !== actingUserId) return
  const next = all.filter((p) => p.id !== posting.id)
  next.push({ ...posting, updated_at: new Date().toISOString() })
  save(JOB_POSTINGS_KEY, next)
}

export function deleteJobPosting(postingId: string, actingUserId?: string): void {
  const all = getJobPostings()
  const existing = all.find((p) => p.id === postingId)
  if (existing && actingUserId && existing.recruiter_user_id !== actingUserId) return
  save(JOB_POSTINGS_KEY, all.filter((p) => p.id !== postingId))
}

function simpleHash(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export function hashPassword(password: string): string {
  return simpleHash(password + 'cdl-salt')
}

export function uuid(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
