import { useState } from 'react'
import type { DialogueChoice } from '../engine/types'
import { useTypewriter } from '../engine/useTypewriter'
import { sendDing, chime } from '../audio/sound'
import './BalconyScene.css'

interface Props {
  intro: string[]
  setup: string[]
  prompt: string
  choices: DialogueChoice[]
  after: string[]
  onNext: () => void
}

/** A typed panel over the porch backdrop; tap to finish, tap to advance. */
function Panel({ lines, onDone }: { lines: string[]; onDone: () => void }) {
  const { shown, done, skip } = useTypewriter(lines, 34)
  return (
    <div
      className="balcony__panel"
      onClick={() => (done ? onDone() : skip())}
      style={{ cursor: 'pointer' }}
    >
      {shown.split('\n').map((p, i, arr) => (
        <p key={i}>
          {p}
          {i === arr.length - 1 && !done && <span className="cursor">▍</span>}
        </p>
      ))}
      <div className="tap-hint" style={{ marginTop: 8 }}>
        {done ? 'tap to continue' : 'tap to skip'}
      </div>
    </div>
  )
}

/** Chapter 9: the proposal, over a pixel-art night porch. */
export default function BalconyScene({ intro, setup, prompt, choices, after, onNext }: Props) {
  const [phase, setPhase] = useState<'intro' | 'setup' | 'ask' | 'reply' | 'after'>('intro')
  const [reply, setReply] = useState<string[]>([])

  return (
    <div className="scene balcony fade-in">
      <div className="balcony__view">
        <BalconyArt />
        <div className="balcony__overlay">
          {phase === 'intro' && <Panel key="intro" lines={intro} onDone={() => setPhase('setup')} />}
          {phase === 'setup' && <Panel key="setup" lines={setup} onDone={() => setPhase('ask')} />}
          {phase === 'ask' && (
            <div className="balcony__ask">
              <div className="balcony__prompt">{prompt}</div>
              <div className="dialogue__choices">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className="choice"
                    onClick={() => {
                      chime()
                      setReply(c.reply)
                      setPhase('reply')
                    }}
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          {phase === 'reply' && (
            <Panel
              key="reply"
              lines={['You: ' + reply[0], ...reply.slice(1)]}
              onDone={() => {
                sendDing()
                setPhase('after')
              }}
            />
          )}
          {phase === 'after' && <Panel key="after" lines={after} onDone={onNext} />}
        </div>
      </div>
    </div>
  )
}

function BalconyArt() {
  const pine = (x: number, baseY: number, h: number, w: number, key: string) => (
    <g key={key}>
      <rect x={x - 1} y={baseY - 2} width={2} height={5} fill="#10180f" />
      <polygon points={`${x},${baseY - h} ${x - w / 2},${baseY} ${x + w / 2},${baseY}`} fill="#0f1a12" />
      <polygon
        points={`${x},${baseY - h * 0.66} ${x - w * 0.42},${baseY - h * 0.22} ${x + w * 0.42},${baseY - h * 0.22}`}
        fill="#152219"
      />
    </g>
  )
  return (
    <svg className="balcony__svg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
      <defs>
        <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070c1c" />
          <stop offset="1" stopColor="#1b2a4a" />
        </linearGradient>
      </defs>
      {/* sky */}
      <rect x="0" y="0" width="160" height="66" fill="url(#nsky)" />
      {/* moon */}
      <rect x="28" y="10" width="9" height="9" fill="#eef2e0" />
      <rect x="26" y="12" width="2" height="5" fill="#eef2e0" />
      <rect x="37" y="12" width="2" height="5" fill="#eef2e0" />
      <rect x="31" y="12" width="3" height="2" fill="#c9d0bb" />
      {/* stars */}
      {[
        [60, 8], [82, 14], [100, 7], [120, 12], [138, 9], [150, 20],
        [70, 22], [110, 24], [48, 26], [92, 30], [16, 30], [132, 28],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill="#cfd8ef" />
      ))}
      {/* distant tall treeline */}
      <rect x="0" y="58" width="160" height="18" fill="#0c140d" />
      {pine(12, 66, 34, 14, 'p1')}
      {pine(30, 62, 40, 16, 'p2')}
      {pine(52, 66, 30, 12, 'p3')}
      {pine(74, 60, 44, 17, 'p4')}
      {pine(96, 66, 32, 13, 'p5')}
      {pine(118, 62, 42, 16, 'p6')}
      {pine(140, 66, 36, 15, 'p7')}
      {pine(154, 64, 38, 14, 'p8')}
      {/* porch floor */}
      <rect x="0" y="74" width="160" height="26" fill="#20160d" />
      {/* wooden railing */}
      <rect x="0" y="72" width="160" height="5" fill="#5a3d22" />
      <rect x="0" y="72" width="160" height="1" fill="#734f2c" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={`b${i}`} x={6 + i * 10} y={77} width="3" height="23" fill="#4a3119" />
      ))}
      {/* posts */}
      <rect x="0" y="70" width="6" height="30" fill="#3a2614" />
      <rect x="154" y="70" width="6" height="30" fill="#3a2614" />
    </svg>
  )
}
