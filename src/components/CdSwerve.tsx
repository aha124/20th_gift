import { useState } from 'react'
import NarrationCard from './NarrationCard'
import { useTypewriter } from '../engine/useTypewriter'
import { crunch } from '../audio/sound'
import './scenes.css'

interface Props {
  lines: string[]
  after: string[]
  onNext: () => void
}

/**
 * The cold open. A pixel-art view out the windshield: a dirt road running
 * straight to the horizon, tall trees crowding both shoulders. The CD glows
 * on the dashboard. Reach for it, and the road disappears.
 */
export default function CdSwerve({ lines, after, onNext }: Props) {
  const [stage, setStage] = useState<'setup' | 'wheel' | 'crash' | 'after'>('setup')
  const { shown, done, skip } = useTypewriter(lines)

  if (stage === 'after') {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  function grabCd() {
    crunch()
    setStage('crash')
    setTimeout(() => setStage('after'), 1500)
  }

  return (
    <div className="scene fade-in">
      <div className={`drive ${stage === 'crash' ? 'drive--crash' : ''}`}>
        <DriveArt />
        <div className="drive__motion" aria-hidden>
          <span style={{ animationDelay: '0s' }} />
          <span style={{ animationDelay: '0.5s' }} />
          <span style={{ animationDelay: '1s' }} />
          <span style={{ animationDelay: '1.5s' }} />
        </div>
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
            onClick={() => (done ? setStage('wheel') : skip())}
          >
            {shown.split('\n').map((p, i, arr) => (
              <p key={i}>
                {p}
                {i === arr.length - 1 && !done && <span className="cursor">▍</span>}
              </p>
            ))}
          </div>
          <div className="tap-hint">{done ? 'tap to continue' : 'tap to skip'}</div>
        </>
      )}
      {stage === 'wheel' && <div className="tap-hint">reach for the CD on the dash</div>}
    </div>
  )
}

/** The pixel-art windshield scene, hand-built from blocky SVG shapes. */
function DriveArt() {
  // A row of pines receding toward the horizon on one side.
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

      {/* Dirt road to the vanishing point */}
      <polygon points="80,42 128,80 32,80" fill="url(#road)" />
      {/* ruts */}
      <polygon points="79,42 70,80 76,80" fill="#3c2e1c" />
      <polygon points="81,42 84,80 90,80" fill="#3c2e1c" />
      {/* rocks / texture speckles */}
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
        <rect key={`r${i}`} x={x} y={y} width={s} height={s} fill="#8a6c40" />
      ))}

      {/* Tall trees crowding both shoulders, receding to the horizon */}
      {pine(36, 52, 12, 8, 'l3')}
      {pine(24, 66, 22, 14, 'l2')}
      {pine(9, 82, 40, 24, 'l1')}
      {pine(124, 52, 12, 8, 'r3')}
      {pine(136, 66, 22, 14, 'r2')}
      {pine(151, 82, 40, 24, 'r1')}

      {/* Dashboard / car interior in the foreground */}
      <rect x="0" y="80" width="160" height="20" fill="#0c0f14" />
      <rect x="0" y="80" width="160" height="2" fill="#1b2028" />
      {/* steering wheel arc */}
      <path d="M52 100 Q80 78 108 100" fill="none" stroke="#22272f" strokeWidth="4" />
      <path d="M52 100 Q80 82 108 100" fill="none" stroke="#171b21" strokeWidth="2" />
      {/* a little gauge */}
      <rect x="16" y="86" width="10" height="10" fill="#161a20" />
      <rect x="20" y="88" width="2" height="5" fill="#5f7fb0" />
      {/* CD holder slot on the right of the dash */}
      <rect x="96" y="85" width="20" height="9" fill="#161a20" />
    </svg>
  )
}
