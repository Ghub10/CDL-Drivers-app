import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AppLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = () => {
    signOut()
    navigate('/', { replace: true })
  }

  const subtitle =
    user?.role === 'driver'
      ? 'Manage your profile and messages'
      : user?.role === 'recruiter'
        ? 'Utah CDL Recruitment'
        : 'UTAH CDL JOB PLATFORM'

  return (
    <div className="app">
      <header className="app-header">
        {/* Brand row */}
        <div className="flex items-center justify-between py-3">
          {/* Nav actions */}
          <nav className="app-header-actions" role="navigation" aria-label="Account">
            <Link to="/" className="app-header-home-tab transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">Home</Link>
            {user?.role === 'driver' && (
              <>
                <Link to="/driver/opportunities" className="app-header-cta-tab transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">Job postings</Link>
                <Link to="/driver/messages"      className="app-header-cta-tab transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">Messages</Link>
              </>
            )}
            {user?.role === 'recruiter' && (
              <>
                <Link to="/recruiter/job-postings" className="app-header-cta-tab transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">Job Postings</Link>
                <Link to="/recruiter/messages"     className="app-header-cta-tab transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">Messages</Link>
              </>
            )}
            {!user && (
              <Link to="/login" state={{ from: location }} className="app-header-cta-tab transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl">
                Log in
              </Link>
            )}
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="app-header-cta-tab app-header-cta-tab--button transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl"
              >
                Log out
              </button>
            )}
          </nav>
        </div>

        {/* Subtitle strip — pushed below the absolutely-positioned nav so they don't overlap */}
        <p className="subtitle mt-2 pb-1 sm:mt-16">{subtitle}</p>
        <p className="subtitle pb-2 text-base font-400 normal-case tracking-normal text-white">Get hired. Find talent. Safe Driving</p>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
