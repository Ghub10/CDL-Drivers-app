/**
 * Demo CDL drivers merged into localStorage for recruiter search / detail.
 * Login: use the account email + password "demo123" (email verified).
 */

import type { DriverProfile, DriverPortraitGender, Endorsement, CDLClass } from '../types'
import type { StoredUser } from '../lib/storage'

/** Shared demo password (matches AuthContext btoa check). */
export const DEMO_DRIVER_PASSWORD = 'demo123'

const now = new Date().toISOString()

/** Strip non-digits for stored phone. */
function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Map free-text endorsement notes to app endorsement codes. */
function mapEndorsements(texts: string[]): Endorsement[] {
  const joined = texts.join(' ').toLowerCase()
  const set = new Set<Endorsement>()
  if (/hazmat|hasmat|fuel/.test(joined)) {
    set.add('H')
    set.add('N')
  }
  if (/passenger|passanger/.test(joined)) set.add('P')
  if (/school/.test(joined)) set.add('S')
  if (/double|triple|tanker|air\s*break|airbreak/.test(joined)) {
    set.add('T')
  }
  if (set.size === 0) set.add('P')
  return Array.from(set)
}

interface RawDriver {
  name: string
  lastname: string
  portrait_gender: DriverPortraitGender
  licenseNumber: string
  cdlClass: CDLClass
  endorsements: string[]
  email: string
  phoneNumber: string
}

const RAW: RawDriver[] = [
  {
    name: 'Marcus',
    lastname: 'Chen',
    portrait_gender: 'male',
    licenseNumber: '1788123401',
    cdlClass: 'A',
    endorsements: ['Tanker', 'Hazmat'],
    email: 'marcus.chen.demo@example.com',
    phoneNumber: '801 555 0101',
  },
  {
    name: 'Sofia',
    lastname: 'Delgado',
    portrait_gender: 'female',
    licenseNumber: '1788123402',
    cdlClass: 'B',
    endorsements: ['Passenger', 'School'],
    email: 'sofia.delgado.demo@example.com',
    phoneNumber: '801 555 0102',
  },
  {
    name: 'James',
    lastname: 'Okonkwo',
    portrait_gender: 'male',
    licenseNumber: '1788123403',
    cdlClass: 'A',
    endorsements: ['Double & triple'],
    email: 'james.okonkwo.demo@example.com',
    phoneNumber: '801 555 0103',
  },
  {
    name: 'Elena',
    lastname: 'Vasquez',
    portrait_gender: 'female',
    licenseNumber: '1788123404',
    cdlClass: 'B',
    endorsements: ['Passenger'],
    email: 'elena.vasquez.demo@example.com',
    phoneNumber: '801 555 0104',
  },
  {
    name: 'Tyrell',
    lastname: 'Washington',
    portrait_gender: 'male',
    licenseNumber: '1788123405',
    cdlClass: 'A',
    endorsements: ['Hazmat & Fuel Haul'],
    email: 'tyrell.washington.demo@example.com',
    phoneNumber: '801 555 0105',
  },
  {
    name: 'Priya',
    lastname: 'Singh',
    portrait_gender: 'female',
    licenseNumber: '1788123406',
    cdlClass: 'A',
    endorsements: ['School bus'],
    email: 'priya.singh.demo@example.com',
    phoneNumber: '801 555 0106',
  },
  {
    name: 'Logan',
    lastname: 'Miller',
    portrait_gender: 'male',
    licenseNumber: '1788123407',
    cdlClass: 'B',
    endorsements: ['Air break certification'],
    email: 'logan.miller.demo@example.com',
    phoneNumber: '801 555 0107',
  },
  {
    name: 'Hannah',
    lastname: 'Kim',
    portrait_gender: 'female',
    licenseNumber: '1788123408',
    cdlClass: 'A',
    endorsements: ['Passenger', 'Tanker'],
    email: 'hannah.kim.demo@example.com',
    phoneNumber: '801 555 0108',
  },
  {
    name: 'Diego',
    lastname: 'Fernandez',
    portrait_gender: 'male',
    licenseNumber: '1788123409',
    cdlClass: 'B',
    endorsements: ['Passenger & School'],
    email: 'diego.fernandez.demo@example.com',
    phoneNumber: '801 555 0109',
  },
  {
    name: 'Keisha',
    lastname: 'Morris',
    portrait_gender: 'female',
    licenseNumber: '1788123410',
    cdlClass: 'A',
    endorsements: ['Hasmat'],
    email: 'keisha.morris.demo@example.com',
    phoneNumber: '801 555 0110',
  },
  {
    name: 'Ryan',
    lastname: "O'Brien",
    portrait_gender: 'male',
    licenseNumber: '1788123411',
    cdlClass: 'B',
    endorsements: ['Passenger'],
    email: 'ryan.obrien.demo@example.com',
    phoneNumber: '801 555 0111',
  },
  {
    name: 'Amaya',
    lastname: 'Patel',
    portrait_gender: 'female',
    licenseNumber: '1788123412',
    cdlClass: 'A',
    endorsements: ['Fuel Haul', 'Tanker'],
    email: 'amaya.patel.demo@example.com',
    phoneNumber: '801 555 0112',
  },
  {
    name: 'Jordan',
    lastname: 'Brooks',
    portrait_gender: 'male',
    licenseNumber: '1788123413',
    cdlClass: 'A',
    endorsements: ['Passenger', 'School'],
    email: 'jordan.brooks.demo@example.com',
    phoneNumber: '801 555 0113',
  },
  {
    name: 'Nina',
    lastname: 'Kowalski',
    portrait_gender: 'female',
    licenseNumber: '1788123414',
    cdlClass: 'B',
    endorsements: ['Passanger'],
    email: 'nina.kowalski.demo@example.com',
    phoneNumber: '801 555 0114',
  },
]

export const demoDriverUsers: Omit<StoredUser, 'passwordHash'>[] = RAW.map((r, i) => ({
  id: `list-driver-user-${i + 1}`,
  email: r.email.toLowerCase(),
  role: 'driver' as const,
  emailVerified: true,
  createdAt: now,
}))

export const demoDriverProfiles: DriverProfile[] = RAW.map((r, i) => ({
  id: `list-profile-${i + 1}`,
  user_id: `list-driver-user-${i + 1}`,
  name: `${r.name} ${r.lastname}`.trim(),
  phone: digitsOnly(r.phoneNumber),
  email: r.email.toLowerCase(),
  license_number: r.licenseNumber,
  cdl_classes: [r.cdlClass],
  endorsements: mapEndorsements(r.endorsements),
  portrait_gender: r.portrait_gender,
  zip_code: '84101',
  city: 'Salt Lake City',
  state: 'UT',
  availability_status: 'actively_looking',
  availability_start_date: '2025-01-01',
  employment_type: 'full_time',
  resume_url: null,
  created_at: now,
  updated_at: now,
}))
