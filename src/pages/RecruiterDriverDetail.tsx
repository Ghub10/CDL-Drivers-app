import { useParams, Link, useNavigate } from 'react-router-dom'
import { getDriverProfiles } from '../lib/storage'
import { getRecruiterArea, recruiterDriversBrowsePath } from '../lib/recruiterArea'
import { useAuth } from '../contexts/AuthContext'
import { ENDORSEMENT_LABELS } from '../lib/constants'
import { getResumeLink } from '../lib/resumeStorage'
import { DriverAvatar } from '../components/DriverAvatar'
import type { Endorsement } from '../types'

const ENDORSEMENT_COLORS: Record<Endorsement, string> = {
  H: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  N: 'bg-blue-50 text-blue-700 border-blue-100',
  T: 'bg-slate-50 text-slate-600 border-slate-200',
  P: 'bg-green-50 text-green-800 border-green-200',
  S: 'bg-orange-50 text-orange-800 border-orange-200',
  X: 'bg-slate-100 text-slate-700 border-slate-300',
}

export function RecruiterDriverDetail() {
  const { driverId } = useParams<{ driverId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const profiles = getDriverProfiles()
  const driver = profiles.find((p) => p.id === driverId)

  const area = user ? getRecruiterArea(user.id) : undefined
  const browsePath = recruiterDriversBrowsePath(area)

  if (!driver || !user) {
    return (
      <div style={{ background: '#f7f9ff', minHeight: '100vh' }} className="flex flex-col items-center justify-center px-4">
        <p className="text-text-secondary mb-4">Driver not found.</p>
        <Link to={browsePath} className="text-secondary font-semibold hover:underline">
          Back to list
        </Link>
      </div>
    )
  }

  const availabilityLabel =
    driver.availability_status === 'actively_looking' ? 'Actively Looking' : 'Open to Offers'
  const employmentLabel =
    driver.employment_type === 'full_time' ? 'Full-time' : 'Part-time'

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
          <h1 className="text-white text-2xl md:text-4xl font-bold uppercase tracking-wider">
            Driver Profile
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">

        {/* Back link */}
        <Link
          to={browsePath}
          className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline mb-6"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to driver list
        </Link>

        {/* Profile card */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

          {/* Top section: avatar + name + badges */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 border-b border-border">
            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 bg-slate-100 ring-4 ring-[#e3efff]">
              <DriverAvatar profile={driver} size="lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#00152a]">{driver.name}</h2>
                  <p className="text-text-secondary text-sm mt-0.5">
                    {driver.city}, {driver.state} {driver.zip_code}
                  </p>
                </div>
                <span
                  className={`self-start text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                    driver.availability_status === 'actively_looking'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {availabilityLabel}
                </span>
              </div>

              {/* CDL + endorsement badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {driver.cdl_classes.map((c) => (
                  <span
                    key={c}
                    className="bg-blue-50 text-blue-700 text-[11px] font-mono font-semibold px-2.5 py-1 rounded border border-blue-100"
                  >
                    Class {c}
                  </span>
                ))}
                {driver.endorsements.map((e) => (
                  <span
                    key={e}
                    className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded border ${ENDORSEMENT_COLORS[e]}`}
                  >
                    {ENDORSEMENT_LABELS[e]}
                  </span>
                ))}
                {driver.endorsements.length === 0 && (
                  <span className="text-[11px] font-mono text-text-secondary italic">No endorsements</span>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">

            {/* Contact */}
            <div className="p-6 md:p-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
                Contact
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary text-lg">call</span>
                  <div>
                    <p className="text-xs text-text-secondary">Phone</p>
                    <a href={`tel:${driver.phone}`} className="text-sm font-medium text-secondary hover:underline">
                      {driver.phone || '—'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary text-lg">mail</span>
                  <div>
                    <p className="text-xs text-text-secondary">Email</p>
                    <a href={`mailto:${driver.email}`} className="text-sm font-medium text-secondary hover:underline break-all">
                      {driver.email || '—'}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary text-lg">location_on</span>
                  <div>
                    <p className="text-xs text-text-secondary">Location</p>
                    <p className="text-sm font-medium text-[#00152a]">
                      {driver.city}, {driver.state} {driver.zip_code}
                    </p>
                  </div>
                </div>
                {driver.license_number && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-secondary text-lg">badge</span>
                    <div>
                      <p className="text-xs text-text-secondary">License #</p>
                      <p className="text-sm font-medium text-[#00152a]">{driver.license_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="p-6 md:p-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
                Availability
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary text-lg">event_available</span>
                  <div>
                    <p className="text-xs text-text-secondary">Status</p>
                    <p className="text-sm font-medium text-[#00152a]">{availabilityLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary text-lg">calendar_today</span>
                  <div>
                    <p className="text-xs text-text-secondary">Start date</p>
                    <p className="text-sm font-medium text-[#00152a]">
                      {driver.availability_start_date || 'Not specified'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-text-secondary text-lg">schedule</span>
                  <div>
                    <p className="text-xs text-text-secondary">Employment type</p>
                    <p className="text-sm font-medium text-[#00152a]">{employmentLabel}</p>
                  </div>
                </div>
                {driver.resume_url && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-secondary text-lg">description</span>
                    <div>
                      <p className="text-xs text-text-secondary">Resume</p>
                      <button
                        type="button"
                        onClick={async () => {
                          // Open the tab first (browsers block popups after a wait), then point it at the signed link.
                          const tab = window.open('', '_blank')
                          const link = await getResumeLink(driver.resume_url)
                          if (link && tab) {
                            tab.location.href = link
                          } else {
                            tab?.close()
                            window.alert("Couldn't open this resume. Please try again.")
                          }
                        }}
                        className="text-sm font-medium text-secondary hover:underline"
                      >
                        View resume
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-border flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/recruiter/messages?driverId=${driver.user_id}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: '#00152a' }}
            >
              <span className="material-symbols-outlined text-base">chat</span>
              Message
            </button>
            <a
              href={`tel:${driver.phone}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm bg-white border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-base">call</span>
              Call
            </a>
            <a
              href={`mailto:${driver.email}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm bg-white border-2 border-border text-text-secondary hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
