import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { DriverAvatar } from '../components/DriverAvatar'
import { useAuth } from '../contexts/AuthContext'
import { clearRemovedDemoProfileIds, getDriverProfiles } from '../lib/storage'
import { ensureDemoDrivers } from '../lib/seedDemoDrivers'
import { ENDORSEMENT_LABELS } from '../lib/constants'
import { parseCdlQueryValues } from '../lib/cdlClasses'
import { getRecruiterArea, recruiterDriversBrowsePath } from '../lib/recruiterArea'
import { countNewMatchesSince, profileMatchesRecruiterFilters } from '../lib/recruiterDriverFilters'
import {
  getSavedSearchById,
  savedSearchToListFilters,
  savedSearchToSearchParams,
  updateSavedSearchLastSeen,
  urlParamsMatchSavedSearch,
} from '../lib/savedSearches'
import type { Endorsement, AvailabilityStatus } from '../types'

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

export function RecruiterDriverList() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsString = searchParams.toString()
  const cityFromUrl = searchParams.get('city') ?? ''
  const stateFromUrl = searchParams.get('state') ?? ''
  const zipFromUrl = searchParams.get('zip') ?? ''
  const radiusFromUrl = Number(searchParams.get('radius') || '0') || undefined
  const cdlClasses = parseCdlQueryValues(searchParams.getAll('cdl') || [])
  const endorsements = (searchParams.getAll('endorsement') || []) as Endorsement[]
  const availability = (searchParams.get('availability') || undefined) as AvailabilityStatus | undefined
  const savedId = searchParams.get('saved')

  const recruiterArea = user ? getRecruiterArea(user.id) : { city: '', state: '', zip: '' }
  const city  = cityFromUrl  || recruiterArea.city
  const state = stateFromUrl || recruiterArea.state
  const zip   = zipFromUrl   || recruiterArea.zip

  const [allProfiles, setAllProfiles] = useState(() => getDriverProfiles())
  useEffect(() => {
    ensureDemoDrivers()
    setAllProfiles(getDriverProfiles())
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'recruiter' || !savedId) return
    const row = getSavedSearchById(user.id, savedId)
    if (!row) return
    const params = new URLSearchParams(paramsString)
    if (urlParamsMatchSavedSearch(row, params)) return
    setSearchParams(savedSearchToSearchParams(row), { replace: true })
  }, [user, savedId, paramsString, setSearchParams])

  const savedRow = useMemo(() => {
    if (!user || user.role !== 'recruiter' || !savedId) return undefined
    const row = getSavedSearchById(user.id, savedId)
    if (!row) return undefined
    const params = new URLSearchParams(paramsString)
    if (!urlParamsMatchSavedSearch(row, params)) return undefined
    return row
  }, [user, savedId, paramsString])

  const savedSearchNewCount = useMemo(() => {
    if (!savedRow) return 0
    return countNewMatchesSince(allProfiles, savedSearchToListFilters(savedRow), savedRow.last_seen_at)
  }, [savedRow, allProfiles])

  const showSavedSearchBanner =
    Boolean(savedRow) && (savedSearchNewCount > 0 || savedRow?.last_seen_at === null)

  const handleMarkSavedSearchReviewed = useCallback(() => {
    if (!user || user.role !== 'recruiter' || !savedRow) return
    updateSavedSearchLastSeen(user.id, savedRow.id, new Date().toISOString())
    const next = new URLSearchParams(searchParams)
    next.delete('saved')
    setSearchParams(next, { replace: true })
  }, [user, savedRow, searchParams, setSearchParams])

  const filtered = useMemo(
    () =>
      allProfiles.filter((p) =>
        profileMatchesRecruiterFilters(p, {
          city,
          state,
          zip,
          radius: radiusFromUrl,
          cdlClasses,
          endorsements,
          availability,
        })
      ),
    [allProfiles, city, state, zip, cdlClasses, endorsements, availability]
  )

  const hasQualificationFilters = Boolean(
    cdlClasses.length > 0 || endorsements.length > 0 || availability
  )

  const cityLabel = [city, state].filter(Boolean).join(', ') || 'this area'

  return (
    <div style={{ background: '#f7f9ff', minHeight: '100vh' }}>

      {/* Hero */}
      <section className="relative h-36 md:h-56 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/cdl-driving-hero.png')" }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ background: 'linear-gradient(to bottom, rgba(0,21,42,0.72), rgba(0,21,42,0.35))' }}
        >
          <h1 className="text-white text-2xl md:text-4xl font-bold uppercase tracking-wider mb-1">
            Driver Results
          </h1>
          {(city || state) && (
            <p className="text-white/80 text-sm md:text-base">{cityLabel}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">

        {/* Back link + header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-4 mb-6">
          <div>
            <Link
              to="/recruiter/search"
              className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline mb-2"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Find Drivers
            </Link>
            <h2 className="text-2xl font-bold text-[#00152a]">
              Drivers ({filtered.length})
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary text-xs bg-[#e3efff] px-3 py-1.5 rounded shrink-0">
            <span className="material-symbols-outlined text-base">sort</span>
            <span className="font-medium">Sort by: Recent Activity</span>
          </div>
        </div>

        {/* Saved search banner */}
        {showSavedSearchBanner && savedRow && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#102a43]/30 bg-[#e3efff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#00152a]">
              {savedRow.last_seen_at === null ? (
                <>
                  First time viewing this saved search —{' '}
                  <strong>{savedSearchNewCount}</strong> profile
                  {savedSearchNewCount !== 1 ? 's' : ''} currently match.
                </>
              ) : (
                <>
                  <strong>{savedSearchNewCount}</strong> profile
                  {savedSearchNewCount !== 1 ? 's' : ''} updated since you last reviewed this search.
                </>
              )}
            </p>
            <Button type="button" variant="secondary" className="shrink-0" onClick={handleMarkSavedSearchReviewed}>
              Mark reviewed
            </Button>
          </div>
        )}

        {/* Empty states */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-white p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-border mb-3 block">person_search</span>
            {allProfiles.length > 0 && hasQualificationFilters ? (
              <>
                <p className="text-text-secondary text-sm mb-4">
                  No drivers match these filters in {cityLabel}. Clear qualification filters to see everyone in the area.
                </p>
                <Link
                  to={recruiterDriversBrowsePath()}
                  className="inline-flex items-center gap-1 font-semibold text-sm text-secondary hover:underline"
                >
                  View all {cityLabel} drivers
                </Link>
              </>
            ) : allProfiles.length === 0 ? (
              <>
                <p className="text-text-secondary text-sm mb-4">
                  No driver profiles in this browser yet. Demo drivers load on first visit.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-sm text-secondary hover:underline"
                  onClick={() => {
                    clearRemovedDemoProfileIds()
                    ensureDemoDrivers()
                    setAllProfiles(getDriverProfiles())
                  }}
                >
                  Load demo drivers again
                </button>
              </>
            ) : (
              <p className="text-text-secondary text-sm">
                No drivers found in {cityLabel} for this browser. Try loading demo drivers or add profiles in this area.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((driver) => (
              <div
                key={driver.id}
                className="bg-white border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-5">

                  {/* Avatar + info */}
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-slate-100">
                      <DriverAvatar profile={driver} size="md" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#00152a] text-base mb-2 group-hover:text-secondary transition-colors">
                        {driver.name}
                      </h3>

                      {/* Badges */}
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
                          <span className="text-[11px] font-mono text-text-secondary italic">No endorsements</span>
                        )}
                      </div>

                      {/* Location + phone */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="text-sm">{driver.city}, {driver.state}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <span className="material-symbols-outlined text-sm">call</span>
                          <span className="text-sm">
                            {driver.phone ? formatPhoneDisplay(driver.phone) : <span className="italic">No phone on file</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status + CTA */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between gap-3 shrink-0">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                        driver.availability_status === 'actively_looking'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {driver.availability_status === 'actively_looking' ? 'Actively Looking' : 'Open to Offers'}
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
  )
}
