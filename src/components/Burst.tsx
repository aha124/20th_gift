import { useMemo } from 'react'
import './Burst.css'

/**
 * A small CSS-only particle burst. Mount it (keyed) over a success moment and
 * it fires once and fades. pointer-events: none, so it never blocks input.
 */
export default function Burst({ count = 10 }: { count?: number }) {
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
        const dist = 34 + Math.random() * 30
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          hue: 30 + Math.random() * 300,
          delay: Math.random() * 0.08,
        }
      }),
    [count],
  )

  return (
    <div className="burst" aria-hidden>
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            ['--dx' as string]: `${p.dx}px`,
            ['--dy' as string]: `${p.dy}px`,
            ['--hue' as string]: `${p.hue}`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
