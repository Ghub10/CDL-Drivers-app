import type { CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FEATURED_METROS } from './CityLanding'

const NAVY = '#0d1b2a'
const ORANGE = '#fd761a' // brand orange matching the rest of the app

const HERO_STYLE: CSSProperties = {
  backgroundImage: "url('/images/screen.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

// Light overlay — keeps the photo visible while making the white/amber text legible.
const OVERLAY_CLASS = 'absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/55'

export function Landing() {
  const navigate = useNavigate()
  const location = useLocation()


  return (
    <>
      {/* ── White top navbar ── */}
      <nav
        className="relative z-20 flex items-center justify-between bg-white px-6 py-3 sm:px-10"
        style={{ borderBottom: '3px solid #fd761a' }}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ background: NAVY }}
          >
            <span className="font-display text-base font-800 leading-none text-white">H</span>
            <span className="font-display text-base font-800 leading-none text-amber-400">L</span>
          </div>
          <span
            className="font-display text-base font-800 uppercase tracking-wide sm:text-lg"
            style={{ color: NAVY }}
          >
            Utah CDL Job Platform
          </span>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-5 sm:gap-8">
          <Link
            to="/"
            className="font-display text-sm font-700 uppercase tracking-wide no-underline transition hover:opacity-80"
            style={{ color: ORANGE }}
          >
            Home
          </Link>
          <Link
            to="/login"
            state={{ from: location }}
            className="rounded-lg px-6 py-2.5 font-display text-sm font-700 uppercase tracking-wide text-white no-underline shadow-md transition hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: ORANGE }}
          >
            Log In
          </Link>
        </div>
      </nav>

      {/* ── Hero with background photo ── */}
      <div className="relative flex min-h-[88vh] flex-col" style={HERO_STYLE}>
        <div className={OVERLAY_CLASS} />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
          <p className="slide-in-expo font-display text-base font-700 uppercase tracking-[0.22em] sm:text-lg" style={{ color: '#fd761a' }}>
            Connect CDL drivers and recruiters statewide
          </p>

          <h1
            className="slide-in-expo slide-in-expo-1 mt-6 text-center font-display text-6xl font-800 uppercase leading-[0.95] text-white sm:text-7xl lg:text-8xl"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.45)' }}
          >
            Drive your career<br />
            <span style={{ color: '#fd761a' }}>forward</span>
          </h1>

          {/* CTAs — side by side */}
          <div className="slide-in-expo slide-in-expo-2 mt-10 flex w-full max-w-3xl flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/signup?role=driver')}
              className="flex-1 rounded-xl px-6 py-5 font-display text-lg font-700 uppercase tracking-wide text-white shadow-xl transition active:scale-[0.98]"
              style={{ background: '#fd761a' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#9d4300')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fd761a')}
            >
              I&apos;m a driver — get started free
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup?role=recruiter')}
              className="flex-1 rounded-xl border border-white/40 bg-white/10 px-6 py-5 font-display text-lg font-700 uppercase tracking-wide text-white shadow-xl backdrop-blur-md transition hover:border-white/70 hover:bg-white/20 active:scale-[0.98]"
            >
              I&apos;m a recruiter — find drivers
            </button>
          </div>

          {/* Returning users */}
          <div className="slide-in-expo slide-in-expo-3 mt-8 flex items-center gap-3 text-sm text-white/80">
            <span>Already have an account?</span>
            <Link
              to="/login"
              state={{ from: location }}
              className="font-700 no-underline"
              style={{ color: '#fd761a' }}
            >
              Log in
            </Link>
            <span className="text-white/40">|</span>
            <Link
              to="/forgot-password"
              className="font-600 text-white no-underline hover:opacity-80"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      {/* ── Browse drivers by city — white section below hero ── */}
      <section className="bg-white py-12">
        <p
          className="text-center text-xs font-700 uppercase tracking-[0.25em]"
          style={{ color: NAVY }}
        >
          Browse drivers by city
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 px-6">
          {FEATURED_METROS.map((m) => (
            <Link
              key={m.slug}
              to={`/drivers/${m.slug}`}
              className="rounded-full border border-stone-200 bg-stone-50 px-5 py-2.5 text-sm font-700 no-underline transition hover:border-[#fd761a]/60 hover:text-[#9d4300]"
              style={{ color: NAVY }}
            >
              {m.city}, {m.stateAbbr}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
