/**
 * Subscription tier gating.
 *
 * Free  — 3 driver profile views / month, no messaging
 * Pro   — unlimited search, messaging, saved searches, job postings  ($39.99/mo)
 *
 * In the localStorage demo every recruiter starts on "free".
 * In production the tier is set via a Stripe webhook writing to
 * recruiter_profiles.subscription_tier in Supabase.
 */

import type { SubscriptionTier, RecruiterProfile } from '../types'

export interface TierFeatures {
  label:              string
  price:              string
  driverViewsPerMonth: number | 'unlimited'
  messaging:          boolean
  savedSearches:      boolean
  jobPostings:        boolean
  seats:              number | 'unlimited'
  highlight:          boolean
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    label:              'Free',
    price:              '$0 / month',
    driverViewsPerMonth: 3,
    messaging:          false,
    savedSearches:      false,
    jobPostings:        true,
    seats:              1,
    highlight:          false,
  },
  pro: {
    label:              'Standard',
    price:              '$19.99 / month',
    driverViewsPerMonth: 'unlimited',
    messaging:          true,
    savedSearches:      true,
    jobPostings:        true,
    seats:              1,
    highlight:          true,
  },
  team: {
    label:              'Team',
    price:              '$39.99 / month',
    driverViewsPerMonth: 'unlimited',
    messaging:          true,
    savedSearches:      true,
    jobPostings:        true,
    seats:              'unlimited',
    highlight:          false,
  },
}

export function getTier(profile: RecruiterProfile | null | undefined): SubscriptionTier {
  return profile?.subscription_tier ?? 'free'
}

/* All features are free for now (no plans/pricing). These return true regardless of tier. */
export function canMessage(_profile?: RecruiterProfile | null): boolean {
  return true
}

export function canPostJobs(_profile?: RecruiterProfile | null): boolean {
  return true
}

export function canUseSavedSearches(_profile?: RecruiterProfile | null): boolean {
  return true
}

export function driverViewLimit(profile: RecruiterProfile | null | undefined): number | 'unlimited' {
  return TIER_FEATURES[getTier(profile)].driverViewsPerMonth
}

/** localStorage key for tracking free-tier driver views this calendar month. */
const viewCountKey = (userId: string) => {
  const now = new Date()
  return `cdl_driver_views_${userId}_${now.getFullYear()}_${now.getMonth()}`
}

export function getDriverViewsThisMonth(userId: string): number {
  return parseInt(localStorage.getItem(viewCountKey(userId)) ?? '0', 10)
}

export function recordDriverView(userId: string): void {
  const current = getDriverViewsThisMonth(userId)
  localStorage.setItem(viewCountKey(userId), String(current + 1))
}

export function hasRemainingFreeViews(
  _userId: string,
  _profile?: RecruiterProfile | null
): boolean {
  return true
}
