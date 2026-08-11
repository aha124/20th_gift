import { useEffect, useState } from 'react'
import { BOOT_LINE, HER_SN } from '../content/story'
import { useTypewriter } from '../engine/useTypewriter'
import { playDialup, signOn, unlockAudio, DIALUP_MS } from '../audio/sound'
import { useFullscreen } from '../engine/useFullscreen'
import './BootScreen.css'

type Phase = 'off' | 'line' | 'power' | 'dialup' | 'signon'

interface Props {
  onComplete: () => void
}

/** Boot → the dedication line → dial-up → the AIM sign-on window. */
export default function BootScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('off')
  const { shown, done, skip } = useTypewriter(phase === 'line' ? [BOOT_LINE] : [], 30)
  const fullscreen = useFullscreen()

  function begin() {
    unlockAudio()
    setPhase('line')
  }

  useEffect(() => {
    if (phase === 'line' && done) {
      const t = setTimeout(() => setPhase('power'), 1400)
      return () => clearTimeout(t)
    }
    if (phase === 'power') {
      const t = setTimeout(() => setPhase('dialup'), 1200)
      return () => clearTimeout(t)
    }
    if (phase === 'dialup') {
      const stop = playDialup()
      const t = setTimeout(() => {
        stop()
        setPhase('signon')
      }, DIALUP_MS)
      return () => {
        stop()
        clearTimeout(t)
      }
    }
  }, [phase, done])

  if (phase === 'off') {
    return (
      <div className="boot boot--off" onClick={begin}>
        <div className="boot__power">
          <span className="boot__power-ring" />
          <span className="tap-hint">tap to power on</span>
          {fullscreen.supported && !fullscreen.isFull && (
            <button
              className="btn boot__fs"
              onClick={(e) => {
                e.stopPropagation()
                fullscreen.toggle()
              }}
            >
              ⛶ Play full screen
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'line') {
    return (
      <div className="boot" onClick={skip}>
        <pre className="boot__line">
          {shown}
          <span className="cursor">▍</span>
        </pre>
      </div>
    )
  }

  if (phase === 'power') {
    return (
      <div className="boot">
        <div className="boot__logo fade-in">HARBORVIEW</div>
        <div className="boot__sub fade-in">starting up…</div>
      </div>
    )
  }

  if (phase === 'dialup') {
    return (
      <div className="boot" onClick={() => setPhase('signon')}>
        <div className="boot__modem fade-in">
          <div className="boot__modem-icon">📞</div>
          <div className="boot__modem-text">Connecting…</div>
          <div className="boot__modem-bar">
            <span style={{ animationDuration: `${DIALUP_MS}ms` }} />
          </div>
          <div className="boot__modem-sub">Dialing 1-718-… • 56k</div>
          <div className="tap-hint">tap to skip</div>
        </div>
      </div>
    )
  }

  // sign-on
  return (
    <div className="boot">
      <div className="win signon fade-in">
        <div className="win__title">
          <span className="dot" />
          Sign On
          <span className="win__spacer" />
          <span className="win__btn">×</span>
        </div>
        <div className="signon__body">
          <div className="signon__runner">🏃</div>
          <label className="signon__label">Screen Name</label>
          <div className="signon__field">{HER_SN}</div>
          <label className="signon__label">Password</label>
          <div className="signon__field">••••••••</div>
          <button
            className="btn btn--primary signon__go"
            onClick={() => {
              signOn()
              onComplete()
            }}
          >
            Sign On
          </button>
        </div>
      </div>
    </div>
  )
}
