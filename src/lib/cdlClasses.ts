import type { CDLClass } from '../types'

export const CDL_CLASS_OPTIONS: CDLClass[] = ['A', 'B']

export function isCdlClass(v: string): v is CDLClass {
  return v === 'A' || v === 'B'
}

/** URL or legacy data: only A/B are valid. */
export function parseCdlQueryValues(values: string[]): CDLClass[] {
  return values.filter(isCdlClass)
}

/** Editor state from stored profile ( strips legacy `C` ). */
export function cdlClassesForEditor(classes: CDLClass[]): CDLClass[] {
  const u = classes.filter(isCdlClass)
  return u.length > 0 ? u : ['A']
}
