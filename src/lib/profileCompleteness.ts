/**
 * Driver profile completeness score.
 *
 * Each field is worth a fixed number of points.  The score drives
 * the `ProfileCompletenessBar` component on the driver profile page
 * and future recruiter search ranking.
 */
import type { DriverProfile } from '../types'

interface CompletenessField {
  label:   string
  points:  number
  done:    (p: DriverProfile) => boolean
}

const FIELDS: CompletenessField[] = [
  { label: 'Full name',            points: 10, done: (p) => p.name.trim().length > 0 },
  { label: 'Email address',        points: 10, done: (p) => p.email.trim().length > 0 },
  { label: 'Phone number',         points:  5, done: (p) => p.phone.replace(/\D/g, '').length >= 7 },
  { label: 'CDL class',            points: 15, done: (p) => p.cdl_classes.length > 0 },
  { label: 'CDL license number',   points: 10, done: (p) => (p.license_number ?? '').trim().length > 0 },
  { label: 'Endorsements',         points:  5, done: (p) => p.endorsements.length > 0 },
  { label: 'City & state',         points: 10, done: (p) => p.city.trim().length > 0 && p.state.trim().length > 0 },
  { label: 'ZIP code',             points:  5, done: (p) => p.zip_code.trim().length >= 5 },
  { label: 'Availability status',  points: 10, done: (p) => Boolean(p.availability_status) },
  { label: 'Employment type',      points:  5, done: (p) => Boolean(p.employment_type) },
  { label: 'Profile photo',        points: 10, done: (p) => Boolean(p.photo_url?.trim()) },
  { label: 'Resume uploaded',      points:  5, done: (p) => Boolean(p.resume_url?.trim()) },
]

const TOTAL_POINTS = FIELDS.reduce((s, f) => s + f.points, 0)

export interface CompletenessResult {
  /** 0 – 100 */
  percent: number
  earnedPoints:  number
  totalPoints:   number
  completed: CompletenessField[]
  missing:   CompletenessField[]
}

export function computeProfileCompleteness(profile: DriverProfile): CompletenessResult {
  const completed: CompletenessField[] = []
  const missing:   CompletenessField[] = []
  let earnedPoints = 0

  for (const field of FIELDS) {
    if (field.done(profile)) {
      completed.push(field)
      earnedPoints += field.points
    } else {
      missing.push(field)
    }
  }

  return {
    percent:      Math.round((earnedPoints / TOTAL_POINTS) * 100),
    earnedPoints,
    totalPoints:  TOTAL_POINTS,
    completed,
    missing,
  }
}
