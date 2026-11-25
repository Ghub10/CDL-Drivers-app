/**
 * Auth context — dual-mode.
 *
 * • When VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set: delegates to
 *   Supabase Auth (server-side bcrypt, real email flows, multi-device).
 * • Otherwise: falls back to the localStorage demo so local development works
 *   without any external services.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { UserRole } from '../types'
import {
  getUsers,
  createUser,
  getUserByEmail,
  setUserVerified,
  saveUser,
  ensureDriverProfileStubForUser,
  getRecruiterProfileByUserId,
  type StoredUser,
} from '../lib/storage'
import { clearAllSavedSearchesForRecruiter } from '../lib/savedSearches'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface SignInOptions {
  /** When true, clears role-specific search data stored in this browser after a successful login. */
  clearClientSearch?: boolean
}

interface AuthContextValue {
  user: StoredUser | null
  role: UserRole | null
  loading: boolean
  signUp: (email: string, password: string, role: UserRole, extra?: RecruiterSignUpExtra) => Promise<{ sessionCreated: boolean } | void>
  signIn: (email: string, password: string, options?: SignInOptions) => Promise<void>
  signOut: () => void
  verifyEmail: (userId: string) => void
  refreshUser: () => void
  switchRole: (role: UserRole) => Promise<void>
}

interface RecruiterSignUpExtra {
  name: string
  companyName: string
  phone: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [loading, setLoading] = useState(true)

  // ── localStorage path ──────────────────────────────────────────────────────

  const refreshUser = useCallback(() => {
    if (isSupabaseConfigured) return // Supabase path manages state via onAuthStateChange
    const stored = localStorage.getItem('cdl_session')
    if (!stored) {
      setUser(null)
      return
    }
    try {
      const { userId } = JSON.parse(stored)
      const users = getUsers()
      const u = users.find((x) => x.id === userId)
      if (u?.role === 'driver') ensureDriverProfileStubForUser(u.id, u.email)
      setUser(u || null)
    } catch {
      setUser(null)
    }
  }, [])

  // The demo accounts (Demo Recruiter / Demo Driver) live in this browser, not
  // in Supabase. This finds the one that is signed in on this device, if any,
  // so a page reload doesn't sign a demo visitor out.
  const readLocalSessionUser = useCallback((): StoredUser | null => {
    try {
      const stored = localStorage.getItem('cdl_session')
      if (!stored) return null
      const { userId } = JSON.parse(stored)
      const u = getUsers().find((x) => x.id === userId) ?? null
      if (u?.role === 'driver') ensureDriverProfileStubForUser(u.id, u.email)
      return u
    } catch {
      return null
    }
  }, [])

  // ── Supabase path — session bootstrap ─────────────────────────────────────

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      refreshUser()
      setLoading(false)
      return
    }

    let loadingCleared = false
    const clearLoading = () => {
      if (!loadingCleared) {
        loadingCleared = true
        setLoading(false)
      }
    }

    // Safety net: if Supabase hangs for any reason, unblock the UI after 4 s
    const safetyTimer = setTimeout(clearLoading, 4000)

    Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('supabase-timeout')), 3500)),
    ])
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(supabaseUserToStoredUser(session.user))
        } else {
          setUser(readLocalSessionUser())
        }
      })
      .catch(() => {
        setUser(readLocalSessionUser())
      })
      .finally(() => {
        clearTimeout(safetyTimer)
        clearLoading()
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(supabaseUserToStoredUser(session.user))
      } else {
        setUser(readLocalSessionUser())
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshUser, readLocalSessionUser])

  /** Keep auth in sync when another tab changes session (localStorage path). */
  useEffect(() => {
    if (isSupabaseConfigured) return
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cdl_session' || e.key === 'cdl_users') {
        refreshUser()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refreshUser])

  /** Same-tab: re-read session on focus / visibility change (localStorage path). */
  useEffect(() => {
    if (isSupabaseConfigured) return
    const sync = () => refreshUser()
    window.addEventListener('focus', sync)
    const onVis = () => {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refreshUser])

  // ── signUp ─────────────────────────────────────────────────────────────────

  const signUp = useCallback(
    async (email: string, password: string, role: UserRole, extra?: RecruiterSignUpExtra) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: { role, ...(extra ?? {}) },
              emailRedirectTo: `${window.location.origin}/verify-email`,
            },
          }),
          10000,
          'Sign-up timed out — please check your connection and try again.',
        )
        if (error) throw new Error(error.message)
        if (!data.user) throw new Error('Sign-up failed — please try again.')
        // Role is stored in user metadata; profiles created via database trigger
        return { sessionCreated: Boolean(data.session) }
      }

      // localStorage demo
      const users = getUsers()
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered')
      }
      const id = crypto.randomUUID()
      const passwordHash = btoa(password)
      createUser({
        id,
        email,
        passwordHash,
        role,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      })
      if (role === 'driver') {
        ensureDriverProfileStubForUser(id, email)
      }
      if (role === 'recruiter' && extra) {
        const { saveRecruiterProfile } = await import('../lib/storage')
        saveRecruiterProfile({
          id: crypto.randomUUID(),
          user_id: id,
          name: extra.name,
          company_name: extra.companyName,
          phone: extra.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    },
    []
  )

  // ── signIn ─────────────────────────────────────────────────────────────────

  const signIn = useCallback(async (email: string, password: string, options?: SignInOptions) => {
    if (isSupabaseConfigured && supabase) {
      // Try Supabase first; a timeout or network failure falls through to localStorage
      let supabaseResult: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>> | null = null
      try {
        supabaseResult = await withTimeout(
          supabase.auth.signInWithPassword({ email, password }),
          10000,
          'timeout',
        )
      } catch {
        // Timed out or network error — fall through to localStorage demo accounts
      }

      if (supabaseResult) {
        // Supabase responded successfully
        if (!supabaseResult.error && supabaseResult.data.user) return

        // Only re-throw if it's a real server/config error (not wrong credentials)
        const isCredentialError =
          supabaseResult.error?.message?.toLowerCase().includes('invalid') ||
          supabaseResult.error?.status === 400
        if (!isCredentialError) {
          throw new Error(supabaseResult.error?.message ?? 'Sign-in failed — please try again.')
        }
        // Wrong credentials in Supabase → fall through to localStorage demo accounts
      }
    }

    // localStorage demo (also fallback when Supabase doesn't know the account)
    const u = getUserByEmail(email)
    if (!u) throw new Error('Invalid email or password')
    const passwordHash = btoa(password)
    if (u.passwordHash !== passwordHash) throw new Error('Invalid email or password')
    if (!u.emailVerified) {
      throw new Error('Please verify your email before signing in.')
    }
    localStorage.setItem('cdl_session', JSON.stringify({ userId: u.id }))
    if (u.role === 'driver') ensureDriverProfileStubForUser(u.id, u.email)
    setUser(u)
    if (options?.clearClientSearch) {
      if (u.role === 'recruiter') {
        clearAllSavedSearchesForRecruiter(u.id)
      }
    }
  }, [])

  // ── signOut ────────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
      setUser(null)
      return
    }
    localStorage.removeItem('cdl_session')
    setUser(null)
  }, [])

  // ── switchRole ─────────────────────────────────────────────────────────────

  /** Changes the signed-in account's role and ensures the matching profile exists. */
  const switchRole = useCallback(async (nextRole: UserRole) => {
    const current = user
    if (!current) throw new Error('You must be signed in to switch account type.')

    // Make sure the destination role has the profile its pages expect.
    if (nextRole === 'recruiter' && !getRecruiterProfileByUserId(current.id)) {
      const { saveRecruiterProfile } = await import('../lib/storage')
      const now = new Date().toISOString()
      const fallbackName = current.email.split('@')[0]?.replace(/[._+]/g, ' ').trim() || 'Recruiter'
      saveRecruiterProfile({
        id: crypto.randomUUID(),
        user_id: current.id,
        name: fallbackName,
        company_name: '',
        phone: '',
        created_at: now,
        updated_at: now,
      })
    }
    if (nextRole === 'driver') {
      ensureDriverProfileStubForUser(current.id, current.email)
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.updateUser({ data: { role: nextRole } })
      if (error) throw new Error(error.message)
      if (data.user) setUser(supabaseUserToStoredUser(data.user))
      return
    }

    // localStorage demo path
    const updated: StoredUser = { ...current, role: nextRole }
    saveUser(updated)
    localStorage.setItem('cdl_session', JSON.stringify({ userId: updated.id }))
    setUser(updated)
  }, [user])

  // ── verifyEmail (localStorage path only) ──────────────────────────────────

  const verifyEmail = useCallback((userId: string) => {
    setUserVerified(userId, true)
    const users = getUsers()
    const u = users.find((x) => x.id === userId)
    if (u) {
      localStorage.setItem('cdl_session', JSON.stringify({ userId }))
      if (u.role === 'driver') ensureDriverProfileStubForUser(u.id, u.email)
      setUser({ ...u, emailVerified: true })
    }
  }, [])

  const role = user?.role ?? null

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        verifyEmail,
        refreshUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms),
    ),
  ])
}

// ── Supabase helper ──────────────────────────────────────────────────────────

import type { User as SupabaseUser } from '@supabase/supabase-js'

/**
 * Converts a Supabase Auth user into the `StoredUser` shape the rest of the app
 * already understands. Role is read directly from user_metadata — no extra
 * network call needed.
 */
function supabaseUserToStoredUser(user: SupabaseUser): StoredUser {
  const meta = user.user_metadata as { role?: UserRole } | undefined
  const role: UserRole = meta?.role ?? 'driver'
  return {
    id: user.id,
    email: user.email ?? '',
    passwordHash: '',   // never used when Supabase handles auth
    role,
    emailVerified: true,
    createdAt: user.created_at ?? new Date().toISOString(),
  }
}
