import { useState } from 'react'
import type { RoomObject } from '../engine/types'
import NarrationCard from './NarrationCard'
import { doorOpen } from '../audio/sound'
import './scenes.css'

interface Props {
  intro: string
  objects: RoomObject[]
  outro: string[]
  onNext: () => void
}

/** Chapter 5: click around the dorm room, each object a memory. */
export default function PointClickRoom({ intro, objects, outro, onNext }: Props) {
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<RoomObject | null>(null)
  const [finishing, setFinishing] = useState(false)

  if (finishing) {
    return <NarrationCard lines={outro} onNext={onNext} />
  }

  const allSeen = seen.size >= objects.length

  return (
    <div className="room fade-in">
      <div className="room__intro">{intro}</div>
      <div className="room__stage">
        <div className="room__floor" />
        {objects.map((o) => (
          <button
            key={o.id}
            className={`hotspot ${seen.has(o.id) ? 'hotspot--seen' : ''}`}
            style={{ left: `${o.x}%`, top: `${o.y}%` }}
            onClick={() => {
              doorOpen()
              setActive(o)
              setSeen((s) => new Set(s).add(o.id))
            }}
          >
            <span className="hotspot__dot">{o.emoji}</span>
            <span className="hotspot__label">{o.label}</span>
          </button>
        ))}

        {active && (
          <div className="room__memory" onClick={() => setActive(null)}>
            <div
              className="narration room__memory-card"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 520 }}
            >
              {active.memory.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button className="btn" onClick={() => setActive(null)}>
                  close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="room__done">
        <span className="room__progress">
          {seen.size} / {objects.length} explored
        </span>
        <button
          className={`btn ${allSeen ? 'btn--primary' : ''}`}
          onClick={() => setFinishing(true)}
        >
          {allSeen ? 'Leave the room →' : 'Move on →'}
        </button>
      </div>
    </div>
  )
}
