import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { keyTone, woozy } from '../audio/sound'
import './StairwellGame.css'

interface Props {
  intro: string
  after: string[]
  onNext: () => void
}

const STEPS = 9
const FLIGHT = 3 // steps per flight before a landing + change of direction
const TICK = 100

// Switchback geometry, all in % of the shaft so it scales.
const LEFT_X = 16
const DX = 22
const RIGHT_X = LEFT_X + (FLIGHT - 1) * DX
const FLIGHTS = Math.ceil(STEPS / FLIGHT)

const stepX = (s: number) => {
  const f = Math.floor(s / FLIGHT)
  const p = s % FLIGHT
  return f % 2 === 0 ? LEFT_X + p * DX : RIGHT_X - p * DX
}
const stepRow = (s: number) => s + Math.floor(s / FLIGHT) // +1 row per landing above
const rowY = (row: number) => 14 + row * 7.4

/**
 * Sneak the two of you down a switchback stairwell — flights that reverse
 * direction at each landing. Tap "Down" while it's clear (green); tap while a
 * friend is near (red) and you get spotted and lose a step. Un-losable.
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
      setClear(tick.current % 28 < 16) // ~1.6s clear, ~1.2s a friend near
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
      woozy()
      setSpotted(true)
      setStep((s) => Math.max(0, s - 1))
      window.setTimeout(() => setSpotted(false), 600)
    }
  }

  // Landing platforms sit at each turn, on the side where the flight ends.
  const landings = Array.from({ length: FLIGHTS - 1 }, (_, f) => ({
    x: f % 2 === 0 ? RIGHT_X : LEFT_X,
    row: FLIGHT * (f + 1) + f, // the empty row between flights
  }))

  return (
    <div className="scene stair fade-in">
      <div className="stair__intro">{intro}</div>

      <div className={`stair__shaft ${spotted ? 'stair__shaft--spotted' : ''}`}>
        <div className={`stair__friends ${clear ? '' : 'near'}`}>
          {clear ? '🚪 …quiet…' : '🔦 "check the stairs!"'}
        </div>

        {landings.map((l, i) => (
          <div
            key={`land${i}`}
            className="stair__landing"
            style={{ left: `${l.x - 4}%`, top: `${rowY(l.row)}%` }}
          />
        ))}

        {Array.from({ length: STEPS }, (_, s) => (
          <div
            key={s}
            className="stair__step"
            style={{ left: `${stepX(s)}%`, top: `${rowY(stepRow(s))}%` }}
          >
            {s === step && <span className="stair__pair">🧍‍♀️🧍</span>}
          </div>
        ))}

        <div
          className="stair__exit"
          style={{ left: `${stepX(STEPS - 1) + 2}%`, top: `${rowY(stepRow(STEPS - 1)) + 8}%` }}
        >
          exit →
        </div>
      </div>

      <div className={`stair__light stair__light--${clear ? 'go' : 'stop'}`}>
        {clear ? 'CLEAR — go!' : 'FREEZE'}
      </div>
      <div className="stair__progress">
        step {step} / {STEPS}
      </div>

      <button className="btn btn--primary stair__down" onClick={stepDown}>
        ⬇ Step down
      </button>
      <button className="btn stair__skip" onClick={onNext}>
        Skip →
      </button>
    </div>
  )
}
