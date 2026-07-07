import { useState } from 'react'
import { chime } from '../audio/sound'
import './scenes.css'

interface Props {
  src?: string
  caption: string
  fallbackNote: string
  onNext: () => void
}

/**
 * A photo in a little frame. Until Anthony drops a real image in, it shows a
 * gentle placeholder so the flow still works.
 */
export default function PhotoReveal({ src, caption, fallbackNote, onNext }: Props) {
  const [revealed, setRevealed] = useState(false)

  if (!revealed) {
    return (
      <div className="scene fade-in">
        <div className="tap-hint" style={{ fontSize: 14 }}>
          {caption}
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            chime()
            setRevealed(true)
          }}
        >
          Reveal the photo
        </button>
      </div>
    )
  }

  return (
    <div className="scene photo fade-in">
      <div className="photo__frame">
        {src ? (
          <img className="photo__img" src={src} alt={caption} />
        ) : (
          <div className="photo__placeholder">
            <div>
              <div style={{ fontSize: 30, marginBottom: 8 }}>🖼️</div>
              {fallbackNote}
            </div>
          </div>
        )}
        <div className="photo__caption">{caption}</div>
      </div>
      <button className="btn" onClick={onNext}>
        Continue →
      </button>
    </div>
  )
}
