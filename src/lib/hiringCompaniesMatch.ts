import { HIRING_COMPANIES } from '../data/hiringCompanies'
import type { DriverProfile, HiringCompany } from '../types'

export interface HiringCompanyMatch {
  company: HiringCompany
  /** Strict = CDL overlap and all required endorsements; broader = CDL overlap only (endorsements relaxed). */
  broaderMatch: boolean
}

function hashSeed(str: string): number {
  let h = 21821
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Deterministic PRNG from seed (Mulberry32 variant). */
function rng(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleStable<T>(items: T[], seedStr: string): T[] {
  const out = [...items]
  const random = rng(hashSeed(seedStr))
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function stateMatches(companyState: string, driverState: string): boolean {
  return companyState.toUpperCase() === driverState.trim().toUpperCase()
}

function cdlOverlaps(company: HiringCompany, driver: DriverProfile): boolean {
  if (driver.cdl_classes.length === 0) return false
  return company.needs_cdl_classes.some((c) => driver.cdl_classes.includes(c))
}

function hasRequiredEndorsements(company: HiringCompany, driver: DriverProfile): boolean {
  const d = new Set(driver.endorsements)
  return company.required_endorsements.every((e) => d.has(e))
}

function basePool(driver: DriverProfile): HiringCompany[] {
  return HIRING_COMPANIES.filter(
    (c) => stateMatches(c.state, driver.state) && cdlOverlaps(c, driver)
  )
}

/** Matches hiring demo rows to the driver; shuffles by user id; ensures at least 5 when pool allows (endorsement relax). */
export function getHiringCompaniesForDriver(driver: DriverProfile): HiringCompanyMatch[] {
  const pool = basePool(driver)
  const strict = pool.filter((c) => hasRequiredEndorsements(c, driver))
  let ordered = shuffleStable(strict, `${driver.user_id}:strict`)

  const result: HiringCompanyMatch[] = ordered.map((company) => ({
    company,
    broaderMatch: false,
  }))

  if (result.length >= 5 || pool.length === strict.length) {
    return result
  }

  const strictIds = new Set(strict.map((c) => c.id))
  const relaxed = shuffleStable(
    pool.filter((c) => !strictIds.has(c.id)),
    `${driver.user_id}:relax`
  )

  for (const company of relaxed) {
    if (result.length >= 5) break
    result.push({ company, broaderMatch: true })
  }

  return result
}
