import { useEffect, useRef, useState } from 'react'
import type { RoomFixItem } from '../engine/types'
import NarrationCard from './NarrationCard'
import Burst from './Burst'
import { snap, victory } from '../audio/sound'
import './RoomFixGame.css'

interface Props {
  intro: string
  showerLine: string
  timeoutLine: string
  items: RoomFixItem[]
  after: string[]
  onNext: () => void
}

interface Placed {
  x: number
  y: number
  rot: number
  placed: boolean
}

const SHOWER_MS = 50000
const SNAP_DIST = 9 // % of room width

/**
 * The rearranging disaster, played for real: every item is somewhere insane
 * (the bed frame is up against the wall) and she is in the shower. Drag each
 * thing back onto its ghost outline. The timer is pure flavor — the water
 * shutting off just means you work faster; you cannot fail.
 */
export default function RoomFixGame({ intro, showerLine, timeoutLine, items, after, onNext }: Props) {
  const [state, setState] = useState<Record<string, Placed>>(() =>
    Object.fromEntries(
      items.map((it) => [it.id, { x: it.start.x, y: it.start.y, rot: it.start.rot, placed: false }]),
    ),
  )
  const [dragId, setDragId] = useState<string | null>(null)
  const [showerLeft, setShowerLeft] = useState(SHOWER_MS)
  const [burstKey, setBurstKey] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  // The shower runs whether or not she hurries.
  useEffect(() => {
    if (finishing) return
    const id = setInterval(() => setShowerLeft((t) => Math.max(0, t - 250)), 250)
    return () => clearInterval(id)
  }, [finishing])

  if (finishing) {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  function toPct(clientX: number, clientY: number) {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      x: Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(8, Math.min(90, ((clientY - rect.top) / rect.height) * 100)),
    }
  }

  function startDrag(it: RoomFixItem, e: React.PointerEvent) {
    if (state[it.id].placed) return
    e.preventDefault()
    setDragId(it.id)

    const onMove = (ev: PointerEvent) => {
      const p = toPct(ev.clientX, ev.clientY)
      if (!p) return
      setState((s) => ({ ...s, [it.id]: { ...s[it.id], x: p.x, y: p.y } }))
    }
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setDragId(null)
      const p = toPct(ev.clientX, ev.clientY)
      if (!p) return
      const near = Math.hypot(p.x - it.home.x, p.y - it.home.y) < SNAP_DIST
      setState((s) => {
        const next = {
          ...s,
          [it.id]: near
            ? { x: it.home.x, y: it.home.y, rot: 0, placed: true }
            : { ...s[it.id], x: p.x, y: p.y },
        }
        if (near) {
          snap()
          setBurstKey((k) => k + 1)
          if (items.every((o) => next[o.id].placed)) {
            victory()
            window.setTimeout(() => setFinishing(true), 800)
          }
        }
        return next
      })
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const showerDone = showerLeft <= 0
  const placedCount = items.filter((it) => state[it.id].placed).length

  return (
    <div className="room roomfix fade-in">
      <div className="room__intro">{intro}</div>

      <div className={`roomfix__shower ${showerDone ? 'roomfix__shower--out' : ''}`}>
        <span>{showerDone ? timeoutLine : showerLine}</span>
        {!showerDone && (
          <span className="roomfix__shower-track">
            <span
              className="roomfix__shower-fill"
              style={{ width: `${(showerLeft / SHOWER_MS) * 100}%` }}
            />
          </span>
        )}
      </div>

      <div className="room__stage roomfix__stage" ref={stageRef}>
        <div className="room__floor" />

        {/* Ghost outlines for whatever is not back home yet */}
        {items.map(
          (it) =>
            !state[it.id].placed && (
              <div
                key={`ghost-${it.id}`}
                className={`roomfix__ghost ${it.big ? 'roomfix__ghost--big' : ''}`}
                style={{ left: `${it.home.x}%`, top: `${it.home.y}%` }}
              >
                <span>{it.emoji}</span>
              </div>
            ),
        )}

        {/* The items themselves */}
        {items.map((it) => {
          const st = state[it.id]
          return (
            <div
              key={it.id}
              className={`roomfix__item ${it.big ? 'roomfix__item--big' : ''} ${
                st.placed ? 'roomfix__item--placed' : ''
              } ${dragId === it.id ? 'roomfix__item--drag' : ''}`}
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                transform: `translate(-50%, -50%) rotate(${st.rot}deg)`,
              }}
              onPointerDown={(e) => startDrag(it, e)}
            >
              <span className="roomfix__emoji">{it.emoji}</span>
              {!st.placed && <span className="roomfix__label">{it.label}</span>}
            </div>
          )
        })}

        {burstKey > 0 && <Burst key={burstKey} />}
      </div>

      <div className="room__done">
        <span className="room__progress">
          {placedCount} / {items.length} back in place
        </span>
        <button className="btn" onClick={onNext}>
          Skip →
        </button>
      </div>
    </div>
  )
}
