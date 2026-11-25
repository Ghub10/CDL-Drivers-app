/**
 * Resume upload abstraction.
 *
 * When Supabase is configured the file is uploaded to the `resumes` Storage
 * bucket and the permanent public URL is returned. Each upload writes to
 * `{userId}/resume.{ext}`, so re-uploading silently replaces the previous file.
 *
 * When running in demo / localStorage mode the file is converted to a base64
 * data URL and returned directly — the existing behaviour is preserved so the
 * demo works without any external dependencies.
 *
 * The `resumes` bucket is PRIVATE. The stored resume_url is only a pointer to
 * the file; to open it, call getResumeLink(), which asks Supabase for a
 * short-lived signed link (allowed only for the owner and for recruiters).
 */

import { supabase, isSupabaseConfigured } from './supabase'

const BUCKET = 'resumes'

/** Max file size accepted in demo (base64) mode: 4 MB encoded string. */
const DEMO_MAX_ENCODED = 4 * 1024 * 1024

export class ResumeUploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResumeUploadError'
  }
}

/**
 * Upload a resume file and return a URL string suitable for storing in
 * `driver_profiles.resume_url`.
 *
 * @throws {ResumeUploadError} when the upload fails or the file is too large
 *   for demo storage.
 */
export async function uploadResume(file: File, userId: string): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    return uploadToSupabase(file, userId)
  }
  return uploadAsBase64(file)
}

async function uploadToSupabase(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
  const path = `${userId}/resume.${ext}`

  const { error } = await supabase!.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) {
    throw new ResumeUploadError(`Upload failed: ${error.message}`)
  }

  const { data } = supabase!.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function uploadAsBase64(file: File): Promise<string> {
  const base64 = await fileToBase64(file)
  const dataUrl = `data:${file.type};base64,${base64}`
  if (dataUrl.length > DEMO_MAX_ENCODED) {
    throw new ResumeUploadError(
      'Resume is too large for browser storage. Try a smaller file or skip the resume for this demo.'
    )
  }
  return dataUrl
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Returns true if the given URL is a Supabase Storage URL (not a data URL). */
export function isRemoteResumeUrl(url: string | null | undefined): boolean {
  return Boolean(url && !url.startsWith('data:'))
}

const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`

/**
 * Turns a stored resume_url into a link that can be opened right now.
 * - demo data URLs are returned as-is;
 * - Supabase files get a signed link that expires after 5 minutes;
 * - returns null if the link can't be made (no permission, file missing).
 */
export async function getResumeLink(url: string | null | undefined): Promise<string | null> {
  if (!url) return null
  if (url.startsWith('data:')) return url
  const at = url.indexOf(PUBLIC_MARKER)
  if (at === -1 || !supabase) return url
  const path = decodeURIComponent(url.slice(at + PUBLIC_MARKER.length).split('?')[0])
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}
