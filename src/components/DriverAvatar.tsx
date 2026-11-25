import type { DriverProfile } from '../types'
import { getDriverPhotoUrl } from '../lib/driverPhoto'

const sizeClass = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
} as const

type DriverAvatarProps = {
  profile: Pick<DriverProfile, 'id' | 'name' | 'photo_url' | 'portrait_gender'> & { email?: string }
  size?: keyof typeof sizeClass
  className?: string
}

export function DriverAvatar({ profile, size = 'md', className = '' }: DriverAvatarProps) {
  return (
    <img
      src={getDriverPhotoUrl(profile)}
      alt=""
      className={`shrink-0 rounded-full border border-slate-200/80 bg-slate-100 object-cover ${sizeClass[size]} ${className}`}
    />
  )
}
