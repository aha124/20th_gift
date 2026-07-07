import { useCallback, useEffect, useMemo, useState } from 'react'
import { story } from '../content/story'
import type { Beat } from './types'
import { isMuted, setMuted } from '../audio/sound'
import { SAVE_KEY, resetAll } from './storage'

import TitleCard from '../components/TitleCard'
import NarrationCard from '../components/NarrationCard'
import DialogueScene from '../components/DialogueScene'
import CdSwerve from '../components/CdSwerve'
import AimWindow from '../components/AimWindow'
import NokiaPhone from '../components/NokiaPhone'
import HypnosisGame from '../components/HypnosisGame'
import PointClickRoom from '../components/PointClickRoom'
import PhotoReveal from '../components/PhotoReveal'
import CodaScreen from '../components/CodaScreen'
import IfcDateGame from '../components/IfcDateGame'
import StayStillGame from '../components/StayStillGame'
import StairwellGame from '../components/StairwellGame'
import DishesGame from '../components/DishesGame'
import BalconyScene from '../components/BalconyScene'
import CarPackGame from '../components/CarPackGame'
import './StoryMachine.css'

interface Save {
  chapterIdx: number
  beatIdx: number
  bonusUnlocked: boolean
  phase: 'playing' | 'ended'
  playingBonus: boolean
}

const mainChapters = story.chapters.filter((c) => !c.bonus)
const bonusChapter = story.chapters.find((c) => c.bonus)

function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Save
  } catch {
    return null
  }
}

export default function StoryMachine() {
  const initial = loadSave()
  const [chapterIdx, setChapterIdx] = useState(initial?.chapterIdx ?? 0)
  const [beatIdx, setBeatIdx] = useState(initial?.beatIdx ?? 0)
  const [phase, setPhase] = useState<'playing' | 'ended'>(initial?.phase ?? 'playing')
  const [playingBonus, setPlayingBonus] = useState(initial?.playingBonus ?? false)
  const [bonusUnlocked, setBonusUnlocked] = useState(initial?.bonusUnlocked ?? false)
  const [muted, setMutedState] = useState(isMuted())
  const [confirmReset, setConfirmReset] = useState(false)

  const chapter = playingBonus ? bonusChapter! : mainChapters[chapterIdx]
  const beat: Beat | undefined = chapter?.beats[beatIdx]

  // Persist on every meaningful change.
  useEffect(() => {
    const save: Save = { chapterIdx, beatIdx, bonusUnlocked, phase, playingBonus }
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    } catch {
      /* storage may be unavailable; the story still runs */
    }
  }, [chapterIdx, beatIdx, bonusUnlocked, phase, playingBonus])

  const advance = useCallback(() => {
    const beats = chapter.beats
    if (beatIdx + 1 < beats.length) {
      setBeatIdx(beatIdx + 1)
      return
    }
    // End of chapter.
    if (playingBonus) {
      setPlayingBonus(false)
      setPhase('ended')
      return
    }
    if (chapterIdx + 1 < mainChapters.length) {
      setChapterIdx(chapterIdx + 1)
      setBeatIdx(0)
      return
    }
    // Finished the coda (last main chapter): unlock the bonus, land on the end.
    setBonusUnlocked(true)
    setPhase('ended')
  }, [chapter, beatIdx, chapterIdx, playingBonus])

  function startBonus() {
    setPlayingBonus(true)
    setBeatIdx(0)
    setPhase('playing')
  }

  function startOver() {
    setChapterIdx(0)
    setBeatIdx(0)
    setPlayingBonus(false)
    setPhase('playing')
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  // A full restart: wipe the save and reload so the old computer boots again.
  function hardReset() {
    resetAll()
    window.location.reload()
  }

  const label = useMemo(() => {
    if (phase === 'ended') return 'Harborview'
    const num = chapter.number === 'bonus' ? 'Bonus' : `Ch. ${chapter.number}`
    return `${num} — ${chapter.title}`
  }, [phase, chapter])

  return (
    <div className="sm">
      <div className="sm__bar">
        <span className="sm__dotgrid">▚</span>
        <span className="sm__label">{label}</span>
        <span className="sm__spacer" />
        <button className="sm__icon" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button className="sm__icon" onClick={() => setConfirmReset(true)} title="Start over">
          ↺
        </button>
      </div>

      {confirmReset && (
        <div className="sm__confirm-back" onClick={() => setConfirmReset(false)}>
          <div className="win sm__confirm" onClick={(e) => e.stopPropagation()}>
            <div className="win__title">
              <span className="dot" />
              Start over?
            </div>
            <div className="sm__confirm-body">
              <p>This clears your saved place and boots the old computer from the very beginning.</p>
              <div className="sm__confirm-btns">
                <button className="btn btn--primary" onClick={hardReset}>
                  Start from the boot screen
                </button>
                <button className="btn" onClick={() => setConfirmReset(false)}>
                  Keep my place
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sm__stage">
        {phase === 'ended' ? (
          <EndCard
            bonusUnlocked={bonusUnlocked}
            onBonus={startBonus}
            onRestart={startOver}
          />
        ) : (
          <BeatView
            key={`${playingBonus ? 'bonus' : chapterIdx}-${beatIdx}`}
            beat={beat!}
            onNext={advance}
          />
        )}
      </div>
    </div>
  )
}

function BeatView({ beat, onNext }: { beat: Beat; onNext: () => void }) {
  // Key forces a fresh mount per beat so typewriters and timers reset cleanly.
  switch (beat.kind) {
    case 'title':
      return <TitleCard title={beat.title} subtitle={beat.subtitle} onNext={onNext} />
    case 'narration':
      return <NarrationCard lines={beat.lines} onNext={onNext} />
    case 'dialogue':
      return (
        <DialogueScene
          prompt={beat.prompt}
          choices={beat.choices}
          after={beat.after}
          onNext={onNext}
        />
      )
    case 'interaction':
      return <CdSwerve lines={beat.lines} after={beat.after} onNext={onNext} />
    case 'aim':
      return <AimWindow script={beat.script} buddyAway={beat.buddyAway} onDone={onNext} />
    case 'nokia':
      return <NokiaPhone target={beat.target} prompt={beat.prompt} onDone={onNext} />
    case 'hypnosis':
      return (
        <HypnosisGame
          intro={beat.intro}
          commands={beat.commands}
          after={beat.after}
          onNext={onNext}
        />
      )
    case 'pointclick':
      return (
        <PointClickRoom
          intro={beat.intro}
          objects={beat.objects}
          outro={beat.outro}
          onNext={onNext}
        />
      )
    case 'photo':
      return (
        <PhotoReveal
          src={beat.src}
          caption={beat.caption}
          fallbackNote={beat.fallbackNote}
          onNext={onNext}
        />
      )
    case 'coda':
      return <CodaScreen script={beat.script} onDone={onNext} />
    case 'ifcdate':
      return <IfcDateGame after={beat.after} onNext={onNext} />
    case 'staystill':
      return <StayStillGame intro={beat.intro} after={beat.after} onNext={onNext} />
    case 'stairwell':
      return <StairwellGame intro={beat.intro} after={beat.after} onNext={onNext} />
    case 'dishes':
      return <DishesGame intro={beat.intro} after={beat.after} onNext={onNext} />
    case 'carpack':
      return <CarPackGame intro={beat.intro} after={beat.after} onNext={onNext} />
    case 'balcony':
      return (
        <BalconyScene
          intro={beat.intro}
          setup={beat.setup}
          prompt={beat.prompt}
          choices={beat.choices}
          after={beat.after}
          onNext={onNext}
        />
      )
    default:
      return null
  }
}

function EndCard({
  bonusUnlocked,
  onBonus,
  onRestart,
}: {
  bonusUnlocked: boolean
  onBonus: () => void
  onRestart: () => void
}) {
  return (
    <div className="scene fade-in" style={{ textAlign: 'center' }}>
      <div className="title-card__kicker">Harborview</div>
      <div className="title-card__name" style={{ fontSize: 'clamp(28px, 6vw, 46px)' }}>
        Still yours.
      </div>
      <p style={{ color: '#c9d5e8', maxWidth: 420, fontFamily: 'var(--serif)', lineHeight: 1.6 }}>
        Twenty years. Happy anniversary.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {bonusUnlocked && (
          <button className="btn btn--primary" onClick={onBonus}>
            Bonus: Thieves in the Night →
          </button>
        )}
        <button className="btn" onClick={onRestart}>
          Start from the ditch
        </button>
      </div>
    </div>
  )
}
