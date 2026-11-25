import { useState, useEffect, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import {
  getRecruiterProfileByUserId,
  getJobPostings,
  getJobPostingsByRecruiter,
  getOpenJobPostings,
  saveJobPosting,
  deleteJobPosting,
} from '../lib/storage'
import { SLC_HIRING_COMPANIES } from '../data/slcHiringCompanies'
import type { JobPosting } from '../types'

const EMPTY_FORM = {
  company_name: '',
  city: 'Salt Lake City',
  website: '',
  phone: '',
  apply_email: '',
}

type FormState = typeof EMPTY_FORM

export function RecruiterJobPostings() {
  const { user, loading: authLoading } = useAuth()
  const recruiterProfile = user ? getRecruiterProfileByUserId(user.id) : null

  const [postings, setPostings] = useState<JobPosting[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [form,     setForm]     = useState<FormState>(EMPTY_FORM)
  const [error,    setError]    = useState('')

  const refresh = () => {
    if (!user) return
    // Show the recruiter's own postings (any status) plus every other open posting in the area.
    const mine = getJobPostingsByRecruiter(user.id)
    const others = getOpenJobPostings().filter((p) => p.recruiter_user_id !== user.id)
    setPostings([...mine, ...others])
  }

  useEffect(() => { refresh() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return null
  if (!user || user.role !== 'recruiter') return <Navigate to="/" replace />

  const openNew = () => {
    setForm({ ...EMPTY_FORM, company_name: recruiterProfile?.company_name ?? '' })
    setEditId(null)
    setError('')
    setFormOpen(true)
  }

  const openEdit = (p: JobPosting) => {
    if (p.recruiter_user_id !== user.id) return
    setForm({
      company_name: p.company_name,
      city:         p.city ?? '',
      website:      p.website ?? '',
      phone:        p.phone ?? '',
      apply_email:  p.apply_email ?? '',
    })
    setEditId(p.id)
    setError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.company_name.trim()) return setError('Company name is required')
    if (!form.website.trim() && !form.phone.trim() && !form.apply_email.trim()) {
      return setError('Add at least one way to contact the company (website, phone, or email)')
    }

    const existing = editId ? getJobPostings().find((p) => p.id === editId) : undefined
    if (editId && (!existing || existing.recruiter_user_id !== user.id)) {
      return setError('You can only edit your own postings.')
    }

    const now = new Date().toISOString()
    const posting: JobPosting = {
      id:                editId ?? crypto.randomUUID(),
      recruiter_user_id: user.id,
      company_name:      form.company_name.trim(),
      city:              form.city.trim() || undefined,
      website:           form.website.trim() || undefined,
      phone:             form.phone.trim() || undefined,
      apply_email:       form.apply_email.trim() || undefined,
      status:            existing?.status ?? 'open',
      created_at:        existing?.created_at ?? now,
      updated_at:        now,
    }
    saveJobPosting(posting, user.id)
    refresh()
    closeForm()
  }

  const handleDelete = (id: string) => {
    deleteJobPosting(id, user.id)
    refresh()
  }

  const handleToggleStatus = (p: JobPosting) => {
    if (p.recruiter_user_id !== user.id) return
    saveJobPosting({ ...p, status: p.status === 'open' ? 'closed' : 'open' }, user.id)
    refresh()
  }

  /** Prefix bare domains with https:// so the link works. */
  const websiteHref = (site: string) => (/^https?:\/\//i.test(site) ? site : `https://${site}`)

  const mine = postings.filter((p) => p.recruiter_user_id === user.id)
  const storedOthers = postings.filter((p) => p.recruiter_user_id !== user.id)
  // Always include the real SLC companies, even if localStorage seeding hasn't run.
  const shownIds = new Set(postings.map((p) => p.id))
  const seedExtras = SLC_HIRING_COMPANIES.filter((c) => !shownIds.has(c.id))
  const others = [...storedOthers, ...seedExtras]

  const renderCard = (p: JobPosting, editable: boolean) => (
    <li key={p.id}>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">{p.company_name}</h3>
            {p.city && <p className="mt-0.5 text-small text-text-secondary">{p.city}</p>}
          </div>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              p.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {p.status === 'open' ? 'Hiring' : 'Closed'}
          </span>
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
          {p.website && (
            <a
              href={websiteHref(p.website)}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              {p.website}
            </a>
          )}
          {p.phone && (
            <a href={`tel:${p.phone}`} className="text-primary underline">
              {p.phone}
            </a>
          )}
          {p.apply_email && (
            <a href={`mailto:${p.apply_email}`} className="text-primary underline">
              {p.apply_email}
            </a>
          )}
        </div>

        {editable && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => openEdit(p)}>
              Edit
            </Button>
            <Button type="button" variant="secondary" onClick={() => handleToggleStatus(p)}>
              Mark as {p.status === 'open' ? 'closed' : 'hiring'}
            </Button>
            <button
              type="button"
              className="text-sm font-medium text-red-600 underline hover:text-red-800"
              onClick={() => handleDelete(p.id)}
            >
              Delete
            </button>
          </div>
        )}
      </Card>
    </li>
  )

  return (
    <main
      className="relative flex min-h-screen flex-col items-center bg-cover bg-[center_left] bg-no-repeat px-4 py-xl"
      style={{ backgroundImage: "url('/images/pexels-gustavo-fring-6720527.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/85 via-white/40 to-white/10" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Recruiter account</p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-h2">Companies hiring</h2>
          <Button type="button" variant="primary" onClick={openNew}>
            + Post a company
          </Button>
        </div>

        <p className="mt-2 text-small text-text-secondary">
          Salt Lake area companies hiring CDL drivers. Free to post. You can edit only your own.
        </p>

        {/* New / edit form */}
        {formOpen && (
          <div className="mt-4 rounded-card border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-900">{editId ? 'Edit posting' : 'New posting'}</h3>
            <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
              <Input
                label="Company name"
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="e.g. Red Star Transportation"
                required
              />
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="e.g. Salt Lake City"
              />
              <Input
                label="Website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="e.g. redstartrucking.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(801) 555-0123"
              />
              <Input
                label="Email"
                type="email"
                value={form.apply_email}
                onChange={(e) => setForm((f) => ({ ...f, apply_email: e.target.value }))}
                placeholder="hiring@company.com"
              />

              {error && (
                <p className="text-sm text-error" role="alert">{error}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary">
                  {editId ? 'Save changes' : 'Post company'}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Single combined list: your postings first, then everyone else's */}
        <ul className="mt-lg flex flex-col gap-4">
          {mine.map((p) => renderCard(p, true))}
          {others.map((p) => renderCard(p, false))}
        </ul>
      </div>
    </main>
  )
}
