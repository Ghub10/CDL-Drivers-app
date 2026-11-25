/**
 * Recruiter metro area — no longer hard-coded to Salt Lake City.
 *
 * Each recruiter can set their own city / state / zip.  The value is persisted
 * in localStorage keyed by the recruiter's user id so multiple accounts on the
 * same browser stay independent.
 *
 * Legacy constants are kept as the SLC fallback so existing code compiles
 * without changes; they are only used when the recruiter hasn't set an area yet.
 */

export const DEFAULT_AREA_CITY  = 'Salt Lake City'
export const DEFAULT_AREA_STATE = 'UT'
export const DEFAULT_AREA_ZIP   = '84101'

/** @deprecated use getRecruiterArea(userId) instead */
export const RECRUITER_AREA_CITY  = DEFAULT_AREA_CITY
/** @deprecated use getRecruiterArea(userId) instead */
export const RECRUITER_AREA_STATE = DEFAULT_AREA_STATE
/** @deprecated use getRecruiterArea(userId) instead */
export const RECRUITER_AREA_ZIP   = DEFAULT_AREA_ZIP

export interface RecruiterArea {
  city:  string
  state: string
  zip:   string
}

const areaKey = (userId: string) => `cdl_recruiter_area_${userId}`

/** Returns the area the recruiter has set, falling back to SLC. */
export function getRecruiterArea(userId: string): RecruiterArea {
  try {
    const raw = localStorage.getItem(areaKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw) as RecruiterArea
      if (parsed.city && parsed.state) return parsed
    }
  } catch { /* ignore */ }
  return { city: DEFAULT_AREA_CITY, state: DEFAULT_AREA_STATE, zip: DEFAULT_AREA_ZIP }
}

export function setRecruiterArea(userId: string, area: RecruiterArea): void {
  localStorage.setItem(areaKey(userId), JSON.stringify(area))
}

/** Path to the driver list scoped to the recruiter's area (default browse for recruiters). */
export function recruiterDriversBrowsePath(area?: RecruiterArea): string {
  const a = area ?? { city: DEFAULT_AREA_CITY, state: DEFAULT_AREA_STATE, zip: DEFAULT_AREA_ZIP }
  const q = new URLSearchParams({ city: a.city, state: a.state, zip: a.zip })
  return `/recruiter/drivers?${q}`
}
