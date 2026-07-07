import { useState } from 'react'
import NarrationCard from './NarrationCard'
import { keyTone, chime, sendDing } from '../audio/sound'
import './IfcDateGame.css'

interface Props {
  after: string[]
  onNext: () => void
}

type Step = 'ticket' | 'sushi' | 'subway' | 'ferry' | 'done'

const SUSHI = ['Spicy tuna roll', 'Salmon avocado', 'Eel (splurge)', 'Cucumber roll', 'Edamame', 'Miso soup']

const TRAINS = [
  { line: '1', dest: 'South Ferry', right: true, color: '#e2231a' },
  { line: 'A', dest: 'Far Rockaway', right: false, color: '#0039a6' },
  { line: '7', dest: 'Flushing', right: false, color: '#b933ad' },
  { line: 'L', dest: 'Canarsie', right: false, color: '#a7a9ac' },
]

/** The Staten Island Ferry — famously orange. */
function FerrySprite() {
  return (
    <svg className="ifc__ferry" viewBox="0 0 56 34" shapeRendering="crispEdges" aria-label="Staten Island Ferry">
      {/* hull */}
      <polygon points="2,20 54,20 50,30 6,30" fill="#f2671b" />
      <rect x="2" y="20" width="52" height="2" fill="#c34e10" />
      {/* cabin */}
      <rect x="8" y="8" width="40" height="12" fill="#f2671b" />
      <rect x="8" y="8" width="40" height="2" fill="#ff8a3d" />
      {/* windows */}
      {[12, 20, 28, 36].map((x) => (
        <rect key={x} x={x} y="12" width="6" height="5" fill="#1c2a3a" />
      ))}
      {/* pilot house + stack */}
      <rect x="22" y="3" width="12" height="5" fill="#f2671b" />
      <rect x="26" y="0" width="4" height="4" fill="#3a2a1a" />
      {/* waterline foam */}
      <rect x="4" y="30" width="48" height="2" fill="#dff0f7" />
    </svg>
  )
}

/** Chapter 6: the whole IFC date — ticket, sushi, the right train, the ferry. */
export default function IfcDateGame({ after, onNext }: Props) {
  const [step, setStep] = useState<Step>('ticket')
  const [picks, setPicks] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState('')
  const [boarded, setBoarded] = useState(false)

  if (step === 'done') {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  const toggle = (item: string) =>
    setPicks((s) => {
      const n = new Set(s)
      n.has(item) ? n.delete(item) : n.add(item)
      keyTone(2)
      return n
    })

  return (
    <div className="scene ifc fade-in">
      <div className="ifc__steps">
        {(['ticket', 'sushi', 'subway', 'ferry'] as Step[]).map((s, i) => (
          <span key={s} className={`ifc__pip ${step === s ? 'on' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>

      {step === 'ticket' && (
        <div className="ifc__card">
          <div className="ifc__marquee">
            <div className="ifc__marquee-name">IFC CENTER</div>
            <div className="ifc__marquee-film">NOW SHOWING · ME AND YOU AND EVERYONE WE KNOW</div>
          </div>
          <p className="ifc__line">Two for the 7:20, please.</p>
          <button
            className="btn btn--primary"
            onClick={() => {
              chime()
              setStep('sushi')
            }}
          >
            🎟️ Buy 2 tickets ($20)
          </button>
        </div>
      )}

      {step === 'sushi' && (
        <div className="ifc__card">
          <div className="ifc__heading">Tiny sushi place. We can barely afford it. Pick what we split.</div>
          <div className="ifc__menu">
            {SUSHI.map((item) => (
              <button
                key={item}
                className={`ifc__menu-item ${picks.has(item) ? 'on' : ''}`}
                onClick={() => toggle(item)}
              >
                <span>{picks.has(item) ? '☑' : '☐'}</span> {item}
              </button>
            ))}
          </div>
          <button
            className="btn btn--primary"
            disabled={picks.size === 0}
            onClick={() => {
              sendDing()
              setStep('subway')
            }}
          >
            Order {picks.size > 0 ? `(${picks.size})` : ''}
          </button>
        </div>
      )}

      {step === 'subway' && (
        <div className="ifc__card">
          <div className="ifc__heading">Full and happy. Now — which train gets us back to the Staten Island Ferry?</div>
          <div className="ifc__trains">
            {TRAINS.map((t) => (
              <button
                key={t.line}
                className="ifc__train"
                onClick={() => {
                  if (t.right) {
                    chime()
                    setStep('ferry')
                  } else {
                    keyTone(1)
                    setWrong(`The ${t.line} to ${t.dest}? That is the wrong way. Back to the platform.`)
                  }
                }}
              >
                <span className="ifc__bullet" style={{ background: t.color }}>
                  {t.line}
                </span>
                <span>{t.dest}</span>
              </button>
            ))}
          </div>
          {wrong && <div className="ifc__wrong">{wrong}</div>}
        </div>
      )}

      {step === 'ferry' && (
        <div className="ifc__card">
          <div className="ifc__heading">South Ferry. The last leg: the Staten Island Ferry home to Wagner.</div>
          <div className="ifc__harbor">
            <div className="ifc__water" />
            <div className={`ifc__boat ${boarded ? 'sailing' : ''}`}>
              <FerrySprite />
            </div>
            <div className="ifc__shore ifc__shore--left">🏙️</div>
            <div className="ifc__shore ifc__shore--right">🗽</div>
          </div>
          {!boarded ? (
            <button
              className="btn btn--primary"
              onClick={() => {
                sendDing()
                setBoarded(true)
                window.setTimeout(() => setStep('done'), 3200)
              }}
            >
              ⛴️ Board the ferry
            </button>
          ) : (
            <div className="ifc__sailing-note">crossing the harbor…</div>
          )}
        </div>
      )}
    </div>
  )
}
