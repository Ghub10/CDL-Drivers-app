/**
 * Seeds the fictional sample hiring companies into localStorage as
 * JobPostings (idempotent — only adds ones that aren't already present, so it
 * never clobbers postings a recruiter has created or edited).
 */
import { getJobPostings, saveJobPosting, deleteJobPosting } from './storage'
import { SLC_HIRING_COMPANIES } from '../data/slcHiringCompanies'

export function ensureSlcHiringCompanies(): void {
  if (typeof window === 'undefined') return

  // Drop any postings saved under an old shape (had a `title` field or missing `summary`).
  for (const p of getJobPostings()) {
    const raw = p as unknown as Record<string, unknown>
    if ('title' in raw || !p.summary) deleteJobPosting(p.id)
  }

  // Remove the earlier seed that used real company names.
  for (const p of getJobPostings()) {
    if (p.id.startsWith('slc-') && !p.id.startsWith('slc-sample-')) deleteJobPosting(p.id)
  }

  const existingIds = new Set(getJobPostings().map((p) => p.id))
  for (const company of SLC_HIRING_COMPANIES) {
    if (!existingIds.has(company.id)) saveJobPosting(company)
  }
}
