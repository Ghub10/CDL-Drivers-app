import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export function SignUp() {
  const [params] = useSearchParams()
  const role = (params.get('role') as 'driver' | 'recruiter') || 'driver'
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (role === 'recruiter' && (!name.trim() || !company.trim() || !phone.trim())) {
      setError('Name, company, and phone are required')
      return
    }
    setLoading(true)
    try {
      const result = await signUp(email, password, role, role === 'recruiter' ? { name: name.trim(), companyName: company.trim(), phone: phone.trim() } : undefined)
      if (isSupabaseConfigured) {
        if (result?.sessionCreated) {
          // Email confirmation is off — user is already logged in, go to dashboard
          navigate(role === 'driver' ? '/driver/profile' : '/recruiter/search', { replace: true })
        } else {
          // Email confirmation is on — show inbox screen
          setEmailSent(true)
        }
      } else {
        // localStorage demo — navigate to the local simulate-verify page
        const users = (await import('../lib/storage')).getUsers()
        const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase())
        if (u) navigate(`/verify-email?userId=${u.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-xl">
        <div className="w-full max-w-md rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-green-900">Check your inbox</h2>
          <p className="mt-3 text-sm text-green-800">
            We sent a verification link to <strong>{email}</strong>.
            Click the link in that email to activate your account.
          </p>
          <p className="mt-3 text-xs text-green-700">
            Don&apos;t see it? Check your spam or junk folder.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block font-semibold text-green-800 underline underline-offset-2 hover:text-green-950"
          >
            Back to log in
          </Link>
        </div>
      </main>
    )
  }

  // ── Recruiter sign-up — Material Design 3 themed layout (HaulLogic mockup) ──
  if (role === 'recruiter') {
    const MONO = { fontFamily: 'JetBrains Mono, monospace' } as const
    const inputClass =
      'w-full rounded-lg border border-[#c3c6ce] bg-white px-4 py-3 text-[#001d32] outline-none transition-all focus:border-[#102a43] focus:ring-2 focus:ring-[#102a43]'
    const labelClass =
      'ml-1 block text-sm font-medium text-[#43474d] transition-colors group-focus-within:text-[#9d4300]'

    return (
      <main
        className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8"
        style={{ backgroundImage: "url('/images/recruiter.png')", fontFamily: 'Inter, sans-serif' }}
      >
        {/* Hero overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,21,42,0.7), rgba(0,21,42,0.4))' }}
          aria-hidden="true"
        />

        <div className="relative z-10 my-8 w-full max-w-[540px]">
          {/* Sign-up card */}
          <div className="overflow-hidden rounded-xl border border-[#c3c6ce] bg-white shadow-xl">
            {/* Header */}
            <div className="border-b border-[#c3c6ce] bg-[#edf4ff] p-8 text-center">
              <div
                className="mb-2 inline-block rounded-full bg-[#fd761a] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#5c2400]"
                style={MONO}
              >
                Recruiter Sign-Up
              </div>
              <h2 className="mb-2 text-[32px] font-bold leading-[40px] text-[#00152a]">
                Create Recruiter Account
              </h2>
              <p className="text-base text-[#43474d]">
                Join the network of top logistics companies. Provide your details below to start
                recruiting elite CDL drivers.
              </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="space-y-6 p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="group space-y-1">
                  <label className={labelClass} style={MONO}>Name</label>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="group space-y-1">
                  <label className={labelClass} style={MONO}>Company</label>
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="Logistics Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="group space-y-1">
                  <label className={labelClass} style={MONO}>Phone</label>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="group space-y-1">
                  <label className={labelClass} style={MONO}>Email</label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="recruiter@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group space-y-1">
                <label className={labelClass} style={MONO}>Password</label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="group space-y-1">
                <label className={labelClass} style={MONO}>Confirm Password</label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>

              <div className="text-right">
                <Link
                  to="/signup?role=driver"
                  className="text-sm font-medium text-[#9d4300] transition-all hover:underline"
                  style={MONO}
                >
                  Switch to driver sign-up
                </Link>
              </div>

              {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00152a] py-4 text-lg font-bold text-white transition-all hover:bg-[#0c2b43] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>
                  {loading ? 'sync' : 'arrow_forward'}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="border-t border-[#c3c6ce] bg-[#e3efff] p-6 text-center">
              <p className="text-base text-[#43474d]">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-1 font-bold text-[#00152a] transition-colors hover:text-[#9d4300]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {([
              ['verified_user', 'Verified Drivers'],
              ['bolt', 'Fast Hiring'],
              ['security', 'Secure Data'],
            ] as const).map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md">
                  <span className="material-symbols-outlined text-white">{icon}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // Driver sign-up only (recruiter returns above)
  const backgroundImage = "url('/images/background%20image2.png')"

  return (
    <main
      className="relative flex min-h-screen flex-col items-center px-4 py-xl bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />
      <div className="w-full max-w-md relative z-10">
      <div className="form-card bg-white/90 backdrop-blur-sm">
      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-900">
        Driver sign-up
      </span>
      <h2 className="mt-2 text-h2">Create Driver Account</h2>
      <p className="mt-2 text-small text-text-secondary">
        Drivers just need an email and password to create a profile. Hiring instead?{' '}
        <Link to="/signup?role=recruiter" className="font-semibold text-primary underline">
          Switch to recruiter sign-up
        </Link>
        .
      </p>
      <form onSubmit={handleSubmit} className="mt-lg flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="At least 6 characters"
        />
        <Input
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Confirm password"
        />
        {error && <p className="text-small text-error">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>
      <p className="mt-lg text-base text-text-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-lg font-semibold text-primary underline decoration-2 underline-offset-2"
        >
          Log in
        </Link>
      </p>
      </div>
      </div>
    </main>
  )
}
