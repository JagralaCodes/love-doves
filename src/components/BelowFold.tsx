import { MotionConfig } from 'motion/react'
import { useLang } from '../hooks/useLang'

import { AudioToggle } from './ui/AudioToggle'

import { SaveTheDate } from './sections/SaveTheDate'
import { Venue } from './sections/Venue'
import { Rsvp } from './sections/Rsvp'
import { Closing } from './sections/Closing'
import { Countdown } from './sections/Countdown'

import { wedding } from '../config/wedding.config'

type Props = {
  /** True once the gate has opened. */
  opened: boolean
}


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
export default function BelowFold({ opened }: Props) {
  const lang = useLang()

  return (
    // Safety net: any Motion animation that forgets to check the preference
    // still drops its transforms for viewers who asked for reduced motion.
    <MotionConfig reducedMotion="user">
      <AudioToggle
        src={wedding.audio.src}
        label={lang === 'ur' ? wedding.urdu.audioLabel : wedding.audio.label}
        visible={opened}
      />

      <SaveTheDate />

      <Venue />

      <Rsvp />

      <Closing />

      {/* Last on purpose: the invitation closes on "see you soon". */}
      <Countdown />
    </MotionConfig>
  )
}
