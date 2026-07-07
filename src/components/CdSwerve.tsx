import { useState } from 'react'
import NarrationCard from './NarrationCard'
import { useTypewriter } from '../engine/useTypewriter'
import { doorClose } from '../audio/sound'
import './scenes.css'

interface Props {
  lines: string[]
  after: string[]
  onNext: () => void
}

/** The cold open: narration, reach for the CD, the swerve, then the landing. */
export default function CdSwerve({ lines, after, onNext }: Props) {
  const [stage, setStage] = useState<'setup' | 'wheel' | 'crash' | 'after'>('setup')
  const { shown, done, skip } = useTypewriter(lines)

  if (stage === 'after') {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  return (
    <div className="scene fade-in">
      <div className={`swerve-stage ${stage === 'crash' ? 'tilt' : ''}`}>
        <div className="swerve-road" />
        {stage === 'wheel' && (
          <button
            className="cd-btn"
            aria-label="reach for the CD"
            onClick={() => {
              // A soft crunch, then stillness.
              doorClose()
              setStage('crash')
              setTimeout(() => setStage('after'), 1400)
            }}
          />
        )}
        {stage === 'crash' && (
          <div style={{ color: '#ffd1d1', fontFamily: 'var(--mono)', fontSize: 20 }}>…</div>
        )}
      </div>

      {stage === 'setup' && (
        <>
          <div className="narration" style={{ cursor: 'pointer' }} onClick={() => (done ? setStage('wheel') : skip())}>
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
      {stage === 'wheel' && <div className="tap-hint">reach for the CD</div>}
    </div>
  )
}
