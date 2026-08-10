import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import Burst from './Burst'
import { keyTone, woozy, stumble, chime } from '../audio/sound'
import './StairwellGame.css'

interface Props {
  intro: string
  after: string[]
  onNext: () => void
}

type Mover = 'her' | 'him'

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
 * Sneak the two of you down the switchback stairwell together: her step, then
 * his, taking turns. Same feet twice = a stumble (no progress). Moving while
 * the flashlight swings near = spotted, back up a step. Un-losable.
 */
export default function StairwellGame({ intro, after, onNext }: Props) {
  const [step, setStep] = useState(0)
  const [clear, setClear] = useState(true)
  const [spotted, setSpotted] = useState(false)
  const [oops, setOops] = useState(false)
  const [lastMover, setLastMover] = useState<Mover | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const tickRef = useRef(0)
  const done = useRef(false)
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(() => {
      if (done.current) return
      tickRef.current += 1
      setClear(tickRef.current % 28 < 16) // ~1.6s clear, ~1.2s a friend near
      force()
    }, TICK)
    return () => clearInterval(id)
  }, [])

  if (step >= STEPS) {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  function stepDown(who: Mover) {
    if (!clear) {
      // Spotted: duck back up a step and regroup.
      woozy()
      setSpotted(true)
      setLastMover(null)
      setStep((s) => Math.max(0, s - 1))
      window.setTimeout(() => setSpotted(false), 600)
      return
    }
    if (lastMover === who) {
      // Same feet twice: you trip over each other. No progress, no loss.
      stumble()
      setOops(true)
      window.setTimeout(() => setOops(false), 700)
      return
    }
    keyTone(4)
    setLastMover(who)
    const next = step + 1
    setStep(next)
    if (next >= STEPS) {
      done.current = true
      chime()
      setBurstKey((k) => k + 1)
    }
  }

  // Landing platforms sit at each turn, on the side where the flight ends.
  const landings = Array.from({ length: FLIGHTS - 1 }, (_, f) => ({
    x: f % 2 === 0 ? RIGHT_X : LEFT_X,
    row: FLIGHT * (f + 1) + f, // the empty row between flights
  }))
  const pairAt = STEPS - 1 - step

  return (
    <div className="scene stair fade-in">
      <div className="stair__intro">{intro}</div>

      <div className={`stair__shaft ${spotted ? 'stair__shaft--spotted' : ''} ${oops ? 'stair__shaft--oops' : ''}`}>
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
            {s === pairAt && (
              <span className="stair__pair">
                <span className={lastMover === 'her' ? 'stair__lead' : ''}>🧍‍♀️</span>
                <span className={lastMover === 'him' ? 'stair__lead' : ''}>🧍</span>
              </span>
            )}
          </div>
        ))}

        <div
          className="stair__exit"
          style={{ left: `${stepX(STEPS - 1) + 2}%`, top: `${rowY(stepRow(STEPS - 1)) + 8}%` }}
        >
          exit →
        </div>
        {oops && <div className="stair__oops">you trip over each other</div>}
        {burstKey > 0 && <Burst key={burstKey} />}
      </div>

      <div className={`stair__light stair__light--${clear ? 'go' : 'stop'}`}>
        {clear ? 'CLEAR — take turns!' : 'FREEZE'}
      </div>
      <div className="stair__progress">
        step {step} / {STEPS}
        {lastMover && <> · {lastMover === 'her' ? 'his turn' : 'her turn'}</>}
      </div>

      <div className="stair__duo">
        <button className="btn btn--primary stair__down" onClick={() => stepDown('her')}>
          🧍‍♀️ Her step
        </button>
        <button className="btn btn--primary stair__down" onClick={() => stepDown('him')}>
          🧍 His step
        </button>
      </div>
      <button className="btn stair__skip" onClick={onNext}>
        Skip →
      </button>
    </div>
  )
}
