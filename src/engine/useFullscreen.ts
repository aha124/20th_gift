import { useCallback, useEffect, useState } from 'react'

// Safari still uses the prefixed names; iPad supports them, iPhone does not.
type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}
type FsDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

function activeEl(): Element | null {
  const d = document as FsDocument
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null
}

/**
 * Fullscreen toggle with Safari fallbacks. `supported` is false on browsers
 * that cannot do it at all (notably iPhone Safari), so the button can hide
 * rather than sit there doing nothing.
 */
export function useFullscreen() {
  const [isFull, setIsFull] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    const el = document.documentElement as FsElement
    setSupported(
      typeof el.requestFullscreen === 'function' ||
        typeof el.webkitRequestFullscreen === 'function',
    )
    const onChange = () => setIsFull(Boolean(activeEl()))
    onChange()
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const toggle = useCallback(() => {
    const el = document.documentElement as FsElement
    const d = document as FsDocument
    if (activeEl()) {
      if (typeof document.exitFullscreen === 'function') void document.exitFullscreen().catch(() => {})
      else d.webkitExitFullscreen?.()
    } else if (typeof el.requestFullscreen === 'function') {
      void el.requestFullscreen().catch(() => {})
    } else {
      el.webkitRequestFullscreen?.()
    }
  }, [])

  return { isFull, supported, toggle }
}
