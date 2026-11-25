import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { resetPasswordForEmail } from '../lib/storage'

function LoginHomeBar() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex justify-end border-b border-white/20 bg-black/15 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] backdrop-blur-sm">
      <Link to="/" className="app-header-home-tab text-white">
        Home
      </Link>
    </div>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const result = resetPasswordForEmail(email, password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoginHomeBar />
      <div className="flex min-h-[100dvh] min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-zinc-900 px-4 pb-10 pt-20">
        <div className="w-full max-w-[420px] sm:p-10">
          <div className="form-card">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">Reset password</h1>
            <p className="mt-2 text-sm text-slate-500">Use the email for your account on this device</p>
          </div>

          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
            Demo: passwords are stored only in this browser. We don&apos;t send email — enter your account email and
            choose a new password. Anyone who knows the email could reset it here, so don&apos;t use real secrets.
          </p>

          {done ? (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm font-medium text-green-800" role="status">
                Password updated. You can sign in with your new password.
              </p>
              <Link
                to="/login"
                state={{ prefillEmail: email.trim() }}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-hover"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
              />
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
              {error && <p className="text-sm text-error">{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-primary w-full px-4 py-3 text-base">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-slate-600">
            <Link to="/login" className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 hover:text-primary-hover">
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>
    </>
  )
}
