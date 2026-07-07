import { useState } from 'react'
import BootScreen from './components/BootScreen'
import StoryMachine from './engine/StoryMachine'
import { BOOTED_KEY, resetAll } from './engine/storage'

// Visiting the app with ?reset (e.g. .../?reset) wipes all saved progress.
// Handy as an escape hatch on a tablet where there's no console.
if (typeof window !== 'undefined' && /[?&#]reset\b/.test(window.location.search + window.location.hash)) {
  resetAll()
  // Drop the param so a refresh doesn't keep resetting.
  window.history.replaceState(null, '', window.location.pathname)
}

export default function App() {
  // If she's already booted and started before, skip straight back in.
  const [booted, setBooted] = useState(() => {
    try {
      return localStorage.getItem(BOOTED_KEY) === '1'
    } catch {
      return false
    }
  })

  function onBooted() {
    try {
      localStorage.setItem(BOOTED_KEY, '1')
    } catch {
      /* ignore */
    }
    setBooted(true)
  }

  return (
    <div className="desktop">
      <div className="stage">
        {booted ? <StoryMachine /> : <BootScreen onComplete={onBooted} />}
      </div>
    </div>
  )
}
