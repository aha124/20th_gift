import { useEffect, useRef, useState } from 'react'
import NarrationCard from './NarrationCard'
import Burst from './Burst'
import { snap, chime, victory, tick as tickSound, sunriseSting } from '../audio/sound'
import './CarPackGame.css'

interface Props {
  intro: string
  retryLine: string
  after: string[]
  onNext: () => void
}

const COLS = 5
const ROWS = 4
const CELL = 48

interface Piece {
  id: string
  w: number
  h: number
  emoji: string
  label: string
  color: string
  pos: { r: number; c: number } | null
}

// Exact fit: 4+4+4+4+3+1 = 20 cells on the 5x4 grid. No rotation, no slack.
// One valid packing (of several): guitar column c0; suitcase r0c1; fridge r0c3;
// duffel r2c1; boxes r3c1; laundry r3c4.
const PIECES: Piece[] = [
  { id: 'guitar', w: 1, h: 4, emoji: '🎸', label: 'guitar', color: '#8d5a2b', pos: null },
  { id: 'suitcase', w: 2, h: 2, emoji: '🧳', label: 'suitcase', color: '#3d6ea5', pos: null },
  { id: 'fridge', w: 2, h: 2, emoji: '🧊', label: 'mini-fridge', color: '#5a8f9a', pos: null },
  { id: 'duffel', w: 4, h: 1, emoji: '🎒', label: 'duffel', color: '#9a5a5a', pos: null },
  { id: 'boxes', w: 3, h: 1, emoji: '📦', label: 'boxes', color: '#a5843d', pos: null },
  { id: 'pillow', w: 1, h: 1, emoji: '🧺', label: 'laundry', color: '#7a6a9a', pos: null },
]

const DAWN_MS = 90000

function occupied(list: Piece[], excludeId: string) {
  const grid = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false))
  for (const p of list) {
    if (!p.pos || p.id === excludeId) continue
    for (let r = 0; r < p.h; r++)
      for (let c = 0; c < p.w; c++) grid[p.pos.r + r][p.pos.c + c] = true
  }
  return grid
}

function canPlace(list: Piece[], p: Piece, r: number, c: number) {
  if (r < 0 || c < 0 || r + p.h > ROWS || c + p.w > COLS) return false
  const grid = occupied(list, p.id)
  for (let dr = 0; dr < p.h; dr++)
    for (let dc = 0; dc < p.w; dc++) if (grid[r + dr][c + dc]) return false
  return true
}

export default function CarPackGame({ intro, retryLine, after, onNext }: Props) {
  const [pieces, setPieces] = useState<Piece[]>(PIECES)
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; x: number; y: number } | null>(null)
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)
  const [dawnLeft, setDawnLeft] = useState(DAWN_MS)
  const [burstKey, setBurstKey] = useState(0)
  const expired = useRef(false)
  const solved = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // The dawn clock starts on the first grab, not while reading the intro.
  useEffect(() => {
    if (!started || done) return
    const id = setInterval(() => {
      setDawnLeft((t) => {
        if (expired.current || solved.current) return t
        const next = Math.max(0, t - 250)
        if (next <= 10000 && Math.floor(next / 1000) !== Math.floor(t / 1000)) tickSound()
        if (next === 0 && !expired.current) {
          expired.current = true
          sunriseSting()
        }
        return next
      })
    }, 250)
    return () => clearInterval(id)
  }, [started, done])

  if (done) {
    return <NarrationCard lines={after} onNext={onNext} />
  }

  function retry() {
    expired.current = false
    setPieces(PIECES)
    setDrag(null)
    setDawnLeft(DAWN_MS)
    setStarted(false)
  }

  function targetCell(clientX: number, clientY: number, dx: number, dy: number) {
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return null
    const c = Math.round((clientX - dx - rect.left) / CELL)
    const r = Math.round((clientY - dy - rect.top) / CELL)
    return { r, c }
  }

  function startDrag(p: Piece, e: React.PointerEvent) {
    if (expired.current) return
    if (!started) setStarted(true)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const dx = e.clientX - rect.left
    const dy = e.clientY - rect.top
    setDrag({ id: p.id, dx, dy, x: e.clientX, y: e.clientY })

    // Attach the move/up listeners immediately, so even the first drag is caught.
    const onMove = (ev: PointerEvent) =>
      setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d))
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      finishDrop(p.id, dx, dy, ev.clientX, ev.clientY)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function finishDrop(id: string, dx: number, dy: number, cx: number, cy: number) {
    if (expired.current) {
      setDrag(null)
      return
    }
    const cell = targetCell(cx, cy, dx, dy)
    setPieces((list) => {
      const p = list.find((x) => x.id === id)!
      if (cell && canPlace(list, p, cell.r, cell.c)) {
        snap()
        const next = list.map((x) => (x.id === id ? { ...x, pos: { r: cell.r, c: cell.c } } : x))
        if (next.every((x) => x.pos)) {
          solved.current = true
          chime()
          victory()
          setBurstKey((k) => k + 1)
          window.setTimeout(() => setDone(true), 1000)
        }
        return next
      }
      return list
    })
    setDrag(null)
  }

  const dragPiece = drag ? pieces.find((p) => p.id === drag.id) ?? null : null
  const preview = drag && dragPiece ? targetCell(drag.x, drag.y, drag.dx, drag.dy) : null
  const previewOk = preview && dragPiece ? canPlace(pieces, dragPiece, preview.r, preview.c) : false
  const placed = pieces.filter((p) => p.pos && p.id !== drag?.id)

  const secs = Math.ceil(dawnLeft / 1000)
  const urgent = started && dawnLeft <= 10000

  return (
    <div className="scene carpack fade-in">
      <div className="carpack__intro">{intro}</div>

      <div className={`carpack__dawn ${urgent ? 'carpack__dawn--urgent' : ''}`}>
        🌅 {started ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} until sunrise` : 'the clock starts when you grab the first thing'}
      </div>

      <div className={`carpack__car ${urgent ? 'carpack__car--dawn' : ''}`}>
        <div className="carpack__label">the Toyota — pack it all in</div>
        <div
          className="carpack__grid"
          ref={gridRef}
          style={{ width: COLS * CELL, height: ROWS * CELL }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => (
            <div key={i} className="carpack__cell" />
          ))}

          {preview && dragPiece && (
            <div
              className={`carpack__preview ${previewOk ? 'ok' : 'bad'}`}
              style={{
                left: preview.c * CELL,
                top: preview.r * CELL,
                width: dragPiece.w * CELL,
                height: dragPiece.h * CELL,
              }}
            />
          )}

          {placed.map((p) => (
            <div
              key={p.id}
              className="carpack__piece placed"
              style={{
                left: p.pos!.c * CELL,
                top: p.pos!.r * CELL,
                width: p.w * CELL,
                height: p.h * CELL,
                background: p.color,
              }}
              onPointerDown={(e) => startDrag(p, e)}
            >
              <span>{p.emoji}</span>
            </div>
          ))}
          {burstKey > 0 && <Burst key={burstKey} />}
        </div>
      </div>

      {expired.current && (
        <div className="carpack__sunrise">
          <div className="carpack__sunrise-card">
            <div className="carpack__sunrise-emoji">🌅</div>
            <p>{retryLine}</p>
            <button className="btn btn--primary" onClick={retry}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Every slot stays in the tray at all times (placed/dragging show as an
          empty outline) so the layout never reflows and the grid never shifts. */}
      <div className="carpack__tray">
        {pieces.map((p) => {
          const parked = p.pos !== null || p.id === drag?.id
          if (parked) {
            return (
              <div
                key={p.id}
                className="carpack__slot"
                style={{ width: p.w * CELL, height: p.h * CELL }}
              />
            )
          }
          return (
            <div
              key={p.id}
              className="carpack__piece tray"
              style={{ width: p.w * CELL, height: p.h * CELL, background: p.color }}
              onPointerDown={(e) => startDrag(p, e)}
            >
              <span>{p.emoji}</span>
              <span className="carpack__piece-label">{p.label}</span>
            </div>
          )
        })}
      </div>

      <button className="btn carpack__skip" onClick={onNext}>
        Skip →
      </button>

      {drag && dragPiece && (
        <div
          className="carpack__ghost"
          style={{
            left: drag.x - drag.dx,
            top: drag.y - drag.dy,
            width: dragPiece.w * CELL,
            height: dragPiece.h * CELL,
            background: dragPiece.color,
          }}
        >
          <span>{dragPiece.emoji}</span>
        </div>
      )}
    </div>
  )
}
