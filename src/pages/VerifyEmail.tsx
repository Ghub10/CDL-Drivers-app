import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { getUsers } from '../lib/storage'
import { isSupabaseConfigured } from '../lib/supabase'

export function VerifyEmail() {
  const [params] = useSearchParams()
  const userId = params.get('userId')
  const navigate = useNavigate()
  const { verifyEmail } = useAuth()

  // ── Supabase path: user arrived here from a real Supabase email link ──────
  // Supabase appends access_token / token_hash to the redirect URL.
  // Just show a "you're verified, log in" confirmation.
  if (isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-xl">
        <div className="w-full max-w-md rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-green-900">Email verified!</h2>
          <p className="mt-3 text-sm text-green-800">
            Your account is active. You can now log in with your email and password.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white hover:bg-green-800"
          >
            Log in now
          </Link>
        </div>
      </main>
    )
  }

  // ── localStorage demo path: simulate verification ─────────────────────────

  const handleVerify = () => {
    if (!userId) return
    verifyEmail(userId)
    const u = getUsers().find((x) => x.id === userId)
    if (u?.role === 'driver') {
      navigate('/driver/profile', { replace: true })
    } else if (u?.role === 'recruiter') {
      navigate('/recruiter/search', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  if (!userId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-body text-text-secondary">Invalid verification link.</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-md min-h-screen flex-col justify-center px-6 py-xl">
      <h2 className="text-h2 text-center">Almost there</h2>
      <div className="mt-4 space-y-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm text-blue-950">
        <p>
          There will be no fees. People can post jobs for now. However, they cannot alter or edit job
          postings from other people.
        </p>
      </div>
      <Button className="mt-8 w-full" onClick={handleVerify}>
        I verified — continue
      </Button>
      <Button variant="secondary" className="mt-6 w-full" onClick={() => navigate('/login')}>
        Back to Login
      </Button>
    </main>
  )
}
