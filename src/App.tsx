import { useState } from 'react'
import BootScreen from './components/BootScreen'
import StoryMachine from './engine/StoryMachine'

const BOOTED_KEY = 'harborview.booted.v1'

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
