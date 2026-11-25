import { parseCdlQueryValues } from './cdlClasses'
import {
  RECRUITER_AREA_CITY,
  RECRUITER_AREA_STATE,
  RECRUITER_AREA_ZIP,
} from './recruiterArea'
import { ENDORSEMENT_LABELS } from './constants'
import type { RecruiterDriverListFilters } from './recruiterDriverFilters'
import type { CDLClass, Endorsement, AvailabilityStatus, SavedRecruiterSearch } from '../types'

const KEY = 'cdl_recruiter_saved_searches'

function loadSearches(): SavedRecruiterSearch[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedRecruiterSearch[]) : []
  } catch {
    return []
  }
}

function saveSearches(rows: SavedRecruiterSearch[]): void {
  localStorage.setItem(KEY, JSON.stringify(rows))
}

export function getSavedSearches(recruiterUserId: string): SavedRecruiterSearch[] {
  return loadSearches().filter((s) => s.recruiter_user_id === recruiterUserId)
}

export function getSavedSearchById(
  recruiterUserId: string,
  id: string
): SavedRecruiterSearch | undefined {
  return loadSearches().find((s) => s.id === id && s.recruiter_user_id === recruiterUserId)
}

function sortCdl(a: CDLClass, b: CDLClass): number {
  return a.localeCompare(b)
}

function sortEndorsement(a: Endorsement, b: Endorsement): number {
  return a.localeCompare(b)
}

function sortedJoinCdl(classes: CDLClass[]): string {
  return [...classes].sort(sortCdl).join('|')
}

function sortedJoinEndorsements(e: Endorsement[]): string {
  return [...e].sort(sortEndorsement).join('|')
}

/**
 * True when current URL params align with the saved row (for `saved=` banner trust).
 */
export function urlParamsMatchSavedSearch(
  saved: SavedRecruiterSearch,
  params: URLSearchParams
): boolean {
  const city = (params.get('city') ?? '').trim()
  const state = (params.get('state') ?? '').trim()
  const zipRaw = params.get('zip') ?? ''
  const zipNorm = zipRaw.replace(/\D/g, '').slice(0, 5)
  const savedZipNorm = saved.zip.replace(/\D/g, '').slice(0, 5)
  if (city.toLowerCase() !== saved.city.toLowerCase()) return false
  if (state.toUpperCase() !== saved.state.toUpperCase()) return false
  if (zipNorm !== savedZipNorm) return false
  const radiusRaw = params.get('radius')
  if (radiusRaw === null || Number(radiusRaw) !== saved.radius) return false
  const cdl = parseCdlQueryValues(params.getAll('cdl'))
  if (sortedJoinCdl(cdl) !== sortedJoinCdl(saved.cdl_classes)) return false
  const end = params.getAll('endorsement') as Endorsement[]
  if (sortedJoinEndorsements(end) !== sortedJoinEndorsements(saved.endorsements)) return false
  const avail = params.get('availability') ?? ''
  const savedAvail = saved.availability ?? ''
  if (avail !== savedAvail) return false
  return true
}

export function generateSavedSearchLabel(input: {
  radius: number
  cdl_classes: CDLClass[]
  endorsements: Endorsement[]
  availability?: AvailabilityStatus
}): string {
  const parts: string[] = []
  if (input.cdl_classes.length > 0) {
    parts.push(`Class ${[...input.cdl_classes].sort(sortCdl).join(', ')}`)
  }
  if (input.endorsements.length > 0) {
    parts.push(
      [...input.endorsements]
        .sort(sortEndorsement)
        .map((e) => ENDORSEMENT_LABELS[e])
        .join(', ')
    )
  }
  if (input.availability) {
    parts.push(
      input.availability === 'actively_looking' ? 'Actively looking' : 'Open to offers'
    )
  }
  const qual = parts.length > 0 ? parts.join(' • ') : 'All qualifications'
  return `${qual} • ${input.radius} mi`
}

export function addSavedSearch(input: {
  recruiterUserId: string
  name?: string
  radius: number
  cdl_classes: CDLClass[]
  endorsements: Endorsement[]
  availability?: AvailabilityStatus
}): SavedRecruiterSearch {
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const name =
    input.name?.trim() ||
    generateSavedSearchLabel({
      radius: input.radius,
      cdl_classes: input.cdl_classes,
      endorsements: input.endorsements,
      availability: input.availability,
    })
  const row: SavedRecruiterSearch = {
    id,
    recruiter_user_id: input.recruiterUserId,
    name,
    radius: input.radius,
    cdl_classes: [...input.cdl_classes].sort(sortCdl),
    endorsements: [...input.endorsements].sort(sortEndorsement),
    availability: input.availability,
    city: RECRUITER_AREA_CITY,
    state: RECRUITER_AREA_STATE,
    zip: RECRUITER_AREA_ZIP,
    created_at: now,
    last_seen_at: null,
  }
  const all = loadSearches()
  all.push(row)
  saveSearches(all)
  return row
}

export function deleteSavedSearch(recruiterUserId: string, id: string): void {
  const all = loadSearches().filter(
    (s) => !(s.id === id && s.recruiter_user_id === recruiterUserId)
  )
  saveSearches(all)
}

/** Removes every saved search row for this recruiter (e.g. optional “clear search” on sign-in). */
export function clearAllSavedSearchesForRecruiter(recruiterUserId: string): void {
  const all = loadSearches().filter((s) => s.recruiter_user_id !== recruiterUserId)
  saveSearches(all)
}

export function updateSavedSearchLastSeen(
  recruiterUserId: string,
  id: string,
  isoNow: string
): void {
  const all = loadSearches()
  const i = all.findIndex((s) => s.id === id && s.recruiter_user_id === recruiterUserId)
  if (i === -1) return
  all[i] = { ...all[i], last_seen_at: isoNow }
  saveSearches(all)
}

/** URL params for the driver list, including `saved` so the list can tie to storage. */
export function savedSearchToListFilters(saved: SavedRecruiterSearch): RecruiterDriverListFilters {
  return {
    city: saved.city,
    state: saved.state,
    zip: saved.zip,
    cdlClasses: saved.cdl_classes,
    endorsements: saved.endorsements,
    availability: saved.availability,
  }
}

export function savedSearchToSearchParams(saved: SavedRecruiterSearch): URLSearchParams {
  const params = new URLSearchParams()
  params.set('city', saved.city)
  params.set('state', saved.state)
  params.set('zip', saved.zip)
  params.set('radius', String(saved.radius))
  saved.cdl_classes.forEach((c) => params.append('cdl', c))
  saved.endorsements.forEach((e) => params.append('endorsement', e))
  if (saved.availability) params.set('availability', saved.availability)
  params.set('view', 'list')
  params.set('saved', saved.id)
  return params
}
