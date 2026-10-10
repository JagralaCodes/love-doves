import { MotionConfig } from 'motion/react'

import { SaveTheDate } from './sections/SaveTheDate'
import { Venue } from './sections/Venue'
import { Rsvp } from './sections/Rsvp'
import { Closing } from './sections/Closing'
import { Countdown } from './sections/Countdown'


/**
 * Everything from Save the Date down, as its own chunk.
 *
 * The first screen a guest sees is the gate, then the hero; none of this
 * is needed to paint either. Splitting it off moves the whole of Motion
 * (only these sections use it) and the scratch card, envelope, schedule and
 * form out of the critical path. The chunk is requested as soon as
 * the app mounts — while the guest is still on the gate — so in practice
 * it is in place long before anyone scrolls to it.
 */
export default function BelowFold() {
  return (
    // Safety net: any Motion animation that forgets to check the preference
    // still drops its transforms for viewers who asked for reduced motion.
    <MotionConfig reducedMotion="user">
      <SaveTheDate />

      <Venue />

      <Rsvp />

      <Closing />

      {/* Last on purpose: the invitation closes on "see you soon". */}
      <Countdown />
    </MotionConfig>
  )
}
