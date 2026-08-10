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

/** One scattered item in the put-the-room-back game. Positions are % of the room. */
export interface RoomFixItem {
  id: string
  label: string
  emoji: string
  /** Where it belongs. */
  home: { x: number; y: number }
  /** Where the rearranging disaster left it (rot in degrees). */
  start: { x: number; y: number; rot: number }
  /** The bed frame renders larger. */
  big?: boolean
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
  | {
      kind: 'hypnosis'
      intro: string
      /** Taunts the mentalist cycles through while the spiral spins. */
      commands: string[]
      /** Interstitial lines shown between the three rounds. */
      roundLines: string[]
      /** Narration once she resists (or mostly resists). */
      after: string[]
    }
  | { kind: 'pointclick'; intro: string; objects: RoomObject[]; outro: string[] }
  | { kind: 'photo'; src?: string; srcName?: string; caption: string; fallbackNote: string }
  | { kind: 'coda'; script: AimStep[] }
  // Chapter 6: the whole IFC date, start to finish.
  | { kind: 'ifcdate'; after: string[] }
  // Chapter 7: hold still so Pappy doesn't catch you awake.
  | { kind: 'staystill'; intro: string; after: string[] }
  // Chapter 7: sneak two of you down the stairwell past his friends.
  | { kind: 'stairwell'; intro: string; after: string[] }
  // Chapter 8: the Sonestown dish pit (with a French onion soup Easter egg).
  | { kind: 'dishes'; intro: string; after: string[] }
  // Bonus: pack everything into the Toyota (exact-fit, no-rotation puzzle).
  | { kind: 'carpack'; intro: string; retryLine: string; after: string[] }
  // Chapter 5: put the room back exactly the way it was, before she's out of the shower.
  | {
      kind: 'roomfix'
      intro: string
      showerLine: string
      timeoutLine: string
      items: RoomFixItem[]
      after: string[]
    }
  // Chapter 9: the proposal, over a pixel-art porch at night.
  | {
      kind: 'balcony'
      intro: string[]
      setup: string[]
      prompt: string
      choices: DialogueChoice[]
      after: string[]
    }

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
