import { Navigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { getOpenJobPostings } from '../lib/storage'
import { SLC_HIRING_COMPANIES } from '../data/slcHiringCompanies'

/** Prefix bare domains with https:// so anchor links work. */
const websiteHref = (site: string) =>
  /^https?:\/\//i.test(site) ? site : `https://${site}`

export function DriverHiringCompanies() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) return null
  if (!user || user.role !== 'driver') return <Navigate to="/" replace />

  // Always show companies — never gate on profile completion.
  const stored = getOpenJobPostings()
  const storedIds = new Set(stored.map((jp) => jp.id))
  const seedExtras = SLC_HIRING_COMPANIES.filter((c) => !storedIds.has(c.id))
  const companies = [...stored, ...seedExtras]

  return (
    <main
      className="relative flex min-h-screen flex-col bg-cover bg-center bg-no-repeat px-6 py-xl"
      style={{ backgroundImage: "url('/images/pexels-gustavo-fring-6720527.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-2xl">

        <p className="text-center text-xs font-semibold uppercase tracking-wider text-white/70">
          Driver account
        </p>
        <h2 className="mt-1 text-center text-3xl font-bold text-white">Companies Hiring</h2>
        <p className="mt-2 text-center text-sm text-white/80">
          CDL employers currently hiring in your area. Reach out directly using their contact info.
        </p>

        <ul className="mt-8 flex flex-col gap-4">
          {companies.map((jp) => (
            <li key={jp.id}>
              <Card className="p-5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">{jp.company_name}</h3>
                    {jp.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-text-secondary">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {jp.city}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
                    Hiring
                  </span>
                </div>

                {/* Job description */}
                {jp.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{jp.summary}</p>
                )}

                {/* Contact */}
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
                  {jp.phone && (
                    <a
                      href={`tel:${jp.phone}`}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">call</span>
                      {jp.phone}
                    </a>
                  )}
                  {jp.website && (
                    <a
                      href={websiteHref(jp.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      {jp.website}
                    </a>
                  )}
                  {jp.apply_email && (
                    <a
                      href={`mailto:${jp.apply_email}?subject=${encodeURIComponent('CDL driver inquiry')}`}
                      className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">mail</span>
                      {jp.apply_email}
                    </a>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
