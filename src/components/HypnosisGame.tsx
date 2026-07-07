import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { keyTone, cluck as cluckSound, woozy } from '../audio/sound'
import './HypnosisGame.css'

interface Props {
  intro: string
  commands: string[]
  after: string[]
  onNext: () => void
}

const HOLD_MS = 7000 // how long she has to hold out
const DRAIN = 3.0 // composure lost per tick
const TICK = 100

/**
 * A stupid little game: the mentalist tries to make you cluck like a chicken.
 * Mash RESIST to keep your composure up until the spiral gives up. You can't
 * really lose — if you crack, you cluck, laugh it off, and keep going.
 */
export default function HypnosisGame({ intro, commands, after, onNext }: Props) {
  const composure = useRef(64)
  const held = useRef(0)
  const phase = useRef<'play' | 'clucking' | 'won'>('play')
  const [clucks, setClucks] = useState(0)
  const [taunt, setTaunt] = useState(commands[0] ?? 'look into my eyes…')
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(() => {
      if (phase.current !== 'play') return
      held.current += TICK
      composure.current -= DRAIN

      // Rotate the taunt every ~1.6s.
      if (commands.length) {
        setTaunt(commands[Math.floor(held.current / 1600) % commands.length])
      }

      if (composure.current <= 0) {
        composure.current = 0
        phase.current = 'clucking'
        setClucks((c) => c + 1)
        woozy()
        cluckSound()
        window.setTimeout(() => {
          if (phase.current === 'clucking') {
            composure.current = 46
            phase.current = 'play'
            force()
          }
        }, 1300)
      } else if (held.current >= HOLD_MS) {
        phase.current = 'won'
      }
      force()
    }, TICK)
    return () => clearInterval(id)
  }, [commands])

  function resist() {
    if (phase.current !== 'play') return
    composure.current = Math.min(100, composure.current + 15)
    keyTone(3)
    force()
  }

  function giveIn() {
    if (phase.current !== 'play') return
    composure.current = 0
    phase.current = 'clucking'
    setClucks((c) => c + 1)
    cluckSound()
    window.setTimeout(() => {
      if (phase.current === 'clucking') {
        composure.current = 46
        phase.current = 'play'
        force()
      }
    }, 1300)
    force()
  }

  if (phase.current === 'won') {
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
  const clucking = phase.current === 'clucking'
  const secsLeft = Math.max(0, Math.ceil((HOLD_MS - held.current) / 1000))

  return (
    <div className="scene hyp fade-in">
      <div className="hyp__intro">{intro}</div>

      <div className={`hyp__spiral-wrap ${clucking ? 'hyp__spiral-wrap--crack' : ''}`}>
        <div className="hyp__spiral" style={{ animationDuration: `${Math.max(0.6, 4 - c / 30)}s` }} />
        <div className="hyp__eyes">{clucking ? '🐔' : '👁️'}</div>
      </div>

      <div className="hyp__taunt">{clucking ? 'BAWK. BAWK BA-GAWK!' : `“${taunt}”`}</div>

      <div className="hyp__meter" aria-label="composure">
        <div className="hyp__meter-label">
          <span>Composure</span>
          <span>hold on: {secsLeft}s</span>
        </div>
        <div className="hyp__meter-track">
          <div
            className="hyp__meter-fill"
            style={{ width: `${c}%`, background: barColor }}
          />
        </div>
      </div>

      <div className="hyp__buttons">
        <button className="btn btn--primary hyp__resist" onClick={resist} disabled={clucking}>
          🙅 Resist!
        </button>
        <button className="btn hyp__cluck" onClick={giveIn} disabled={clucking}>
          🐔 Give in
        </button>
      </div>
      <button className="btn hyp__skip" onClick={onNext}>
        Skip the show →
      </button>
    </div>
  )
}
