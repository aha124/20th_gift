import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import Burst from './Burst'
import {
  keyTone,
  cluck as cluckSound,
  woozy,
  eyeCue,
  deniedBuzz,
  chime,
} from '../audio/sound'
import './HypnosisGame.css'

interface Props {
  intro: string
  commands: string[]
  roundLines: string[]
  after: string[]
  onNext: () => void
}

type EyePhase = 'closed' | 'squint' | 'open'

// Three escalating rounds: faster cycles, shorter open windows, more fake-outs.
const ROUNDS = [
  { closedMs: 1300, squintMs: 600, openMs: 1500, fakeout: 0.25, taps: 4 },
  { closedMs: 1000, squintMs: 450, openMs: 1100, fakeout: 0.35, taps: 5 },
  { closedMs: 800, squintMs: 350, openMs: 900, fakeout: 0.45, taps: 6 },
]
const TICK = 100
const DRAIN = 1.0

/**
 * The mentalist's eye opens and closes — with fake-outs. A squint always comes
 * first; sometimes it sinks back shut. Resist only counts while the eye is
 * truly OPEN. Wrong-time taps cost composure. Three rounds, each faster.
 * Un-losable: an empty meter means one comedic cluck, then you carry on.
 */
export default function HypnosisGame({ intro, commands, roundLines, after, onNext }: Props) {
  const composure = useRef(70)
  const round = useRef(0)
  const hits = useRef(0)
  const eye = useRef<EyePhase>('closed')
  const phaseLeft = useRef(ROUNDS[0].closedMs)
  const mode = useRef<'play' | 'clucking' | 'banner' | 'won'>('play')
  const bannerLeft = useRef(0)
  const [clucks, setClucks] = useState(0)
  const [taunt, setTaunt] = useState(commands[0] ?? 'look into my eyes…')
  const [burstKey, setBurstKey] = useState(0)
  const elapsed = useRef(0)
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(() => {
      if (mode.current === 'won') return
      elapsed.current += TICK

      if (mode.current === 'banner') {
        bannerLeft.current -= TICK
        if (bannerLeft.current <= 0) {
          mode.current = 'play'
          eye.current = 'closed'
          phaseLeft.current = ROUNDS[round.current].closedMs
        }
        force()
        return
      }
      if (mode.current === 'clucking') {
        force()
        return
      }

      const R = ROUNDS[round.current]

      // Rotate the taunt on a slow clock.
      if (commands.length && eye.current !== 'open') {
        setTaunt(commands[Math.floor(elapsed.current / 1900) % commands.length])
      }

      // Advance the eye phase machine.
      phaseLeft.current -= TICK
      if (phaseLeft.current <= 0) {
        if (eye.current === 'closed') {
          eye.current = 'squint'
          phaseLeft.current = R.squintMs
        } else if (eye.current === 'squint') {
          if (Math.random() < R.fakeout) {
            eye.current = 'closed' // fake-out: sinks back shut
            phaseLeft.current = R.closedMs
          } else {
            eye.current = 'open'
            phaseLeft.current = R.openMs
            eyeCue()
          }
        } else {
          eye.current = 'closed'
          phaseLeft.current = R.closedMs
        }
      }

      // The spiral is always pulling at you a little.
      composure.current -= DRAIN
      if (composure.current <= 0) crack()
      force()
    }, TICK)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function crack() {
    composure.current = 0
    mode.current = 'clucking'
    setClucks((c) => c + 1)
    woozy()
    cluckSound()
    window.setTimeout(() => {
      if (mode.current === 'clucking') {
        composure.current = 50
        mode.current = 'play'
        force()
      }
    }, 1300)
  }

  function resist() {
    if (mode.current !== 'play') return
    if (eye.current === 'open') {
      composure.current = Math.min(100, composure.current + 12)
      hits.current += 1
      keyTone(3)
      if (hits.current >= ROUNDS[round.current].taps) {
        chime()
        setBurstKey((k) => k + 1)
        if (round.current >= ROUNDS.length - 1) {
          mode.current = 'won'
        } else {
          round.current += 1
          hits.current = 0
          mode.current = 'banner'
          bannerLeft.current = 1500
        }
      }
    } else {
      // Wrong moment: the spiral gets you a little.
      composure.current = Math.max(0, composure.current - 8)
      deniedBuzz()
      if (composure.current <= 0) crack()
    }
    force()
  }

  function giveIn() {
    if (mode.current !== 'play') return
    crack()
  }

  if (mode.current === 'won') {
    const lines = [...after]
    if (clucks === 0) {
      lines.unshift('You did not cluck. Not even once. The mentalist looked genuinely disappointed.')
    } else if (clucks === 1) {
      lines.unshift('One little cluck slipped out. You recovered with your dignity mostly intact.')
    } else {
      lines.unshift(`You clucked ${clucks} times. A row of freshmen have never respected anyone more.`)
    }
    return <NarrationCard lines={lines} onNext={onNext} />
  }

  const c = composure.current
  const barColor = c > 55 ? '#4caf50' : c > 25 ? '#e0a800' : '#d9534f'
  const clucking = mode.current === 'clucking'
  const banner = mode.current === 'banner'
  const R = ROUNDS[round.current]
  const open = eye.current === 'open'

  return (
    <div className="scene hyp fade-in">
      <div className="hyp__intro">{intro}</div>

      <div className={`hyp__spiral-wrap ${clucking ? 'hyp__spiral-wrap--crack' : ''}`}>
        <div className="hyp__spiral" style={{ animationDuration: `${3.4 - round.current * 0.9}s` }} />
        <div className={`hyp__eye hyp__eye--${clucking ? 'closed' : eye.current}`}>
          <div className="hyp__pupil" />
          <div className="hyp__lid" />
        </div>
        {clucking && <div className="hyp__chicken">🐔</div>}
        {burstKey > 0 && <Burst key={burstKey} />}
      </div>

      <div className="hyp__taunt">
        {clucking
          ? 'BAWK. BAWK BA-GAWK!'
          : banner
            ? roundLines[Math.min(round.current - 1, roundLines.length - 1)] ?? '…'
            : open
              ? 'his eyes are open — RESIST!'
              : `“${taunt}”`}
      </div>

      <div className="hyp__meter" aria-label="composure">
        <div className="hyp__meter-label">
          <span>Composure</span>
          <span>
            round {round.current + 1}/{ROUNDS.length} · {hits.current}/{R.taps}
          </span>
        </div>
        <div className="hyp__meter-track">
          <div className="hyp__meter-fill" style={{ width: `${c}%`, background: barColor }} />
        </div>
      </div>

      <div className="hyp__buttons">
        <button className="btn btn--primary hyp__resist" onClick={resist} disabled={clucking || banner}>
          🙅 Resist!
        </button>
        <button className="btn hyp__cluck" onClick={giveIn} disabled={clucking || banner}>
          🐔 Give in
        </button>
      </div>
      <button className="btn hyp__skip" onClick={onNext}>
        Skip the show →
      </button>
    </div>
  )
}
