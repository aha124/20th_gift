import { useEffect } from 'react'
import './scenes.css'

interface Props {
  title: string
  subtitle?: string
  onNext: () => void
}

/** Chapter title card. Auto-advances, but a tap moves on early. */
export default function TitleCard({ title, subtitle, onNext }: Props) {
  useEffect(() => {
    const t = setTimeout(onNext, 3200)
    return () => clearTimeout(t)
  }, [onNext])

  return (
    <div
      className="scene title-card fade-in"
      onClick={onNext}
      style={{ cursor: 'pointer' }}
    >
      <div className="title-card__kicker">{title}</div>
      {subtitle && <div className="title-card__name">{subtitle}</div>}
    </div>
  )
}
