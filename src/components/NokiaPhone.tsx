import { useCallback, useEffect, useRef, useState } from 'react'
import { keyTone, chime } from '../audio/sound'
import './NokiaPhone.css'

interface Props {
  /** The message she is tapping toward. Matched case-insensitively. */
  target: string
  prompt: string
  onDone: () => void
}

// Multi-tap map. Repeated presses of the same key cycle these in order.
const KEYS: { num: string; letters: string[]; sub: string }[] = [
  { num: '1', letters: ['.', ',', '?', '!'], sub: '. , ? !' },
  { num: '2', letters: ['a', 'b', 'c'], sub: 'ABC' },
  { num: '3', letters: ['d', 'e', 'f'], sub: 'DEF' },
  { num: '4', letters: ['g', 'h', 'i'], sub: 'GHI' },
  { num: '5', letters: ['j', 'k', 'l'], sub: 'JKL' },
  { num: '6', letters: ['m', 'n', 'o'], sub: 'MNO' },
  { num: '7', letters: ['p', 'q', 'r', 's'], sub: 'PQRS' },
  { num: '8', letters: ['t', 'u', 'v'], sub: 'TUV' },
  { num: '9', letters: ['w', 'x', 'y', 'z'], sub: 'WXYZ' },
  { num: '*', letters: [], sub: '' },
  { num: '0', letters: [' '], sub: 'space' },
  { num: '#', letters: [], sub: '' },
]

const COMMIT_MS = 900

export default function NokiaPhone({ target, prompt, onDone }: Props) {
  const [committed, setCommitted] = useState('')
  const [pending, setPending] = useState<{ key: string; idx: number } | null>(null)
  const commitTimer = useRef<number | null>(null)

  const clearTimer = () => {
    if (commitTimer.current) {
      window.clearTimeout(commitTimer.current)
      commitTimer.current = null
    }
  }

  // Commit whatever letter is currently cycling.
  const flush = useCallback(() => {
    setPending((p) => {
      if (p) {
        const def = KEYS.find((k) => k.num === p.key)
        if (def && def.letters.length) {
          setCommitted((c) => c + def.letters[p.idx])
        }
      }
      return null
    })
    clearTimer()
  }, [])

  const armCommit = useCallback(() => {
    clearTimer()
    commitTimer.current = window.setTimeout(flush, COMMIT_MS)
  }, [flush])

  const pressKey = (num: string) => {
    const def = KEYS.find((k) => k.num === num)
    if (!def || def.letters.length === 0) return
    keyTone(num.charCodeAt(0))

    // Space commits immediately and appends a space.
    if (num === '0') {
      flush()
      setCommitted((c) => c + ' ')
      return
    }

    setPending((p) => {
      if (p && p.key === num) {
        // Same key: cycle to the next letter in place.
        return { key: num, idx: (p.idx + 1) % def.letters.length }
      }
      // Different key: commit the previous letter, start this one.
      if (p) {
        const prev = KEYS.find((k) => k.num === p.key)
        if (prev && prev.letters.length) {
          setCommitted((c) => c + prev.letters[p.idx])
        }
      }
      return { key: num, idx: 0 }
    })
    armCommit()
  }

  const backspace = () => {
    keyTone(7)
    clearTimer()
    if (pending) {
      setPending(null)
      return
    }
    setCommitted((c) => c.slice(0, -1))
  }

  useEffect(() => () => clearTimer(), [])

  // Live view = committed text + the letter currently cycling.
  const pendingChar =
    pending && KEYS.find((k) => k.num === pending.key)?.letters[pending.idx]
  const display = committed + (pendingChar ?? '')
  const matched = display.trim().toLowerCase() === target.trim().toLowerCase()

  function accept() {
    flush()
    chime()
    setTimeout(onDone, 400)
  }

  return (
    <div className="center-col fade-in">
      <div className="nokia">
        <div className="nokia__brand">NOKIA</div>
        <div className="nokia__screen">
          <div className="nokia__status">
            <span>Abc</span>
            <span className="nokia__signal" />
          </div>
          <div className="nokia__prompt">Message: type “{target}”</div>
          <div className="nokia__text">
            {committed}
            {pendingChar && <span className="nokia__pending">{pendingChar}</span>}
            <span className="nokia__caret">|</span>
          </div>
          {matched && <div className="nokia__target-ok">looks good — press Send</div>}
        </div>

        <div className="nokia__softkeys">
          <button className="nokia__soft nokia__soft--go" onClick={accept} disabled={!matched}>
            Send
          </button>
          <button className="nokia__soft" onClick={backspace}>
            Clear
          </button>
        </div>

        <div className="nokia__keys">
          {KEYS.map((k) => (
            <button
              key={k.num}
              className="nokia__key"
              onClick={() => pressKey(k.num)}
              disabled={k.letters.length === 0}
            >
              <div className="num">{k.num}</div>
              <div className="sub">{k.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <p style={{ maxWidth: 320, textAlign: 'center', color: '#cdd6e4', fontSize: 12 }}>
        {prompt}
      </p>
      <button className="btn" onClick={accept}>
        Skip the tapping →
      </button>
    </div>
  )
}
