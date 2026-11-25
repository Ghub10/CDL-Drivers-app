import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AppLayout } from './components/layout/AppLayout'
import { Landing } from './pages/Landing'
import { SignUp } from './pages/SignUp'
import { Login } from './pages/Login'
import { ForgotPassword } from './pages/ForgotPassword'
import { VerifyEmail } from './pages/VerifyEmail'
import { DriverProfile } from './pages/DriverProfile'
import { DriverHiringCompanies } from './pages/DriverHiringCompanies'
import { DriverMessages } from './pages/DriverMessages'
import { DriverMessageThread } from './pages/DriverMessageThread'
import { RecruiterSearch } from './pages/RecruiterSearch'
import { RecruiterDriverList } from './pages/RecruiterDriverList'
import { RecruiterDriverDetail } from './pages/RecruiterDriverDetail'
import { RecruiterMessages } from './pages/RecruiterMessages'
import { RecruiterJobPostings } from './pages/RecruiterJobPostings'
import { DriverDashboard } from './pages/DriverDashboard'
import { RecruiterDashboard } from './pages/RecruiterDashboard'
import { CityLanding } from './pages/CityLanding'
/** Redirects logged-in users to their dashboard; guests see the Landing page. */
function LandingRoute() {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center px-4" role="status" aria-live="polite" aria-busy="true">
        <span className="text-slate-700">Loading…</span>
      </div>
    )
  if (user?.role === 'driver') return <Navigate to="/driver/dashboard" replace />
  if (user?.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />
  return <Landing />
}

function RequireAuth({ children, role }: { children: React.ReactNode; role?: 'driver' | 'recruiter' }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading)
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="text-slate-700">Loading…</span>
      </div>
    )
  /* Send guests home so they see the familiar landing (not only /login). `from` preserves post-login redirect. */
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />
  }
  if (role && user.role !== role) {
    /* Drivers must never access recruiter routes (e.g. driver list); recruiters never driver-only routes. */
    if (role === 'recruiter' && user.role !== 'recruiter') {
      return <Navigate to="/" replace />
    }
    if (role === 'driver' && user.role !== 'driver') {
      return <Navigate to="/recruiter/search" replace />
    }
    if (user.role === 'driver') {
      return <Navigate to="/driver/profile" replace />
    }
    if (user.role === 'recruiter') {
      return <Navigate to="/recruiter/search" replace />
    }
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

export default function App() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      {!online && (
        <div
          className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950"
          role="status"
        >
          You appear offline. This app runs in your browser — you can still use the demo; connection isn&apos;t required.
        </div>
      )}
      <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<AppLayout />}>
        <Route path="signup" element={<SignUp />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route
          path="driver/dashboard"
          element={
            <RequireAuth role="driver">
              <DriverDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="driver/profile"
          element={
            <RequireAuth role="driver">
              <DriverProfile />
            </RequireAuth>
          }
        />
        <Route
          path="driver/opportunities"
          element={
            <RequireAuth role="driver">
              <DriverHiringCompanies />
            </RequireAuth>
          }
        />
        <Route
          path="driver/messages"
          element={
            <RequireAuth role="driver">
              <DriverMessages />
            </RequireAuth>
          }
        />
        <Route
          path="driver/messages/:recruiterId"
          element={
            <RequireAuth role="driver">
              <DriverMessageThread />
            </RequireAuth>
          }
        />
        {/* Recruiter-only: driver accounts cannot access these routes (RequireAuth role="recruiter"). */}
        <Route
          path="recruiter/dashboard"
          element={
            <RequireAuth role="recruiter">
              <RecruiterDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="recruiter/search"
          element={
            <RequireAuth role="recruiter">
              <RecruiterSearch />
            </RequireAuth>
          }
        />
        <Route
          path="recruiter/drivers/:driverId"
          element={
            <RequireAuth role="recruiter">
              <RecruiterDriverDetail />
            </RequireAuth>
          }
        />
        <Route
          path="recruiter/drivers"
          element={
            <RequireAuth role="recruiter">
              <RecruiterDriverList />
            </RequireAuth>
          }
        />
        <Route
          path="recruiter/messages"
          element={
            <RequireAuth role="recruiter">
              <RecruiterMessages />
            </RequireAuth>
          }
        />
        <Route
          path="recruiter/job-postings"
          element={
            <RequireAuth role="recruiter">
              <RecruiterJobPostings />
            </RequireAuth>
          }
        />
        {/* Public pages */}
        <Route path="drivers/:slug" element={<CityLanding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  )
}
