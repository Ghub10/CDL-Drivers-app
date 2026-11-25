import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function RecruiterDashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return null
  if (!user || user.role !== 'recruiter') return <Navigate to="/" replace />

  return (
    <div className="relative min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Full-screen background */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/welcomeback2.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,21,42,0.85) 0%, rgba(0,21,42,0.60) 50%, rgba(0,21,42,0.90) 100%)',
          }}
        />
      </div>

      {/* Central welcome section */}
      <section className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl w-full">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: '#ffb690', fontFamily: 'JetBrains Mono, monospace' }}
          >
            Recruiter Account
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white uppercase tracking-tight mb-4 leading-tight">
            WELCOME BACK
          </h1>
          <p className="text-lg text-white/70 mb-10 max-w-md mx-auto leading-relaxed">
            Find qualified CDL drivers, manage job postings, and connect with candidates in your area.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            <button
              onClick={() => navigate('/recruiter/search')}
              className="py-4 px-8 rounded-lg font-bold text-xl transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#fd761a', color: '#5c2400' }}
            >
              FIND DRIVERS
            </button>
            <button
              onClick={() => navigate('/recruiter/job-postings')}
              className="py-4 px-8 rounded-lg font-semibold text-xl text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              JOB POSTINGS
            </button>
            <button
              onClick={() => navigate('/recruiter/messages')}
              className="py-4 px-8 rounded-lg font-semibold text-xl text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              MESSAGES
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section
        className="relative z-10 border-t border-white/10"
        style={{ background: 'rgba(0,21,42,0.90)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">

          <div className="flex flex-col items-center justify-center py-8 px-6 text-center hover:bg-white/5 transition-colors">
            <span className="text-3xl font-bold mb-1" style={{ color: '#ffb690' }}>CDL A &amp; B</span>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: '#7a92b0', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Classes Covered
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-8 px-6 text-center hover:bg-white/5 transition-colors">
            <span className="text-3xl font-bold mb-1" style={{ color: '#ffb690' }}>FREE</span>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: '#7a92b0', fontFamily: 'JetBrains Mono, monospace' }}
            >
              To Post &amp; Recruit
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-8 px-6 text-center hover:bg-white/5 transition-colors">
            <div className="flex flex-wrap justify-center gap-1.5 mb-2">
              {['H', 'N', 'T', 'P', 'S', 'X'].map((e) => (
                <span
                  key={e}
                  className="text-white text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ background: '#9d4300', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {e}
                </span>
              ))}
            </div>
            <span className="text-3xl font-bold mb-1" style={{ color: '#ffb690' }}>6 ENDORSEMENTS</span>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: '#7a92b0', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Driver Qualifications
            </span>
          </div>

        </div>
      </section>

    </div>
  )
}
