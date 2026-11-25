import type { DriverProfile } from '../types'

function hashProfileId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i)
  }
  return Math.abs(h)
}

/** Folder + index for randomuser.me portraits (deterministic per profile id). */
function portraitParams(
  id: string,
  portraitGender: DriverProfile['portrait_gender']
): { folder: 'men' | 'women'; index: number } {
  const u = hashProfileId(id)
  const index = u % 100
  if (portraitGender === 'female') return { folder: 'women', index }
  if (portraitGender === 'male') return { folder: 'men', index }
  return { folder: u % 2 === 0 ? 'men' : 'women', index }
}

/**
 * Driver photo URL: the profile's own `photo_url` when set, otherwise a deterministic
 * randomuser.me portrait.
 */
export function getDriverPhotoUrl(
  profile: Pick<DriverProfile, 'id' | 'photo_url' | 'portrait_gender'> & { email?: string }
): string {
  const custom = profile.photo_url?.trim()
  if (custom) return custom
  const { folder, index } = portraitParams(profile.id, profile.portrait_gender)
  return `https://randomuser.me/api/portraits/med/${folder}/${index}.jpg`
}
