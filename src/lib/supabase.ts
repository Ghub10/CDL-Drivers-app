/**
 * Supabase client — only initialised when VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are present in the environment.
 *
 * When the env vars are missing the app falls back to the localStorage demo
 * so local development works without any external dependencies.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && key)

/** Null when Supabase is not configured. Always check `isSupabaseConfigured` first. */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, key!)
  : null
