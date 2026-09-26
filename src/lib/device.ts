/**
 * Cheap capability probe used to scale the sparkle effects down
 * (or off) on weak hardware. Computed once, lazily, then cached.
 */

type Nav = Navigator & { deviceMemory?: number }

let cached: 'low' | 'mid' | 'high' | null = null

export function deviceTier(): 'low' | 'mid' | 'high' {
  if (cached) return cached
  if (typeof window === 'undefined') return (cached = 'mid')

  const nav = navigator as Nav
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 480

  // Old phones: few cores AND little memory is the reliable signal.
  if (cores <= 4 && memory <= 2) cached = 'low'
  else if (cores <= 4 || memory <= 4 || (coarse && narrow)) cached = 'mid'
  else cached = 'high'

  return cached
}

/** The pointer trail is the most expensive effect, so it needs headroom. */
export function canRunPointerTrail(): boolean {
  return deviceTier() !== 'low'
}

/** Scales particle counts so a mid phone does roughly half the work. */
export function particleScale(): number {
  const tier = deviceTier()
  return tier === 'low' ? 0 : tier === 'mid' ? 0.5 : 1
}
