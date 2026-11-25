import type { CDLClass, DriverProfile, Endorsement, AvailabilityStatus } from '../types'
import { ZIP_LATLNG } from './zipLatLng'
import { haversineDistanceMiles } from './geo'

export interface RecruiterDriverListFilters {
  city?: string
  state?: string
  zip?: string
  /** Miles radius from the recruiter's ZIP. When set and both ZIPs are in the lookup, distance is enforced. */
  radius?: number
  cdlClasses: CDLClass[]
  endorsements: Endorsement[]
  availability?: AvailabilityStatus
}

export function profileMatchesRecruiterFilters(
  p: DriverProfile,
  filters: RecruiterDriverListFilters
): boolean {
  // Radius check — takes precedence over city/state/zip exact matching when both ZIPs are known.
  if (filters.radius && filters.zip) {
    const centerCoords = ZIP_LATLNG[filters.zip.replace(/\D/g, '').slice(0, 5)]
    const driverCoords = ZIP_LATLNG[p.zip_code.replace(/\D/g, '').slice(0, 5)]
    if (centerCoords && driverCoords) {
      const dist = haversineDistanceMiles(
        centerCoords[0], centerCoords[1],
        driverCoords[0], driverCoords[1]
      )
      return (
        dist <= filters.radius &&
        matchesQualificationFilters(p, filters)
      )
    }
  }

  // Fall back to city/state/zip exact matching when radius can't be computed.
  if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) return false
  if (filters.state && p.state.toUpperCase() !== filters.state.toUpperCase()) return false
  if (filters.zip) {
    const zipMatch = p.zip_code.startsWith(filters.zip.replace(/\D/g, '').slice(0, 5))
    if (!zipMatch) return false
  }
  return matchesQualificationFilters(p, filters)
}

function matchesQualificationFilters(
  p: DriverProfile,
  filters: Pick<RecruiterDriverListFilters, 'cdlClasses' | 'endorsements' | 'availability'>
): boolean {
  // CDL: driver holds ANY selected class.
  if (filters.cdlClasses.length > 0) {
    if (!filters.cdlClasses.some((c) => p.cdl_classes.includes(c))) return false
  }
  // Endorsements: driver must hold ALL selected endorsements (extras are fine).
  if (filters.endorsements.length > 0) {
    const driverEnds = new Set(p.endorsements)
    if (!filters.endorsements.every((e) => driverEnds.has(e))) return false
  }
  if (filters.availability && p.availability_status !== filters.availability) return false
  return true
}

/**
 * Among profiles matching filters, count "new" by updated_at vs last review.
 * When lastSeenAt is null, all matches count as new (first-time viewing this saved search).
 */
export function countNewMatchesSince(
  profiles: DriverProfile[],
  filters: RecruiterDriverListFilters,
  lastSeenAt: string | null
): number {
  const matching = profiles.filter((p) => profileMatchesRecruiterFilters(p, filters))
  if (lastSeenAt === null) return matching.length
  return matching.filter((p) => p.updated_at > lastSeenAt).length
}
