import { useState, useCallback, useEffect, useMemo } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { DriverAvatar } from '../components/DriverAvatar'
import { useAuth } from '../contexts/AuthContext'
import { ENDORSEMENT_LABELS } from '../lib/constants'
import { countNewMatchesSince, profileMatchesRecruiterFilters } from '../lib/recruiterDriverFilters'
import {
  addSavedSearch,
  deleteSavedSearch,
  getSavedSearches,
  savedSearchToListFilters,
  savedSearchToSearchParams,
} from '../lib/savedSearches'
import { ensureDemoDrivers } from '../lib/seedDemoDrivers'
import { getDriverProfiles, getRecruiterProfileByUserId } from '../lib/storage'
import {
  getRecruiterArea,
  setRecruiterArea,
  recruiterDriversBrowsePath,
} from '../lib/recruiterArea'
import { CDL_CLASS_OPTIONS } from '../lib/cdlClasses'
import { canUseSavedSearches } from '../lib/subscription'
import { FEATURED_METROS } from './CityLanding'
import type { CDLClass, Endorsement, AvailabilityStatus } from '../types'

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'actively_looking', label: 'Actively Looking' },
  { value: 'open_to_offers', label: 'Open to Offers' },
]
const RADIUS_OPTIONS = [10, 25, 50, 75, 100]

function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  if (d.length === 11 && d.startsWith('1')) return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
  return phone.trim() || '—'
}

const ENDORSEMENT_COLORS: Record<Endorsement, string> = {
  H: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  N: 'bg-blue-50 text-blue-700 border-blue-100',
  T: 'bg-slate-50 text-slate-600 border-slate-200',
  P: 'bg-green-50 text-green-800 border-green-200',
  S: 'bg-orange-50 text-orange-800 border-orange-200',
  X: 'bg-slate-100 text-slate-700 border-slate-300',
}

export function RecruiterSearch() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const recruiterProfile = user ? getRecruiterProfileByUserId(user.id) : null
  const savedSearchesAllowed = canUseSavedSearches(recruiterProfile)

  const initialArea = user ? getRecruiterArea(user.id) : { city: '', state: '', zip: '' }
  const [areaCity,  setAreaCity]  = useState(initialArea.city)
  const [areaState, setAreaState] = useState(initialArea.state)
  const [areaZip,   setAreaZip]   = useState(initialArea.zip)
  const [areaSaved, setAreaSaved] = useState(false)

  const [radius, setRadius] = useState(50)
  const [cdlClasses, setCdlClasses] = useState<CDLClass[]>([])
  const [endorsements, setEndorsements] = useState<Endorsement[]>([])
  const [availability, setAvailability] = useState<AvailabilityStatus | ''>('')

  const [saveSearchName, setSaveSearchName] = useState('')
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [savedSearches, setSavedSearches] = useState(() =>
    user?.role === 'recruiter' ? getSavedSearches(user.id) : []
  )
  const [profilesForBadges, setProfilesForBadges] = useState(() => getDriverProfiles())

  const refreshSavedSearchesAndProfiles = useCallback(() => {
    if (!user || user.role !== 'recruiter') return
    setSavedSearches(getSavedSearches(user.id))
    setProfilesForBadges(getDriverProfiles())
  }, [user])

  useEffect(() => {
    ensureDemoDrivers()
    setProfilesForBadges(getDriverProfiles())
    refreshSavedSearchesAndProfiles()
  }, [refreshSavedSearchesAndProfiles])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cdl_recruiter_saved_searches' || e.key === 'cdl_driver_profiles') {
        refreshSavedSearchesAndProfiles()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refreshSavedSearchesAndProfiles])

  const badgeById = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of savedSearches) {
      m.set(
        s.id,
        countNewMatchesSince(profilesForBadges, savedSearchToListFilters(s), s.last_seen_at)
      )
    }
    return m
  }, [savedSearches, profilesForBadges])

  const hasActiveFilters =
    cdlClasses.length > 0 || endorsements.length > 0 || Boolean(availability)

  const liveMatches = useMemo(
    () =>
      profilesForBadges.filter((p) =>
        profileMatchesRecruiterFilters(p, {
          city: areaCity,
          state: areaState,
          zip: areaZip,
          radius,
          cdlClasses,
          endorsements,
          availability: availability || undefined,
        })
      ),
    [profilesForBadges, areaCity, areaState, areaZip, radius, cdlClasses, endorsements, availability]
  )

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

  const handleSaveArea = () => {
    if (!user) return
    setRecruiterArea(user.id, { city: areaCity.trim(), state: areaState.trim(), zip: areaZip.trim() })
    setAreaSaved(true)
    setTimeout(() => setAreaSaved(false), 2500)
  }

  const goToAllDrivers = () => {
    navigate(recruiterDriversBrowsePath({ city: areaCity || initialArea.city, state: areaState || initialArea.state, zip: areaZip || initialArea.zip }))
  }

  const handleSaveCurrentSearch = () => {
    if (!user || user.role !== 'recruiter') return
    addSavedSearch({
      recruiterUserId: user.id,
      name: saveSearchName.trim() || undefined,
      radius,
      cdl_classes: cdlClasses,
      endorsements,
      availability: availability || undefined,
    })
    setSaveSearchName('')
    refreshSavedSearchesAndProfiles()
  }

  const handleViewSaved = (savedId: string) => {
    const row = savedSearches.find((s) => s.id === savedId)
    if (!row) return
    navigate(`/recruiter/drivers?${savedSearchToSearchParams(row)}`)
  }

  const handleDeleteSaved = (savedId: string) => {
    if (!user) return
    deleteSavedSearch(user.id, savedId)
    refreshSavedSearchesAndProfiles()
  }

  if (authLoading) return null
  if (!user || user.role !== 'recruiter') {
    return <Navigate to="/" replace />
  }

  return (
    <div style={{ background: '#f7f9ff' }}>

      {/* Hero */}
      <section className="relative h-48 md:h-72 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/welcomeback2.png')" }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ background: 'linear-gradient(to bottom, rgba(0,21,42,0.72), rgba(0,21,42,0.35))' }}
        >
          <h1 className="text-white text-3xl md:text-5xl font-bold uppercase tracking-wider mb-2">
            Find Drivers
          </h1>
          <p className="text-white/90 text-base md:text-lg">
            Powering Logistics through Precision Recruitment
          </p>
        </div>
      </section>

      {/* Main grid */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 flex flex-col lg:grid lg:grid-cols-12 gap-6">

        {/* ── Left Sidebar ── */}
        <aside className="lg:col-span-4 flex flex-col gap-4">

          {/* Hiring Area */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-secondary text-xl">location_on</span>
              <h2 className="font-semibold text-[#00152a]">Your hiring area</h2>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Set the city and ZIP to focus your recruitment radius.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">City</label>
                <select
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  value={areaCity}
                  onChange={(e) => {
                    const metro = FEATURED_METROS.find((m) => m.city === e.target.value)
                    if (metro) {
                      setAreaCity(metro.city)
                      setAreaState(metro.stateAbbr)
                      setAreaZip(metro.zip)
                    } else {
                      setAreaCity('')
                      setAreaState('')
                      setAreaZip('')
                    }
                  }}
                >
                  <option value="">Select a city…</option>
                  {FEATURED_METROS.map((m) => (
                    <option key={m.slug} value={m.city}>
                      {m.city}, {m.stateAbbr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">ZIP Code</label>
                <input
                  type="text"
                  readOnly
                  className="w-full bg-slate-50 border border-border rounded-lg px-3 py-2 text-sm text-text-secondary outline-none"
                  value={areaZip}
                  placeholder="Auto-filled"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveArea}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
                style={{ background: '#102a43', color: '#7a92b0' }}
              >
                {areaSaved ? 'Area saved ✓' : 'Save my area'}
              </button>
            </div>
          </div>

          {/* Fast Track Search */}
          <div
            className="relative overflow-hidden rounded-xl p-5 shadow-lg cursor-pointer transition-all active:scale-[0.98] group"
            style={{ background: '#00152a', color: 'white' }}
            onClick={goToAllDrivers}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goToAllDrivers()}
          >
            <div className="relative z-10">
              <h3 className="font-semibold text-base mb-1">Fast Track Search</h3>
              <p className="text-sm opacity-75 mb-4">
                Bypass filters to see every driver in your active zone.
              </p>
              <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: '#fd761a' }}>
                <span>View all drivers</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>person_search</span>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#00152a]">Search with filters</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="text-xs font-medium text-secondary hover:underline"
                  onClick={() => {
                    setCdlClasses([])
                    setEndorsements([])
                    setAvailability('')
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-col gap-5">

              {/* Radius */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Radius (miles)
                </label>
                <select
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r} miles</option>
                  ))}
                </select>
              </div>

              {/* CDL Class */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  CDL Class
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CDL_CLASS_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={cdlClasses.includes(c)}
                      className={`py-2 border rounded text-sm font-semibold transition-colors ${
                        cdlClasses.includes(c)
                          ? 'border-secondary bg-secondary text-white'
                          : 'border-border text-text-secondary hover:bg-slate-50'
                      }`}
                      onClick={() => toggleCdlClass(c)}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Endorsements */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Endorsements
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ENDORSEMENT_LABELS) as Endorsement[]).map((e) => (
                    <button
                      key={e}
                      type="button"
                      aria-pressed={endorsements.includes(e)}
                      className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border transition-all ${
                        endorsements.includes(e)
                          ? 'ring-2 ring-secondary ' + ENDORSEMENT_COLORS[e]
                          : ENDORSEMENT_COLORS[e]
                      }`}
                      onClick={() => toggleEndorsement(e)}
                    >
                      {ENDORSEMENT_LABELS[e]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Availability
                </label>
                <select
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityStatus | '')}
                >
                  {AVAILABILITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Saved Searches (pro only) */}
          {savedSearchesAllowed && (
            <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setShowSavedSearches((v) => !v)}
              >
                <span className="font-semibold text-sm text-[#00152a]">Saved searches</span>
                <span className="material-symbols-outlined text-base text-text-secondary">
                  {showSavedSearches ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showSavedSearches && (
                <div className="px-5 pb-5 flex flex-col gap-3">
                  <div>
                    <Input
                      label="Save current filters as…"
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                      placeholder="e.g. Class A + Hazmat in SLC"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-2 w-full"
                      onClick={handleSaveCurrentSearch}
                    >
                      Save current filters
                    </Button>
                  </div>

                  {savedSearches.length > 0 && (
                    <ul className="flex flex-col gap-2 border-t border-border pt-3">
                      {savedSearches.map((s) => {
                        const n = badgeById.get(s.id) ?? 0
                        return (
                          <li key={s.id} className="rounded-lg border border-border p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate text-[#00152a]">{s.name}</p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  {s.cdl_classes.length > 0 ? `Class ${s.cdl_classes.join(', ')}` : 'Any CDL'} · {s.radius} mi
                                </p>
                              </div>
                              {n > 0 && (
                                <span className="shrink-0 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-bold text-white">
                                  {n}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                className="flex-1 py-1 text-xs font-semibold text-white rounded"
                                style={{ background: '#00152a' }}
                                onClick={() => handleViewSaved(s.id)}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="flex-1 py-1 text-xs font-semibold border border-border rounded text-text-secondary hover:bg-slate-50"
                                onClick={() => handleDeleteSaved(s.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── Right: Driver Results ── */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Results header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-2xl font-bold text-[#00152a]">
                Matching drivers ({liveMatches.length})
              </h2>
              <p className="text-text-secondary text-sm mt-0.5">
                {hasActiveFilters
                  ? 'Updates instantly as you change filters.'
                  : 'Showing everyone in your area. Pick filters above to narrow the list.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary text-xs bg-[#e3efff] px-3 py-1.5 rounded shrink-0">
              <span className="material-symbols-outlined text-base">sort</span>
              <span className="font-medium">Sort by: Recent Activity</span>
            </div>
          </div>

          {/* Driver cards */}
          {liveMatches.length === 0 ? (
            <div className="rounded-xl border border-border bg-white p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-border mb-2 block">person_search</span>
              <p className="text-text-secondary text-sm">
                No drivers match these filters in your area. Try removing an endorsement or clearing filters.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {liveMatches.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-white border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">

                    {/* Left: Avatar + info */}
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-100">
                        <DriverAvatar profile={driver} size="md" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#00152a] text-base mb-2 group-hover:text-secondary transition-colors">
                          {driver.name}
                        </h3>

                        {/* CDL + Endorsement badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {driver.cdl_classes.map((c) => (
                            <span
                              key={c}
                              className="bg-blue-50 text-blue-700 text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-blue-100"
                            >
                              Class {c}
                            </span>
                          ))}
                          {driver.endorsements.map((e) => (
                            <span
                              key={e}
                              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${ENDORSEMENT_COLORS[e]}`}
                            >
                              {ENDORSEMENT_LABELS[e]}
                            </span>
                          ))}
                          {driver.endorsements.length === 0 && (
                            <span className="text-[11px] font-mono text-text-secondary italic">
                              No endorsements
                            </span>
                          )}
                        </div>

                        {/* Location + Phone */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span className="text-sm">{driver.city}, {driver.state}</span>
                          </div>
                          {driver.phone ? (
                            <div className="flex items-center gap-1.5 text-text-secondary">
                              <span className="material-symbols-outlined text-sm">call</span>
                              <span className="text-sm">{formatPhoneDisplay(driver.phone)}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-text-secondary">
                              <span className="material-symbols-outlined text-sm">call</span>
                              <span className="text-sm italic">No phone on file</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status + CTA */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between gap-3 shrink-0">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                          driver.availability_status === 'actively_looking'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {driver.availability_status === 'actively_looking'
                          ? 'Actively Looking'
                          : 'Open to Offers'}
                      </span>
                      <Link
                        to={`/recruiter/drivers/${driver.id}`}
                        className="bg-white border-2 border-secondary text-secondary font-bold px-5 py-2 rounded text-sm hover:bg-secondary hover:text-white transition-all whitespace-nowrap"
                      >
                        View Full Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
