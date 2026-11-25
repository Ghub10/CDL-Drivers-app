/**
 * Dynamic SEO landing page — one page per metro area.
 *
 * Routes like /drivers/phoenix-az or /drivers/salt-lake-city-ut render this
 * component with the city slug in the URL.  Each page is independently
 * indexable by search engines ("CDL drivers available in Phoenix AZ").
 *
 * When Vite SSG / prerendering is configured, generate one static HTML file
 * per city in FEATURED_METROS.  Until then, the page works as a SPA route.
 */
import { useMemo } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getDriverProfiles } from '../lib/storage'
import { getDriverPhotoUrl } from '../lib/driverPhoto'
import type { DriverProfile } from '../types'

export interface Metro {
  slug:  string
  city:  string
  state: string
  stateAbbr: string
  zip: string
  headline: string
  description: string
}

export const FEATURED_METROS: Metro[] = [
  {
    slug:        'salt-lake-city-ut',
    city:        'Salt Lake City',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84101',
    headline:    'CDL Drivers Available in Salt Lake City, UT',
    description: 'Browse verified Class A and Class B CDL drivers located in the Salt Lake City metro area. Connect with drivers who are actively looking or open to offers.',
  },
  {
    slug:        'provo-ut',
    city:        'Provo',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84601',
    headline:    'CDL Drivers Available in Provo, UT',
    description: 'Find Class A and Class B CDL drivers in the Provo-Orem corridor. Filter by endorsement, availability, and employment type.',
  },
  {
    slug:        'ogden-ut',
    city:        'Ogden',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84401',
    headline:    'CDL Drivers Available in Ogden, UT',
    description: 'Search CDL drivers in the Ogden metro and Weber County. Experienced flatbed, tanker, and hazmat drivers ready to connect.',
  },
  {
    slug:        'st-george-ut',
    city:        'St. George',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84770',
    headline:    'CDL Drivers Available in St. George, UT',
    description: 'Connect with CDL-A and CDL-B drivers in the St. George area. One of Utah\'s fastest-growing freight corridors.',
  },
  {
    slug:        'logan-ut',
    city:        'Logan',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84321',
    headline:    'CDL Drivers Available in Logan, UT',
    description: 'Browse available CDL drivers in Logan and Cache Valley. Class A OTR and regional specialists in the directory.',
  },
  {
    slug:        'layton-ut',
    city:        'Layton',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84041',
    headline:    'CDL Drivers Available in Layton, UT',
    description: 'Find qualified CDL drivers in Layton and Davis County. Strong supply of Class A and Class B drivers for local and regional routes.',
  },
  {
    slug:        'orem-ut',
    city:        'Orem',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84057',
    headline:    'CDL Drivers Available in Orem, UT',
    description: 'Search CDL drivers across Orem and Utah County. Hazmat, tanker, and doubles endorsements available.',
  },
  {
    slug:        'west-valley-city-ut',
    city:        'West Valley City',
    state:       'Utah',
    stateAbbr:   'UT',
    zip:         '84119',
    headline:    'CDL Drivers Available in West Valley City, UT',
    description: 'Discover Class A and Class B CDL drivers in West Valley City. Close proximity to the SLC freight hub with strong driver availability.',
  },
]

export function metroFromSlug(slug: string): Metro | undefined {
  return FEATURED_METROS.find((m) => m.slug === slug)
}

function DriverCard({ profile }: { profile: DriverProfile }) {
  const photoUrl = getDriverPhotoUrl(profile)
  return (
    <div className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-3 shadow-sm">
      <img
        src={photoUrl}
        alt={profile.name}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{profile.name}</p>
        <p className="text-small text-text-secondary">
          Class {profile.cdl_classes.join('/')} · {profile.city}, {profile.state}
        </p>
        <p className="text-xs text-text-secondary">
          {profile.availability_status === 'actively_looking' ? 'Actively looking' : 'Open to offers'}
        </p>
      </div>
    </div>
  )
}

export function CityLanding() {
  const { slug } = useParams<{ slug: string }>()
  const metro = slug ? metroFromSlug(slug) : undefined

  const localDrivers = useMemo(() => {
    if (!metro) return []
    return getDriverProfiles()
      .filter((p) => p.state.toUpperCase() === metro.stateAbbr)
      .slice(0, 6)
  }, [metro])

  if (!metro) return <Navigate to="/" replace />

  const recruiterSearchUrl = `/signup?role=recruiter&city=${encodeURIComponent(metro.city)}&state=${metro.stateAbbr}`

  return (
    <main className="flex min-h-screen flex-col px-6 py-xl">
      {/* ── Hero text (SEO) ──────────────────────────────────────── */}
      <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
        {metro.headline}
      </h1>
      <p className="mt-3 max-w-2xl text-body text-text-secondary">{metro.description}</p>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-card border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        {[
          { label: 'Drivers in state', value: `${localDrivers.length > 0 ? localDrivers.length + '+' : '–'}` },
          { label: 'CDL Classes', value: 'A & B' },
          { label: 'Free for drivers', value: '✓' },
          { label: 'Endorsements', value: 'H N T P S X' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-xl font-bold text-primary">{s.value}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Driver preview ───────────────────────────────────────── */}
      {localDrivers.length > 0 && (
        <section className="mt-lg">
          <h2 className="text-lg font-semibold text-slate-900">
            Available drivers in {metro.state}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {localDrivers.map((p) => (
              <DriverCard key={p.id} profile={p} />
            ))}
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            Showing {localDrivers.length} of many.{' '}
            <Link to="/signup?role=recruiter" className="font-medium text-primary underline">
              Sign up to see the full directory →
            </Link>
          </p>
        </section>
      )}

      {/* ── CTA for recruiters ───────────────────────────────────── */}
      <section className="mt-lg rounded-card border border-primary/20 bg-primary/5 p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Hiring CDL drivers in {metro.city}?
        </h2>
        <p className="mt-2 text-body text-text-secondary">
          Create a free recruiter account, browse the driver directory, post open positions, and
          message qualified candidates directly.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to={recruiterSearchUrl}
            className="inline-flex min-h-touch items-center rounded-input bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* ── CTA for drivers ─────────────────────────────────────── */}
      <section className="mt-lg rounded-card border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          CDL driver in {metro.city}?
        </h2>
        <p className="mt-2 text-body text-text-secondary">
          Create your free driver profile and get found by recruiters actively hiring in{' '}
          {metro.city}. No fees, no middlemen.
        </p>
        <Link
          to="/signup?role=driver"
          className="mt-4 inline-flex min-h-touch items-center rounded-input bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
        >
          Create driver profile →
        </Link>
      </section>

      {/* ── Other metro links (internal linking for SEO) ─────────── */}
      <section className="mt-xl">
        <h3 className="text-base font-semibold text-slate-700">CDL drivers in other cities</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {FEATURED_METROS.filter((m) => m.slug !== slug).map((m) => (
            <li key={m.slug}>
              <Link
                to={`/drivers/${m.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-primary hover:bg-slate-50"
              >
                {m.city}, {m.stateAbbr}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
