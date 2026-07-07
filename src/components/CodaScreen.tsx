import { useEffect, useState } from 'react'
import type { AimStep } from '../engine/types'
import { HER_SN, HIS_SN } from '../content/story'
import { receiveDing, doorOpen } from '../audio/sound'
import './CodaScreen.css'

interface Props {
  script: AimStep[]
  onDone: () => void
}

interface Line {
  from: 'him' | 'her' | 'system'
  text: string
}

/**
 * The gift. The old machine reboots into something newer, and one last
 * message window opens: star4ker21x → grluxy, present day.
 */
export default function CodaScreen({ script, onDone }: Props) {
  const [phase, setPhase] = useState<'reboot' | 'chat'>('reboot')
  const [lines, setLines] = useState<Line[]>([])
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      doorOpen()
      setPhase('chat')
    }, 2600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (phase !== 'chat') return
    if (step >= script.length) {
      setFinished(true)
      return
    }
    const cur = script[step]
    if ('type' in cur) {
      setStep((s) => s + 1)
      return
    }
    setTyping(true)
    const t = setTimeout(() => {
      setTyping(false)
      setLines((l) => [...l, { from: cur.from, text: cur.text }])
      receiveDing()
      setStep((s) => s + 1)
    }, cur.delayMs ?? 1600)
    return () => clearTimeout(t)
  }, [phase, step, script])

  if (phase === 'reboot') {
    return (
      <div className="coda-reboot">
        <div className="coda-reboot__logo fade-in"></div>
        <div className="coda-reboot__bar">
          <span />
        </div>
      </div>
    )
  }

  return (
    <div className="coda fade-in">
      <div className="coda__phone">
        <div className="coda__notch" />
        <div className="coda__header">
          <div className="coda__avatar">★</div>
          <div>
            <div className="coda__name">{HIS_SN}</div>
            <div className="coda__sub">today</div>
          </div>
        </div>
        <div className="coda__thread">
          {lines.map((l, i) => (
            <div key={i} className={`bubble bubble--${l.from}`}>
              {l.text}
            </div>
          ))}
          {typing && (
            <div className="bubble bubble--him bubble--typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
        {finished && (
          <div className="coda__reply fade-in">
            <div className="coda__reply-hint">— from {HIS_SN}, still yours, to {HER_SN}</div>
            <button className="btn btn--primary" onClick={onDone}>
              ♥
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
