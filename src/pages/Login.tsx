import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DEMO_DRIVER_PASSWORD } from '../data/demoDrivers'
import { DEMO_RECRUITER_PASSWORD, demoRecruiterUser } from '../data/demoRecruiter'
import { DEMO_DRIVER_EMAIL } from '../lib/seedDemoDrivers'

const MONO = { fontFamily: 'JetBrains Mono, monospace' } as const
const INTER = { fontFamily: 'Inter, sans-serif' } as const

const FIELD_CLASS =
  'w-full rounded-lg border border-[#c3c6ce] bg-white py-3 pl-10 pr-4 outline-none transition-all focus:border-[#9d4300] focus:ring-2 focus:ring-[#fd761a]'

function TopBar() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c3c6ce] bg-[#f7f9ff] px-4 md:px-10">
      <Link to="/" className="flex items-center gap-2 no-underline active:opacity-80">
        <span className="material-symbols-outlined text-3xl text-[#9d4300]">local_shipping</span>
        <h1 className="text-xl font-bold tracking-tight text-[#9d4300]">HaulLogic</h1>
      </Link>
      <nav className="hidden items-center gap-6 md:flex" style={MONO}>
        <Link to="/" className="text-sm font-medium text-[#43474d] no-underline transition-colors hover:text-[#9d4300]">JOBS</Link>
        <Link to="/" className="text-sm font-medium text-[#43474d] no-underline transition-colors hover:text-[#9d4300]">JOB POSTINGS</Link>
        <Link to="/login" className="text-sm font-bold text-[#9d4300] no-underline">LOGIN</Link>
        <Link
          to="/signup"
          className="rounded-lg bg-[#fd761a] px-6 py-2 text-sm font-bold text-[#5c2400] no-underline transition-all hover:bg-[#9d4300] hover:text-white active:scale-95"
        >
          SIGN UP
        </Link>
      </nav>
    </header>
  )
}

function PageFooter() {
  return (
    <footer className="w-full border-t border-[#c3c6ce] bg-white px-10 py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-[#00152a]">HaulLogic</h3>
          <span className="text-xs text-[#43474d]" style={MONO}>| Professional Freight Network</span>
        </div>
        <div className="flex gap-6" style={MONO}>
          <a href="#" className="text-xs text-[#43474d] no-underline hover:text-[#9d4300]">Terms</a>
          <a href="#" className="text-xs text-[#43474d] no-underline hover:text-[#9d4300]">Privacy</a>
          <a href="#" className="text-xs text-[#43474d] no-underline hover:text-[#9d4300]">Safety</a>
        </div>
        <div className="text-xs text-[#43474d]" style={MONO}>© 2026 HaulLogic Systems Inc.</div>
      </div>
    </footer>
  )
}

/** Full-bleed hero background with the dark overlay used behind the login card. */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bus-driver-messages.png')" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(rgba(0,21,42,0.7), rgba(0,21,42,0.85))' }}
      />
    </div>
  )
}

export function Login() {
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const locState = location.state as { from?: { pathname: string }; prefillEmail?: string } | null
  const redirectFrom = locState?.from?.pathname
  const [email, setEmail] = useState(() => locState?.prefillEmail ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const prefillFromNav = locState?.prefillEmail
  useEffect(() => {
    if (prefillFromNav) setEmail(prefillFromNav)
  }, [prefillFromNav])

  useEffect(() => {
    if (authLoading || !user) return
    const safe =
      redirectFrom &&
      redirectFrom.startsWith('/') &&
      !redirectFrom.startsWith('//') &&
      (user.role === 'driver'
        ? redirectFrom.startsWith('/driver')
        : redirectFrom.startsWith('/recruiter'))
    let target: string
    if (safe) {
      target = redirectFrom
    } else if (user.role === 'driver') {
      target = '/driver/profile'
    } else if (user.role === 'recruiter') {
      target = '/recruiter/search'
    } else {
      target = '/'
    }
    navigate(target, { replace: true })
  }, [authLoading, user, navigate, redirectFrom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async (demoEmail: string, demoPassword: string) => {
    setError('')
    setLoading(true)
    try {
      await signIn(demoEmail, demoPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  // Interim states — keep the branded shell over the hero.
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-[#f7f9ff] text-[#001d32]" style={INTER}>
        <TopBar />
        <div className="relative flex min-h-screen items-center justify-center pt-16">
          <HeroBackdrop />
          <p className="relative z-10 text-white">
            {authLoading ? 'Loading…' : 'Taking you to your account…'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#001d32]" style={INTER}>
      <TopBar />

      <main className="relative flex min-h-screen items-center justify-center pt-16">
        <HeroBackdrop />

        <section className="relative z-10 w-full max-w-md px-4 md:px-0">
          <div
            className="rounded-xl border border-[#c3c6ce] p-8 shadow-2xl"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.95)' }}
          >
            {/* Branding & title */}
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#102a43]">
                <span className="material-symbols-outlined text-4xl text-[#ffb690]">local_shipping</span>
              </div>
              <h2 className="mb-1 text-[32px] font-bold leading-[40px] text-[#00152a]">Driver Login</h2>
              <p className="text-[#43474d]">Welcome back, Captain. Manage your hauls.</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="ml-1 block text-sm font-medium text-[#001d32]" style={MONO}>
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777e]">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="driver@haullogic.com"
                    className={FIELD_CLASS}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="password" className="block text-sm font-medium text-[#001d32]" style={MONO}>
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-[#9d4300] hover:underline" style={MONO}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777e]">lock</span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={FIELD_CLASS}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 px-1 py-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#c3c6ce] text-[#fd761a] focus:ring-[#9d4300]"
                />
                <label htmlFor="remember" className="cursor-pointer text-xs text-[#43474d]" style={MONO}>
                  Remember this device
                </label>
              </div>

              {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-lg bg-[#fd761a] py-4 font-bold text-[#5c2400] shadow-md transition-all hover:bg-[#9d4300] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            {/* Demo login */}
            <div className="mt-6 border-t border-[#c3c6ce] pt-4">
              <p className="mb-3 text-center text-xs text-[#43474d]" style={MONO}>
                JUST LOOKING? TRY THE DEMO
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemo(demoRecruiterUser.email, DEMO_RECRUITER_PASSWORD)}
                  className="rounded-lg border border-[#9d4300] py-3 text-sm font-bold text-[#9d4300] transition-all hover:bg-[#9d4300] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  Demo Recruiter
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemo(DEMO_DRIVER_EMAIL, DEMO_DRIVER_PASSWORD)}
                  className="rounded-lg border border-[#9d4300] py-3 text-sm font-bold text-[#9d4300] transition-all hover:bg-[#9d4300] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
                >
                  Demo Driver
                </button>
              </div>
            </div>

            {/* Signup prompt */}
            <div className="mt-8 border-t border-[#c3c6ce] pt-4 text-center">
              <p className="text-[#43474d]">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="font-bold text-[#9d4300] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Supporting info */}
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-1 text-xs text-white/80" style={MONO}>
              <span className="material-symbols-outlined text-sm">verified_user</span>
              SECURE LOGIN
            </div>
            <div className="flex items-center gap-1 text-xs text-white/80" style={MONO}>
              <span className="material-symbols-outlined text-sm">support_agent</span>
              24/7 SUPPORT
            </div>
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  )
}
