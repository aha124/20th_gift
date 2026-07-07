import { useTypewriter } from '../engine/useTypewriter'
import './scenes.css'

interface Props {
  lines: string[]
  onNext: () => void
}

/** A warm paper card that types itself out. Tap once to finish, tap to advance. */
export default function NarrationCard({ lines, onNext }: Props) {
  const { shown, done, skip } = useTypewriter(lines)
  const paras = shown.split('\n')

  return (
    <div
      className="scene fade-in"
      onClick={() => (done ? onNext() : skip())}
      style={{ cursor: 'pointer' }}
    >
      <div className="narration">
        {paras.map((p, i) => (
          <p key={i}>
            {p}
            {i === paras.length - 1 && !done && <span className="cursor">▍</span>}
          </p>
        ))}
      </div>
      <div className="tap-hint">{done ? 'tap to continue' : 'tap to skip'}</div>
    </div>
  )
}
