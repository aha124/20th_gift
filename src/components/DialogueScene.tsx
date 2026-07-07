import { useState } from 'react'
import type { DialogueChoice } from '../engine/types'
import NarrationCard from './NarrationCard'
import { sendDing } from '../audio/sound'
import './scenes.css'

interface Props {
  prompt: string
  choices: DialogueChoice[]
  after?: string[]
  onNext: () => void
}

/**
 * She picks a line. He replies warmly to whatever she chose, then the scene
 * lands on the same closing beat. Voice and presence, not a puzzle.
 */
export default function DialogueScene({ prompt, choices, after, onNext }: Props) {
  const [picked, setPicked] = useState<DialogueChoice | null>(null)
  const [showAfter, setShowAfter] = useState(false)

  if (showAfter && after && after.length) {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  if (picked) {
    return (
      <NarrationCard
        lines={[`You: ${picked.text}`, ...picked.reply]}
        onNext={() => (after && after.length ? setShowAfter(true) : onNext())}
      />
    )
  }

  return (
    <div className="scene fade-in">
      <div className="dialogue__prompt">{prompt}</div>
      <div className="dialogue__choices">
        {choices.map((c, i) => (
          <button
            key={i}
            className="choice"
            onClick={() => {
              sendDing()
              setPicked(c)
            }}
          >
            {c.text}
          </button>
        ))}
      </div>
    </div>
  )
}
