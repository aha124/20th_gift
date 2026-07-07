import { useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import { scrubTick, splash, chime } from '../audio/sound'
import './DishesGame.css'

interface Props {
  intro: string
  after: string[]
  onNext: () => void
}

interface Dish {
  id: number
  emoji: string
  soup?: boolean
}

const START: Dish[] = [
  { id: 1, emoji: '🍽️' },
  { id: 2, emoji: '🥛' },
  { id: 3, emoji: '🍲', soup: true },
  { id: 4, emoji: '🍴' },
  { id: 5, emoji: '☕' },
  { id: 6, emoji: '🥣', soup: true },
  { id: 7, emoji: '🍽️' },
  { id: 8, emoji: '🥂' },
]

// How much scrubbing (in accumulated drag pixels) a dish needs.
const CLEAN = 220
const SOUP_CLEAN = 460

/** The Sonestown dish pit. Hold and scrub each dish clean by moving it around. */
export default function DishesGame({ intro, after, onNext }: Props) {
  const [dishes, setDishes] = useState<Dish[]>(START)
  const [scrub, setScrub] = useState<Record<number, number>>({})
  const [activeId, setActiveId] = useState<number | null>(null)
  const [soupTarget, setSoupTarget] = useState<Dish | null>(null)
  const [toast, setToast] = useState('')
  const [hidden, setHidden] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const tickAcc = useRef(0)

  if (finishing) {
    const lines = [...after]
    if (hidden > 0) {
      lines.unshift(
        `You “washed” ${hidden} bowl${hidden > 1 ? 's' : ''} of French onion soup by burying ${hidden > 1 ? 'them' : 'it'} under the pile. Nobody ever found out. Until now.`,
      )
    }
    return <NarrationCard lines={lines} onNext={onNext} />
  }

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 1500)
  }

  function remove(id: number) {
    setDishes((list) => {
      const next = list.filter((x) => x.id !== id)
      if (next.length === 0) window.setTimeout(() => setFinishing(true), 500)
      return next
    })
  }

  function start(d: Dish, e: React.PointerEvent) {
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    setActiveId(d.id)
    last.current = { x: e.clientX, y: e.clientY }
  }

  function move(e: React.PointerEvent) {
    if (activeId == null || !last.current) return
    const dx = e.clientX - last.current.x
    const dy = e.clientY - last.current.y
    const dist = Math.hypot(dx, dy)
    last.current = { x: e.clientX, y: e.clientY }
    if (dist < 0.5) return

    const dish = dishes.find((x) => x.id === activeId)
    if (!dish) return
    const need = dish.soup ? SOUP_CLEAN : CLEAN

    tickAcc.current += dist
    if (tickAcc.current > 26) {
      tickAcc.current = 0
      scrubTick()
    }

    setScrub((s) => {
      const val = (s[activeId] ?? 0) + dist
      if (val >= need) {
        splash()
        remove(activeId)
        setActiveId(null)
        last.current = null
        return { ...s, [activeId]: need }
      }
      return { ...s, [activeId]: val }
    })
  }

  function end() {
    setActiveId(null)
    last.current = null
  }

  return (
    <div className="scene dishes fade-in">
      <div className="dishes__intro">{intro}</div>

      <div
        className="dishes__sink"
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      >
        <div className="dishes__rack">
          {dishes.map((d) => {
            const need = d.soup ? SOUP_CLEAN : CLEAN
            const pct = Math.min(100, ((scrub[d.id] ?? 0) / need) * 100)
            const active = activeId === d.id
            return (
              <div
                key={d.id}
                className={`dishes__dish ${d.soup ? 'dishes__dish--soup' : ''} ${active ? 'scrubbing' : ''}`}
                onPointerDown={(e) => start(d, e)}
                title={d.soup ? 'French onion soup — scrub hard, or…' : 'hold and scrub'}
              >
                <span className="dishes__emoji">{d.emoji}</span>
                {active && <span className="dishes__suds">🫧</span>}
                <span className="dishes__bar">
                  <span className="dishes__bar-fill" style={{ width: `${pct}%` }} />
                </span>
                {d.soup && (
                  <button
                    className="dishes__hide"
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setSoupTarget(d)
                    }}
                    title="hide it"
                  >
                    🤫
                  </button>
                )}
              </div>
            )
          })}
          {dishes.length === 0 && <div className="dishes__empty">✨ spotless ✨</div>}
        </div>
        <div className="dishes__water" />
      </div>

      <div className="dishes__count">
        {dishes.length} left · hold a dish and scrub it around to clean it
      </div>
      {toast && <div className="dishes__toast">{toast}</div>}

      {soupTarget && (
        <div className="dishes__modal-back" onClick={() => setSoupTarget(null)}>
          <div className="win dishes__modal" onClick={(e) => e.stopPropagation()}>
            <div className="win__title">
              <span className="dot" />
              French onion soup
            </div>
            <div className="dishes__modal-body">
              <p>Baked-on cheese, welded to the crock. This will take forever to scrub.</p>
              <div className="dishes__modal-btns">
                <button className="btn" onClick={() => setSoupTarget(null)}>
                  😤 Fine, I’ll scrub it
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    chime()
                    setHidden((n) => n + 1)
                    remove(soupTarget.id)
                    setSoupTarget(null)
                    flash('🤫 hidden under the pile. nobody will ever know.')
                  }}
                >
                  🤫 Hide it under the others
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
