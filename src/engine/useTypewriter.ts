import { useEffect, useRef, useState } from 'react'

/**
 * Types an array of lines out one character at a time. Returns the visible
 * text, whether it's finished, and a skip() that jumps to the full text.
 */
export function useTypewriter(lines: string[], cps = 42) {
  const full = lines.join('\n')
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    setCount(0)
    setDone(false)
    const interval = 1000 / cps
    let last = performance.now()
    let acc = 0
    let i = 0

    const tick = (now: number) => {
      acc += now - last
      last = now
      while (acc >= interval && i < full.length) {
        i++
        acc -= interval
      }
      setCount(i)
      if (i >= full.length) {
        setDone(true)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [full, cps])

  function skip() {
    if (raf.current) cancelAnimationFrame(raf.current)
    setCount(full.length)
    setDone(true)
  }

  return { shown: full.slice(0, count), done, skip }
}
