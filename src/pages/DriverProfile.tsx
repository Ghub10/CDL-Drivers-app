import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiringOpportunitiesCta } from '../components/HiringOpportunitiesCta'
import { ProfileCompletenessBar } from '../components/ProfileCompletenessBar'
import { useAuth } from '../contexts/AuthContext'
import {
  DRIVER_PROFILE_SAVED_EVENT,
  DRIVER_PROFILES_STORAGE_KEY,
  getDriverProfileByUserId,
  saveDriverProfile,
  uuid,
} from '../lib/storage'
import { CDL_CLASS_OPTIONS, cdlClassesForEditor, isCdlClass } from '../lib/cdlClasses'
import type { CDLClass, Endorsement, AvailabilityStatus, EmploymentType, DriverPortraitGender } from '../types'
import { US_STATES, ENDORSEMENT_LABELS } from '../lib/constants'
import { uploadResume, ResumeUploadError } from '../lib/resumeStorage'
const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: 'actively_looking', label: 'Actively looking' },
  { value: 'open_to_offers', label: 'Open to offers' },
]
const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
]
const MAX_RESUME_SIZE = 5 * 1024 * 1024 // 5 MB — enforced before upload attempt

// ── HaulLogic Material Design 3 styling tokens ──
const MONO = { fontFamily: 'JetBrains Mono, monospace' } as const
const INTER = { fontFamily: 'Inter, sans-serif' } as const
const FIELD_CLASS =
  'w-full rounded-lg border border-[#c3c6ce] bg-[#edf4ff] px-4 py-3 text-[#001d32] outline-none transition-all focus:border-[#9d4300] focus:ring-2 focus:ring-[#fd761a]'
const LABEL_CLASS = 'block text-sm font-medium text-[#001d32] ml-1'
const toggleBtnClass = (active: boolean) =>
  `rounded-lg px-5 py-2.5 font-bold transition-all ${
    active
      ? 'border border-[#00152a] bg-[#00152a] text-white'
      : 'border border-[#c3c6ce] bg-white text-[#001d32] hover:bg-[#e3efff]'
  }`

export function DriverProfile() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [cdlClasses, setCdlClasses] = useState<CDLClass[]>([])
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('actively_looking')
  const [availabilityStartDate, setAvailabilityStartDate] = useState('')
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full_time')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  /** Empty string = automatic placeholder (hash). */
  const [portraitGender, setPortraitGender] = useState<'' | DriverPortraitGender>('')

  /** Full reset from storage: clears stale form/success/error when profile changes outside this session (e.g. recruiter edit) or after any save. */
  const hydrateFromStorage = useCallback(() => {
    if (!user || user.role !== 'driver') return
    const profile = getDriverProfileByUserId(user.id)
    setError('')
    setSaveSuccess(false)
    setResumeFile(null)
    if (profile) {
      setName(profile.name)
      setPhone(profile.phone)
      setEmail(profile.email)
      setLicenseNumber(profile.license_number ?? '')
      setCdlClasses(cdlClassesForEditor(profile.cdl_classes))
      setEndorsements(profile.endorsements)
      setZipCode(profile.zip_code)
      setCity(profile.city)
      setState(profile.state)
      setAvailabilityStatus(profile.availability_status)
      setAvailabilityStartDate(profile.availability_start_date)
      setEmploymentType(profile.employment_type)
      setResumeName(profile.resume_url ? 'Uploaded' : null)
      setPortraitGender(profile.portrait_gender ?? '')
    } else {
      setName('')
      setPhone('')
      setEmail(user.email)
      setLicenseNumber('')
      setCdlClasses(['A'])
      setEndorsements([])
      setZipCode('')
      setCity('')
      setState('')
      setAvailabilityStatus('actively_looking')
      setAvailabilityStartDate('')
      setEmploymentType('full_time')
      setResumeName(null)
      setPortraitGender('')
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return // wait for Supabase session to resolve
    if (!user || user.role !== 'driver') {
      navigate('/')
      return
    }
    hydrateFromStorage()
    setLoading(false)
  }, [authLoading, user, navigate, hydrateFromStorage])

  useEffect(() => {
    if (!user || user.role !== 'driver') return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== DRIVER_PROFILES_STORAGE_KEY) return
      hydrateFromStorage()
    }
    const onProfileSaved = (e: Event) => {
      const d = (e as CustomEvent<{ userId: string }>).detail
      if (d?.userId === user.id) hydrateFromStorage()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(DRIVER_PROFILE_SAVED_EVENT, onProfileSaved)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(DRIVER_PROFILE_SAVED_EVENT, onProfileSaved)
    }
  }, [user, hydrateFromStorage])

  const toggleCdlClass = (c: CDLClass) => {
    setCdlClasses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  const toggleEndorsement = (e: Endorsement) => {
    setEndorsements((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    )
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_RESUME_SIZE) {
      setError('Resume must be 5MB or less')
      return
    }
    setError('')
    setResumeFile(file)
    setResumeName(file.name)
  }

  const handleRemoveResume = () => {
    setResumeFile(null)
    setResumeName(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Name, phone, and email are required')
      return
    }
    if (cdlClasses.length === 0) {
      setError('Select at least one CDL class')
      return
    }
    const zipMatch = /^\d{5}(-\d{4})?$/.test(zipCode.trim())
    if (!zipMatch) {
      setError('Enter a valid US zip code (5 digits, e.g. 84101)')
      return
    }
    if (!city.trim() || !state.trim()) {
      setError('City and state are required — choose your state from the list.')
      return
    }
    setError('')
    setSaveSuccess(false)
    setSaving(true)
    try {
      const profile = getDriverProfileByUserId(user.id)
      const now = new Date().toISOString()
      let resumeUrl: string | null = profile?.resume_url ?? null
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile, user.id)
      }

      const data = {
        id: profile?.id ?? uuid(),
        user_id: user.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        license_number: licenseNumber.trim() || undefined,
        cdl_classes: cdlClasses.filter(isCdlClass),
        endorsements,
        zip_code: zipCode.trim(),
        city: city.trim(),
        state: state.trim(),
        availability_status: availabilityStatus,
        availability_start_date: availabilityStartDate,
        employment_type: employmentType,
        resume_url: resumeUrl,
        photo_url: profile?.photo_url,
        portrait_gender: portraitGender === '' ? undefined : portraitGender,
        created_at: profile?.created_at ?? now,
        updated_at: now,
      }
      saveDriverProfile(data)
      setResumeFile(null)
      setSaveSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      if (err instanceof ResumeUploadError) {
        setError(err.message)
      } else {
        const msg = err instanceof Error ? err.message : 'Save failed'
        if (msg.includes('Quota') || (err as { name?: string }).name === 'QuotaExceededError') {
          setError(
            'Browser storage is full. Remove a large resume or clear site data for this site and try again.'
          )
        } else {
          setError(msg)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-xl">
        <p className="text-body text-text-secondary">Loading profile…</p>
      </main>
    )
  }

  if (!user) return null

  const storedProfile = getDriverProfileByUserId(user.id)

  return (
    <main className="relative flex min-h-screen flex-col" style={INTER}>
      {/* Hero background */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/pexels-gustavo-fring-6720527.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(rgba(0,21,42,0.75), rgba(0,21,42,0.9))' }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 py-12">
        <section className="w-full max-w-2xl">
          <div
            className="rounded-xl border border-[#c3c6ce] p-8 shadow-2xl"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            {/* Title */}
            <div className="mb-8">
              <h2 className="mb-1 text-[32px] font-bold leading-[40px] text-[#00152a]">My Profile</h2>
              <p className="text-[#43474d]">Keep your driver information up to date.</p>
            </div>

            {storedProfile && <ProfileCompletenessBar profile={storedProfile} className="mb-4" />}
            {saveSuccess && (
              <p
                className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900"
                role="status"
              >
                Profile saved. Recruiters can now see your information in search.
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="space-y-1">
                <label htmlFor="name" className={LABEL_CLASS} style={MONO}>Name</label>
                <input id="name" className={FIELD_CLASS} type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" />
              </div>
              <div className="space-y-1">
                <label htmlFor="phone" className={LABEL_CLASS} style={MONO}>Phone</label>
                <input id="phone" className={FIELD_CLASS} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className={LABEL_CLASS} style={MONO}>Email</label>
                <input id="email" className={FIELD_CLASS} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div className="space-y-1">
                <label htmlFor="cdl" className={LABEL_CLASS} style={MONO}>CDL license number (optional)</label>
                <input id="cdl" className={FIELD_CLASS} type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="License #" />
              </div>

              {/* CDL Classes */}
              <div className="space-y-1 pt-2">
                <label className={LABEL_CLASS} style={MONO}>CDL Classes (required)</label>
                <p className="ml-1 text-xs text-[#43474d]">Tap at least one class — Class A or B.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {CDL_CLASS_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={cdlClasses.includes(c)}
                      className={toggleBtnClass(cdlClasses.includes(c))}
                      onClick={() => toggleCdlClass(c)}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endorsements */}
              <div className="space-y-1 pt-2">
                <label className={LABEL_CLASS} style={MONO}>Endorsements</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(Object.keys(ENDORSEMENT_LABELS) as Endorsement[]).map((e) => (
                    <button
                      key={e}
                      type="button"
                      aria-pressed={endorsements.includes(e)}
                      className={`${toggleBtnClass(endorsements.includes(e))} text-sm`}
                      onClick={() => toggleEndorsement(e)}
                    >
                      {e} ({ENDORSEMENT_LABELS[e]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1 pt-2">
                <label className={LABEL_CLASS} style={MONO}>Location</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <input className={FIELD_CLASS} type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required placeholder="Zip (e.g. 84101)" />
                  </div>
                  <div className="flex-[2]">
                    <input className={FIELD_CLASS} type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="City" />
                  </div>
                  <div className="flex-1">
                    <select className={FIELD_CLASS} value={state} onChange={(e) => setState(e.target.value)} required>
                      <option value="">State</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1 pt-2">
                <label className={LABEL_CLASS} style={MONO}>Availability</label>
                <select className={FIELD_CLASS} value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}>
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="space-y-1 pt-2">
                  <label htmlFor="startDate" className={LABEL_CLASS} style={MONO}>Start Date</label>
                  <input id="startDate" className={FIELD_CLASS} type="date" value={availabilityStartDate} onChange={(e) => setAvailabilityStartDate(e.target.value)} />
                </div>
              </div>

              {/* Employment Type */}
              <div className="space-y-1 pt-2">
                <label className={LABEL_CLASS} style={MONO}>Employment Type</label>
                <select className={FIELD_CLASS} value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
                  {EMPLOYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Resume */}
              <div className="space-y-1 pt-2">
                <label className={LABEL_CLASS} style={MONO}>Resume</label>
                <div className="flex items-center gap-2">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="text-sm text-[#43474d]" />
                  {resumeName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#43474d]">{resumeName}</span>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="text-red-500 transition hover:text-red-700"
                        title="Delete resume"
                        aria-label="Delete resume"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-[#fd761a] py-4 font-bold text-[#5c2400] shadow-md transition-all hover:bg-[#9d4300] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {saving ? 'Saving…' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <HiringOpportunitiesCta className="relative z-10 mt-auto w-full shrink-0 rounded-none border-0 shadow-none" />
    </main>
  )
}

