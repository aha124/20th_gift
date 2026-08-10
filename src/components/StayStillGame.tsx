import { useEffect, useReducer, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { woozy, eyeCue, snore } from '../audio/sound'
import './StayStillGame.css'

interface Props {
  intro: string
  after: string[]
  onNext: () => void
}

type Phase = 'sleep' | 'stir' | 'watch'

const TICK = 100
const GAIN = 1.6 // stillness gained per clean tick
const CATCH_PENALTY = 16
const STIR_MS = 550
const FAKEOUT = 0.35

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/**
 * Pappy's watch windows are random now, and he fakes you out: a stir always
 * comes first, but sometimes he just rolls over and snores. Only a truly open
 * eye can catch you — releasing during a fake-out is free. That's the joke.
 */
export default function StayStillGame({ intro, after, onNext }: Props) {
  const holding = useRef(false)
  const still = useRef(0)
  const phase = useRef<Phase>('sleep')
  const phaseLeft = useRef(rand(1000, 2200))
  const penalized = useRef(false)
  const mode = useRef<'play' | 'won'>('play')
  const [caught, setCaught] = useState(0)
  const [flash, setFlash] = useState(false)
  const [, force] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    const id = setInterval(() => {
      if (mode.current !== 'play') return

      phaseLeft.current -= TICK
      if (phaseLeft.current <= 0) {
        if (phase.current === 'sleep') {
          phase.current = 'stir'
          phaseLeft.current = STIR_MS
        } else if (phase.current === 'stir') {
          if (Math.random() < FAKEOUT) {
            phase.current = 'sleep'
            phaseLeft.current = rand(1000, 2200)
            snore()
          } else {
            phase.current = 'watch'
            phaseLeft.current = rand(1200, 2400)
            penalized.current = false
            eyeCue()
          }
        } else {
          phase.current = 'sleep'
          phaseLeft.current = rand(1000, 2200)
        }
      }

      // Only a truly open eye can catch you.
      if (phase.current === 'watch' && !holding.current && !penalized.current) {
        penalized.current = true
        still.current = Math.max(0, still.current - CATCH_PENALTY)
        setCaught((c) => c + 1)
        setFlash(true)
        woozy()
        window.setTimeout(() => setFlash(false), 500)
      } else {
        still.current = Math.min(100, still.current + GAIN)
      }

      if (still.current >= 100) mode.current = 'won'
      force()
    }, TICK)
    return () => clearInterval(id)
  }, [])

  if (mode.current === 'won') {
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

  const p = phase.current
  const grab = () => {
    holding.current = true
    force()
  }
  const release = () => {
    holding.current = false
    force()
  }

  const statusText =
    p === 'watch'
      ? '👁 EYES OPEN — hold still!'
      : p === 'stir'
        ? '🫣 he stirs — is he…?'
        : '😴 he drifts…'

  return (
    <div className={`scene staystill fade-in ${flash ? 'staystill--flash' : ''}`}>
      <div className="staystill__intro">{intro}</div>

      <div className="staystill__room">
        <div className={`staystill__pappy ${p === 'watch' ? 'watching' : ''} ${p === 'stir' ? 'stirring' : ''}`}>
          👴
        </div>
        <div
          className={`staystill__status ${
            p === 'watch' ? 'watching' : p === 'stir' ? 'stirring' : 'resting'
          }`}
        >
          {statusText}
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
            style={{ width: `${still.current}%`, background: p === 'watch' ? '#d9534f' : '#4caf50' }}
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
