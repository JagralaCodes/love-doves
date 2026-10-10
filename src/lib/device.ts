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

let low: boolean | null = null

/**
 * The one shared "low-power" flag: a phone-width screen, or four cores or
 * fewer. Computed once. Everything decorative scales itself by it.
 */
export function lowPower(): boolean {
  if (low !== null) return low
  if (typeof window === 'undefined') return (low = false)
  const cores = navigator.hardwareConcurrency ?? 4
  return (low = window.innerWidth < 480 || cores <= 4)
}

/** Share of the decorative DOM particles (specks, stars, bokeh) to render. */
export function decorScale(): number {
  return lowPower() ? 0.4 : 1
}

/** The full-screen sparkle canvas's share — half in low-power mode, never zero. */
export function sparkleScale(): number {
  return lowPower() ? 0.5 : 1
}

/** Device pixel ratio cap for every canvas. */
export function maxDpr(): number {
  return lowPower() ? 1.5 : 2
}
