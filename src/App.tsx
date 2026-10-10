import { lazy, Suspense, useState } from 'react'
import { useScrollLock } from './hooks/useScrollLock'

import { SvgDefs } from './components/svg/SvgDefs'
import { Gate } from './components/sections/Gate'

// Everything behind the gate, as its own chunk — see AboveFold.
const AboveFold = lazy(() => import('./components/AboveFold'))

/**
 * The gate, and behind it the page.
 *
 * The first bundle holds only this and the gate: the doors paint and take
 * a tap as early as possible. The page behind them is requested at once
 * and lands while the viewer is still looking at the doors.
 */
export default function App() {
  // `opened` flips as the doors begin to swing, so the hero plays in behind
  // them; `gateGone` once the gate has faded and can leave the tree.
  const [opened, setOpened] = useState(false)
  const [gateGone, setGateGone] = useState(false)

  // The lock here covers the moments before the page chunk (and its
  // smooth scrolling) has arrived; AboveFold takes over with Lenis.
  useScrollLock(!gateGone)

  return (
    <>
      <SvgDefs />

      {!gateGone && <Gate onOpening={() => setOpened(true)} onOpened={() => setGateGone(true)} />}

      <Suspense fallback={null}>
        <AboveFold opened={opened} gateGone={gateGone} />
      </Suspense>
    </>
  )
}
