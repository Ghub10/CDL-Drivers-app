import type { DriverProfile } from '../types'
import { computeProfileCompleteness } from '../lib/profileCompleteness'

interface Props {
  profile: DriverProfile
  className?: string
}

export function ProfileCompletenessBar({ profile, className = '' }: Props) {
  const { percent, missing } = computeProfileCompleteness(profile)

  const color =
    percent >= 80 ? 'bg-green-500' :
    percent >= 50 ? 'bg-amber-400' :
                    'bg-red-400'

  const labelColor =
    percent >= 80 ? 'text-green-800' :
    percent >= 50 ? 'text-amber-800' :
                    'text-red-700'

  return (
    <div className={`rounded-card border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Profile completeness</p>
        <span className={`text-sm font-bold ${labelColor}`}>{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Profile ${percent}% complete`}
        />
      </div>

      {/* Missing fields */}
      {missing.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Still needed to reach 100%
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {missing.map((f) => (
              <li
                key={f.label}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
              >
                <span className="text-slate-400">+{f.points}pts</span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {percent === 100 && (
        <p className="mt-2 text-xs font-medium text-green-700">
          Your profile is complete — you'll rank higher in recruiter searches.
        </p>
      )}
    </div>
  )
}
