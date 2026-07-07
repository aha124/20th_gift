import { useState } from 'react'
import NarrationCard from './NarrationCard'
import { keyTone, chime } from '../audio/sound'
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

/** The Sonestown dish pit. Tap to wash — but the French onion crocks can hide. */
export default function DishesGame({ intro, after, onNext }: Props) {
  const [dishes, setDishes] = useState<Dish[]>(START)
  const [soupTarget, setSoupTarget] = useState<Dish | null>(null)
  const [toast, setToast] = useState('')
  const [hidden, setHidden] = useState(0)
  const [finishing, setFinishing] = useState(false)

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
    window.setTimeout(() => setToast(''), 1400)
  }

  function wash(d: Dish) {
    if (d.soup) {
      setSoupTarget(d)
      return
    }
    keyTone(2)
    remove(d.id)
  }

  function remove(id: number) {
    setDishes((list) => {
      const next = list.filter((x) => x.id !== id)
      if (next.length === 0) window.setTimeout(() => setFinishing(true), 500)
      return next
    })
  }

  return (
    <div className="scene dishes fade-in">
      <div className="dishes__intro">{intro}</div>

      <div className="dishes__sink">
        <div className="dishes__rack">
          {dishes.map((d) => (
            <button
              key={d.id}
              className={`dishes__dish ${d.soup ? 'dishes__dish--soup' : ''}`}
              onClick={() => wash(d)}
              title={d.soup ? 'French onion soup…' : 'wash'}
            >
              {d.emoji}
            </button>
          ))}
          {dishes.length === 0 && <div className="dishes__empty">✨ spotless ✨</div>}
        </div>
        <div className="dishes__water" />
      </div>

      <div className="dishes__count">{dishes.length} left in the rack</div>
      {toast && <div className="dishes__toast">{toast}</div>}

      {soupTarget && (
        <div className="dishes__modal-back" onClick={() => setSoupTarget(null)}>
          <div className="win dishes__modal" onClick={(e) => e.stopPropagation()}>
            <div className="win__title">
              <span className="dot" />
              French onion soup
            </div>
            <div className="dishes__modal-body">
              <p>Baked-on cheese. Welded to the crock. This will take twenty minutes to scrub.</p>
              <div className="dishes__modal-btns">
                <button
                  className="btn"
                  onClick={() => {
                    keyTone(5)
                    remove(soupTarget.id)
                    setSoupTarget(null)
                    flash('scrubbed. your hands smell like onions now.')
                  }}
                >
                  😤 Wash it (20 min)
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
