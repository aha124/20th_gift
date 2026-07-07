import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { woozy } from '../audio/sound'
import './StayStillGame.css'

interface Props {
  intro: string
  after: string[]
  onNext: () => void
}

const TICK = 100
const GAIN = 1.6 // stillness gained per tick
const CATCH_PENALTY = 16

/**
 * Pappy shuffles up in the dark. Hold the "Stay still" pad down whenever his
 * eyes are open; let go while he's looking and he notices. Fill the bar to
 * outlast him. You can't really lose — getting caught just sets you back.
 */
export default function StayStillGame({ intro, after, onNext }: Props) {
  const holding = useRef(false)
  const still = useRef(0)
  const tick = useRef(0)
  const penalized = useRef(false)
  const phase = useRef<'play' | 'won'>('play')
  const [caught, setCaught] = useState(0)
  const [flash, setFlash] = useState(false)
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(() => {
      if (phase.current !== 'play') return
      tick.current += 1
      // 1.6s watching, 1.4s resting.
      const watching = tick.current % 30 < 16
      if (tick.current % 30 === 0) penalized.current = false

      if (watching && !holding.current && !penalized.current) {
        penalized.current = true
        still.current = Math.max(0, still.current - CATCH_PENALTY)
        setCaught((c) => c + 1)
        setFlash(true)
        woozy()
        window.setTimeout(() => setFlash(false), 500)
      } else {
        still.current = Math.min(100, still.current + GAIN)
      }

      if (still.current >= 100) phase.current = 'won'
      force()
    }, TICK)
    return () => clearInterval(id)
  }, [])

  if (phase.current === 'won') {
    const lines = [...after]
    if (caught > 0) {
      lines.unshift(
        caught === 1
          ? 'He caught you flinch once, squinted, and decided he had imagined it.'
          : `He caught you moving ${caught} times and clearly thought the house was haunted.`,
      )
    }
    return <NarrationCard lines={lines} onNext={onNext} />
  }

  const watching = tick.current % 30 < 16
  const grab = () => {
    holding.current = true
    force()
  }
  const release = () => {
    holding.current = false
    force()
  }

  return (
    <div className={`scene staystill fade-in ${flash ? 'staystill--flash' : ''}`}>
      <div className="staystill__intro">{intro}</div>

      <div className="staystill__room">
        <div className={`staystill__pappy ${watching ? 'watching' : ''}`}>👴</div>
        <div className={`staystill__status ${watching ? 'watching' : 'resting'}`}>
          {watching ? '👁 EYES OPEN — hold still!' : '😴 he looked away — breathe'}
        </div>
        <div className="staystill__bed">🛏️ {holding.current ? '…（frozen）' : '（you shift）'}</div>
      </div>

      <div className="staystill__meter">
        <div className="staystill__meter-label">
          <span>Stillness</span>
          <span>{Math.round(still.current)}%</span>
        </div>
        <div className="staystill__meter-track">
          <div
            className="staystill__meter-fill"
            style={{ width: `${still.current}%`, background: watching ? '#d9534f' : '#4caf50' }}
          />
        </div>
      </div>

      <button
        className={`staystill__pad ${holding.current ? 'held' : ''}`}
        onPointerDown={grab}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
      >
        {holding.current ? 'HOLDING STILL' : 'Press & hold to stay still'}
      </button>
      <button className="btn staystill__skip" onClick={onNext}>
        Skip →
      </button>
    </div>
  )
}
