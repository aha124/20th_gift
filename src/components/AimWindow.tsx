import { useEffect, useRef, useState } from 'react'
import type { AimStep } from '../engine/types'
import {
  doorOpen,
  doorClose,
  receiveDing,
  sendDing,
} from '../audio/sound'
import { HIS_SN, HER_SN, HIS_PROFILE } from '../content/story'
import './AimWindow.css'

interface Props {
  script: AimStep[]
  buddyAway?: string
  onDone: () => void
}

interface ShownLine {
  from: 'him' | 'her' | 'system'
  text: string
}

const HER_AWAY_PRESETS = [
  '',
  'brb, class (allegedly)',
  'on the stoop',
  'thinking about someone in all black',
]

export default function AimWindow({ script, buddyAway, onDone }: Props) {
  const [lines, setLines] = useState<ShownLine[]>([])
  const [step, setStep] = useState(0)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [herAway, setHerAway] = useState('')
  const [awayIdx, setAwayIdx] = useState(0)
  const [exactTries, setExactTries] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)

  // Door-open when the conversation window first appears.
  useEffect(() => {
    doorOpen()
    return () => doorClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the log pinned to the newest message.
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines, typing])

  // Drive scripted (non-player) steps forward automatically.
  useEffect(() => {
    if (step >= script.length) {
      const t = setTimeout(onDone, 700)
      return () => clearTimeout(t)
    }
    const cur = script[step]
    if ('type' in cur && cur.type === 'playerInput') return // wait for her

    const delay = 'delayMs' in cur && cur.delayMs ? cur.delayMs : 800
    const from = (cur as { from: 'him' | 'her' | 'system' }).from
    if (from === 'him') setTyping(true)
    const t = setTimeout(() => {
      setTyping(false)
      setLines((l) => [...l, { from, text: (cur as { text: string }).text }])
      if (from === 'him') receiveDing()
      setStep((s) => s + 1)
    }, delay)
    return () => clearTimeout(t)
  }, [step, script, onDone])

  const current = step < script.length ? script[step] : null
  const awaitingInput = current && 'type' in current && current.type === 'playerInput'

  function send() {
    const text = draft.trim()
    if (!text || !awaitingInput) return
    const inp = current as Extract<AimStep, { type: 'playerInput' }>

    // Exact mode stays forgiving: nudge once or twice, then accept anyway.
    if (inp.mode === 'exact' && inp.expect) {
      const match = text.toLowerCase() === inp.expect.trim().toLowerCase()
      if (!match && exactTries < 2) {
        setLines((l) => [...l, { from: 'her', text }])
        sendDing()
        setDraft('')
        setExactTries((n) => n + 1)
        setTimeout(() => {
          setLines((l) => [
            ...l,
            { from: 'system', text: inp.hint ?? 'try that one more time' },
          ])
        }, 500)
        return
      }
    }

    setLines((l) => [...l, { from: 'her', text }])
    sendDing()
    setDraft('')
    setExactTries(0)
    setStep((s) => s + 1)
  }

  function cycleAway() {
    const next = (awayIdx + 1) % HER_AWAY_PRESETS.length
    setAwayIdx(next)
    setHerAway(HER_AWAY_PRESETS[next])
  }

  return (
    <div className="aim fade-in">
      {/* Buddy list */}
      <div className="win aim-bl">
        <div className="win__title">
          <span className="dot" />
          Buddy List
          <span className="win__spacer" />
          <span className="win__btn">_</span>
          <span className="win__btn">×</span>
        </div>
        <div className="aim-bl__brand">
          <span className="aim-runner">🏃</span> {HER_SN}
        </div>
        {herAway && <div className="aim-away-tag">Away: {herAway}</div>}
        <div className="aim-bl__body">
          <div className="aim-group">
            <span className="tri">▼</span> Buddies (1/1)
          </div>
          <div
            className="aim-buddy aim-buddy--on"
            onClick={() => setShowInfo(true)}
            title="Get info"
          >
            {HIS_SN}
          </div>

          <div className="aim-group">
            <span className="tri">▼</span> Family (0/1)
          </div>
          <div className="aim-buddy aim-buddy--off">dad_at_home</div>

          <div className="aim-group">
            <span className="tri">▶</span> Offline (3)
          </div>
          <div className="aim-buddy aim-buddy--off">markwalksyouin</div>
          <div className="aim-buddy aim-buddy--off">tanya_x0x0</div>
          <div className="aim-buddy aim-buddy--off">wagnerLC04</div>
        </div>
        <div className="aim-bl__foot">
          <button className="btn" onClick={cycleAway}>
            {herAway ? 'Away ✓' : 'Set Away'}
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="win aim-chat">
        <div className="win__title">
          <span className="dot" />
          {HIS_SN} — Instant Message
          <span className="win__spacer" />
          <span className="win__btn">_</span>
          <span className="win__btn">×</span>
        </div>
        <div className="aim-chat__log" ref={logRef}>
          {lines.map((l, i) => (
            <div key={i} className={`aim-line aim-line--${l.from}`}>
              {l.from === 'system' ? (
                <span>{l.text}</span>
              ) : (
                <>
                  <span className="sn">{l.from === 'him' ? HIS_SN : HER_SN}:</span>{' '}
                  <span>{l.text}</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="aim-typing">
          {typing ? `${HIS_SN} is typing…` : ' '}
        </div>
        <div className="aim-chat__compose">
          <div className="aim-toolbar">
            <span>A</span>
            <span>😊</span>
            <span>🔗</span>
            <span>Aa</span>
          </div>
          <div className="aim-input-row">
            <textarea
              className="aim-input"
              value={draft}
              placeholder={
                awaitingInput
                  ? (current as Extract<AimStep, { type: 'playerInput' }>).placeholder ??
                    'type something'
                  : ''
              }
              disabled={!awaitingInput}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              autoFocus
            />
            <button
              className="btn btn--primary aim-send"
              disabled={!awaitingInput || !draft.trim()}
              onClick={send}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {showInfo && (
        <div className="aim-modal-back" onClick={() => setShowInfo(false)}>
          <div className="win aim-info" onClick={(e) => e.stopPropagation()}>
            <div className="win__title">
              <span className="dot" />
              Buddy Info
              <span className="win__spacer" />
              <span className="win__btn" onClick={() => setShowInfo(false)}>
                ×
              </span>
            </div>
            <div className="aim-info__body">
              <div className="aim-info__sn">{HIS_SN}</div>
              <div className="aim-info__row">Warning level: 0%</div>
              <div className="aim-info__row">
                Away message: {buddyAway ?? HIS_PROFILE.status}
              </div>
              <div className="aim-info__quote">{HIS_PROFILE.quote}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
