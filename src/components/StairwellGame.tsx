import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { keyTone, woozy } from '../audio/sound'
import './StairwellGame.css'

interface Props {
  intro: string
  after: string[]
  onNext: () => void
}

const STEPS = 8
const TICK = 100

/**
 * Sneak the two of you down the stairwell. Tap "Down" while it's clear
 * (green); tap while a friend is near (red) and you get spotted and lose a
 * step. Reach the bottom to escape. Un-losable — being seen just sets you back.
 */
export default function StairwellGame({ intro, after, onNext }: Props) {
  const [step, setStep] = useState(0)
  const [clear, setClear] = useState(true)
  const [spotted, setSpotted] = useState(false)
  const tick = useRef(0)
  const done = useRef(false)
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(() => {
      if (done.current) return
      tick.current += 1
      // ~1.6s clear, ~1.2s a friend is near.
      setClear(tick.current % 28 < 16)
      force()
    }, TICK)
    return () => clearInterval(id)
  }, [])

  if (step >= STEPS) {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  function stepDown() {
    if (clear) {
      keyTone(4)
      const next = step + 1
      setStep(next)
      if (next >= STEPS) done.current = true
    } else {
      // Spotted: duck back up a step.
      woozy()
      setSpotted(true)
      setStep((s) => Math.max(0, s - 1))
      window.setTimeout(() => setSpotted(false), 600)
    }
  }

  return (
    <div className="scene stair fade-in">
      <div className="stair__intro">{intro}</div>

      <div className={`stair__shaft ${spotted ? 'stair__shaft--spotted' : ''}`}>
        {/* Friends peering in at the top */}
        <div className={`stair__friends ${clear ? '' : 'near'}`}>
          {clear ? '🚪 …quiet…' : '🔦 "check the stairs!"'}
        </div>
        {/* The staircase */}
        <div className="stair__steps">
          {Array.from({ length: STEPS }, (_, i) => {
            const idx = STEPS - 1 - i // idx: top step = STEPS-1, bottom = 0
            // The pair starts at the top and descends toward the exit.
            const pairAt = STEPS - 1 - step
            return (
              <div className="stair__step" key={idx} style={{ marginLeft: `${idx * 22}px` }}>
                {idx === pairAt && <span className="stair__pair">🧍‍♀️🧍</span>}
              </div>
            )
          })}
          <div className="stair__exit">exit →</div>
        </div>
      </div>

      <div className={`stair__light stair__light--${clear ? 'go' : 'stop'}`}>
        {clear ? 'CLEAR — go!' : 'FREEZE'}
      </div>
      <div className="stair__progress">step {step} / {STEPS}</div>

      <button className="btn btn--primary stair__down" onClick={stepDown}>
        ⬇ Step down
      </button>
      <button className="btn stair__skip" onClick={onNext}>
        Skip →
      </button>
    </div>
  )
}
