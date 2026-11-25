/**
 * FICTIONAL sample companies, clearly labelled "(sample)", so the Companies
 * Hiring page has something to show in the demo. They are not real employers.
 * Seeded into localStorage as JobPostings, owned by the demo recruiter.
 */
import type { JobPosting } from '../types'
import { DEMO_RECRUITER_USER_ID } from './demoRecruiter'

const SEED_TS = '2024-01-01T00:00:00.000Z'

type SeedCompany = {
  id: string
  company_name: string
  city: string
  summary: string
  website?: string
  phone?: string
  apply_email?: string
}

const COMPANIES: SeedCompany[] = [
  {
    id: 'slc-sample-summit-freight',
    company_name: 'Summit Freight Lines (sample)',
    city: 'Salt Lake City',
    summary:
      'Sample listing: regional CDL-A dry van routes across the Wasatch Front and Idaho, home most weekends.',
  },
  {
    id: 'slc-sample-wasatch-haul',
    company_name: 'Wasatch Haul Co. (sample)',
    city: 'Salt Lake City',
    summary:
      'Sample listing: local and regional flatbed runs with weekly pay and full benefits after 60 days.',
  },
  {
    id: 'slc-sample-red-rock',
    company_name: 'Red Rock Transport (sample)',
    city: 'West Valley City',
    summary:
      'Sample listing: refrigerated OTR, solo and team positions, late-model trucks.',
  },
  {
    id: 'slc-sample-great-salt',
    company_name: 'Great Salt Logistics (sample)',
    city: 'Salt Lake City',
    summary:
      'Sample listing: dedicated lanes to Nevada and Colorado, predictable schedule, home weekly.',
  },
  {
    id: 'slc-sample-canyon-line',
    company_name: 'Canyon Line Trucking (sample)',
    city: 'Sandy',
    summary:
      'Sample listing: tanker endorsement preferred, local fuel delivery, home every night.',
  },
  {
    id: 'slc-sample-beehive',
    company_name: 'Beehive Local Delivery (sample)',
    city: 'Murray',
    summary:
      'Sample listing: CDL-B local delivery, daytime hours, no weekends.',
  },
  {
    id: 'slc-sample-uinta',
    company_name: 'Uinta Basin Carriers (sample)',
    city: 'Salt Lake City',
    summary:
      'Sample listing: oilfield and bulk hauling, hazmat endorsement a plus, strong overtime pay.',
  },
  {
    id: 'slc-sample-bonneville',
    company_name: 'Bonneville Express (sample)',
    city: 'Salt Lake City',
    summary:
      'Sample listing: entry-level friendly CDL-A positions with paid training and mentorship.',
  },
]

export const SLC_HIRING_COMPANIES: JobPosting[] = COMPANIES.map((c) => ({
  id:                c.id,
  recruiter_user_id: DEMO_RECRUITER_USER_ID,
  company_name:      c.company_name,
  city:              c.city,
  summary:           c.summary,
  website:           c.website,
  status:            'open',
  created_at:        SEED_TS,
  updated_at:        SEED_TS,
}))
