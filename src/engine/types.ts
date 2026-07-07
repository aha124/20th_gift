// The story is data. The engine renders it. Nothing in here imports React,
// so any line can be edited without touching logic.

/** One line inside an AIM conversation. */
export type AimStep =
  | { from: 'him' | 'her' | 'system'; text: string; delayMs?: number }
  | {
      type: 'playerInput'
      mode: 'freeform' | 'exact'
      placeholder?: string
      /** Only used when mode === 'exact'. Case-insensitive, trimmed. */
      expect?: string
      /** Shown as a gentle nudge if she is stuck on an exact line. */
      hint?: string
    }

/** A single choice in a dialogue beat. Every choice is warm; none is wrong. */
export interface DialogueChoice {
  text: string
  reply: string[]
}

/** A clickable object in the point-and-click dorm room. */
export interface RoomObject {
  id: string
  label: string
  /** Position as a percentage of the room, so it scales on any screen. */
  x: number
  y: number
  emoji: string
  memory: string[]
}

/** The atomic unit the engine steps through. */
export type Beat =
  | { kind: 'title'; title: string; subtitle?: string }
  | { kind: 'narration'; lines: string[] }
  | { kind: 'interaction'; variant: 'cd-swerve'; lines: string[]; after: string[] }
  | { kind: 'aim'; buddyAway?: string; script: AimStep[] }
  | { kind: 'dialogue'; prompt: string; choices: DialogueChoice[]; after?: string[] }
  | {
      kind: 'nokia'
      target: string
      prompt: string
      /** A short line shown after she finishes tapping it out. */
      after: string[]
    }
  | { kind: 'pointclick'; intro: string; objects: RoomObject[]; outro: string[] }
  | { kind: 'photo'; src?: string; caption: string; fallbackNote: string }
  | { kind: 'coda'; script: AimStep[] }

export interface Chapter {
  id: string
  number: number | 'bonus'
  title: string
  /** Chapters flagged bonus are hidden until the coda unlocks them. */
  bonus?: boolean
  beats: Beat[]
}

export interface Story {
  chapters: Chapter[]
}
