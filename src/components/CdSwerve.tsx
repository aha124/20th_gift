import { useEffect, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { useTypewriter } from '../engine/useTypewriter'
import { crunch, gravel } from '../audio/sound'
import './scenes.css'

interface Props {
  lines: string[]
  after: string[]
  onNext: () => void
}

const DRIVE_MS = 12000

/**
 * The cold open. First you actually drive the van down the dirt road for a
 * dozen seconds — hold the left or right side of the windshield (or arrow
 * keys) to steer as the road bends. Drift onto the shoulder and the cab
 * rattles, but the night is forgiving; the van pulls itself back. Then the CD
 * glows on the dash, and the story does the rest.
 */
export default function CdSwerve({ lines, after, onNext }: Props) {
  const [stage, setStage] = useState<'setup' | 'drive' | 'wheel' | 'crash' | 'after'>('setup')
  const { shown, done, skip } = useTypewriter(lines)

  // Driving state lives in refs; a single rAF loop paints via setFrame.
  const pos = useRef(0) // where the van is pointed, -1..1
  const curve = useRef(0) // where the road actually is
  const curveTarget = useRef(0)
  const dir = useRef(0) // -1 | 0 | 1 from input
  const progress = useRef(0)
  const lastGravel = useRef(0)
  const [frame, setFrame] = useState({ err: 0, progress: 0, offRoad: false })

  useEffect(() => {
    if (stage !== 'drive') return
    let raf = 0
    let last = performance.now()
    let elapsed = 0

    const step = (now: number) => {
      const dt = Math.min(50, now - last) / 1000
      last = now
      elapsed += dt

      // A pre-baked wandering road: deterministic, so the feel is tunable.
      curveTarget.current = 0.9 * Math.sin(elapsed * 0.7) + 0.45 * Math.sin(elapsed * 1.6 + 1)
      curve.current += (curveTarget.current - curve.current) * dt * 1.4

      // Steering, plus a gentle self-correct so she can never truly crash.
      pos.current += dir.current * dt * 1.25
      pos.current += (curve.current - pos.current) * dt * 0.14
      pos.current = Math.max(-1.3, Math.min(1.3, pos.current))

      const err = curve.current - pos.current
      const offRoad = Math.abs(err) > 0.5
      if (offRoad && now - lastGravel.current > 380) {
        lastGravel.current = now
        gravel()
      }

      progress.current = Math.min(1, progress.current + (dt * 1000) / DRIVE_MS)
      setFrame({ err, progress: progress.current, offRoad })

      if (progress.current >= 1) {
        setStage('wheel')
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') dir.current = -1
      if (e.key === 'ArrowRight') dir.current = 1
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && dir.current === -1) dir.current = 0
      if (e.key === 'ArrowRight' && dir.current === 1) dir.current = 0
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [stage])

  if (stage === 'after') {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  function grabCd() {
    crunch()
    setStage('crash')
    setTimeout(() => setStage('after'), 1500)
  }

  const driving = stage === 'drive'

  return (
    <div className="scene fade-in">
      <div
        className={`drive ${stage === 'crash' ? 'drive--crash' : ''} ${
          driving && frame.offRoad ? 'drive--rattle' : ''
        }`}
      >
        <DriveArt err={driving ? frame.err : 0} />
        <div className="drive__motion" aria-hidden>
          <span style={{ animationDelay: '0s' }} />
          <span style={{ animationDelay: '0.5s' }} />
          <span style={{ animationDelay: '1s' }} />
          <span style={{ animationDelay: '1.5s' }} />
        </div>

        {driving && (
          <>
            <div className="drive__hud">
              <span className="drive__hud-label">almost home</span>
              <span className="drive__hud-track">
                <span className="drive__hud-fill" style={{ width: `${frame.progress * 100}%` }} />
              </span>
            </div>
            <button
              className="drive__steer drive__steer--l"
              aria-label="steer left"
              onPointerDown={() => (dir.current = -1)}
              onPointerUp={() => (dir.current = 0)}
              onPointerLeave={() => dir.current === -1 && (dir.current = 0)}
              onPointerCancel={() => (dir.current = 0)}
            >
              ◀
            </button>
            <button
              className="drive__steer drive__steer--r"
              aria-label="steer right"
              onPointerDown={() => (dir.current = 1)}
              onPointerUp={() => (dir.current = 0)}
              onPointerLeave={() => dir.current === 1 && (dir.current = 0)}
              onPointerCancel={() => (dir.current = 0)}
            >
              ▶
            </button>
            {frame.offRoad && <div className="drive__shoulder-warn">gravel!</div>}
          </>
        )}

        {stage === 'wheel' && (
          <button className="drive__cd" aria-label="reach for the CD" onClick={grabCd}>
            <span className="drive__cd-disc" />
          </button>
        )}
        {stage === 'crash' && <div className="drive__flash" />}
      </div>

      {stage === 'setup' && (
        <>
          <div
            className="narration"
            style={{ cursor: 'pointer', width: 'min(680px, 92vw)' }}
            onClick={() => (done ? setStage('drive') : skip())}
          >
            {shown.split('\n').map((p, i, arr) => (
              <p key={i}>
                {p}
                {i === arr.length - 1 && !done && <span className="cursor">▍</span>}
              </p>
            ))}
          </div>
          <div className="tap-hint">{done ? 'tap to take the wheel' : 'tap to skip'}</div>
        </>
      )}
      {driving && <div className="tap-hint">hold ◀ ▶ to keep the van on the road</div>}
      {stage === 'wheel' && <div className="tap-hint">reach for the CD on the dash</div>}
    </div>
  )
}

/** The pixel-art windshield. `err` bends the road and parallaxes the trees. */
function DriveArt({ err }: { err: number }) {
  const apex = 80 + err * 38
  const treeShift = err * 14
  const farShift = err * 24

  const pine = (x: number, baseY: number, h: number, w: number, key: string) => {
    const trunkW = Math.max(1, Math.round(w * 0.16))
    return (
      <g key={key}>
        <rect x={x - trunkW / 2} y={baseY - 2} width={trunkW} height={4} fill="#2a1c10" />
        <polygon points={`${x},${baseY - h} ${x - w / 2},${baseY} ${x + w / 2},${baseY}`} fill="#16241a" />
        <polygon
          points={`${x},${baseY - h * 0.72} ${x - w * 0.42},${baseY - h * 0.28} ${x + w * 0.42},${baseY - h * 0.28}`}
          fill="#1d2f21"
        />
        <polygon
          points={`${x},${baseY - h * 0.44} ${x - w * 0.34},${baseY - h * 0.02} ${x + w * 0.34},${baseY - h * 0.02}`}
          fill="#233826"
        />
      </g>
    )
  }

  return (
    <svg
      className="drive__svg"
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1224" />
          <stop offset="1" stopColor="#243456" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3a24" />
          <stop offset="1" stopColor="#6d5231" />
        </linearGradient>
      </defs>

      {/* Sky + moon + stars */}
      <rect x="0" y="0" width="160" height="42" fill="url(#sky)" />
      <rect x="122" y="7" width="8" height="8" fill="#e7edda" />
      <rect x="120" y="9" width="2" height="4" fill="#e7edda" />
      <rect x="130" y="9" width="2" height="4" fill="#e7edda" />
      {[
        [18, 8],
        [40, 14],
        [66, 6],
        [90, 12],
        [30, 22],
        [102, 20],
        [12, 30],
        [150, 26],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill="#cdd8ef" />
      ))}

      {/* Ground */}
      <rect x="0" y="42" width="160" height="58" fill="#1a2416" />

      {/* Dirt road to the (bending) vanishing point */}
      <polygon points={`${apex},42 128,80 32,80`} fill="url(#road)" />
      <polygon points={`${apex - 1},42 70,80 76,80`} fill="#3c2e1c" />
      <polygon points={`${apex + 1},42 84,80 90,80`} fill="#3c2e1c" />
      {[
        [74, 52, 1],
        [86, 56, 1],
        [66, 64, 2],
        [96, 62, 1],
        [58, 72, 2],
        [104, 74, 2],
        [80, 60, 1],
        [90, 70, 1],
        [70, 76, 1],
      ].map(([x, y, s], i) => (
        <rect key={`r${i}`} x={x + err * 8} y={y} width={s} height={s} fill="#8a6c40" />
      ))}

      {/* Tall trees crowding both shoulders; far rows parallax harder */}
      <g transform={`translate(${farShift} 0)`}>
        {pine(36, 52, 12, 8, 'l3')}
        {pine(124, 52, 12, 8, 'r3')}
      </g>
      <g transform={`translate(${treeShift} 0)`}>
        {pine(24, 66, 22, 14, 'l2')}
        {pine(136, 66, 22, 14, 'r2')}
      </g>
      <g transform={`translate(${err * 7} 0)`}>
        {pine(9, 82, 40, 24, 'l1')}
        {pine(151, 82, 40, 24, 'r1')}
      </g>

      {/* Dashboard / car interior in the foreground */}
      <rect x="0" y="80" width="160" height="20" fill="#0c0f14" />
      <rect x="0" y="80" width="160" height="2" fill="#1b2028" />
      <path d="M52 100 Q80 78 108 100" fill="none" stroke="#22272f" strokeWidth="4" />
      <path d="M52 100 Q80 82 108 100" fill="none" stroke="#171b21" strokeWidth="2" />
      <rect x="16" y="86" width="10" height="10" fill="#161a20" />
      <rect x="20" y="88" width="2" height="5" fill="#5f7fb0" />
      <rect x="96" y="85" width="20" height="9" fill="#161a20" />
    </svg>
  )
}
