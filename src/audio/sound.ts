// Sounds are synthesized with the Web Audio API, except where a real,
// permissively-licensed recording exists in this folder — see clips.ts. The
// dial-up handshake is a genuine CC0 recording; everything else falls back to
// synthesis unless you drop a file in to override it.

import { resolveClip } from './clips'

let ctx: AudioContext | null = null
let muted = false

/** Play a real recording if that file exists. Returns null when it doesn't. */
function playClip(name: string, volume = 0.7): HTMLAudioElement | null {
  if (muted) return null
  const src = resolveClip(name)
  if (!src) return null
  const a = new Audio(src)
  a.volume = volume
  void a.play().catch(() => {
    /* autoplay blocked; the synthesized fallback already ran or will */
  })
  return a
}

function ac(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
  }
  return ctx
}

/** Browsers require a user gesture before audio can start. Call on first tap. */
export function unlockAudio() {
  const c = ac()
  if (c.state === 'suspended') void c.resume()
  // A silent blip primes the graph on iOS Safari.
  const g = c.createGain()
  g.gain.value = 0
  g.connect(c.destination)
  const o = c.createOscillator()
  o.connect(g)
  o.start()
  o.stop(c.currentTime + 0.01)
}

export function setMuted(m: boolean) {
  muted = m
}
export function isMuted() {
  return muted
}

function tone(
  freq: number,
  start: number,
  dur: number,
  {
    type = 'sine',
    gain = 0.2,
    to = 0,
  }: { type?: OscillatorType; gain?: number; to?: number } = {},
) {
  if (muted) return
  const c = ac()
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime + start)
  if (to) o.frequency.exponentialRampToValueAtTime(to, c.currentTime + start + dur)
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur + 0.02)
}

function noiseBurst(start: number, dur: number, gain = 0.08) {
  if (muted) return
  const c = ac()
  const frames = Math.floor(c.sampleRate * dur)
  const buffer = c.createBuffer(1, frames, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * 0.9
  const src = c.createBufferSource()
  src.buffer = buffer
  const g = c.createGain()
  g.gain.setValueAtTime(gain, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1600
  src.connect(filter)
  filter.connect(g)
  g.connect(c.destination)
  src.start(c.currentTime + start)
  src.stop(c.currentTime + start + dur)
}

/** AIM door opening — a rising two-note swing (or dooropen.mp3 if present). */
export function doorOpen() {
  if (playClip('dooropen.mp3', 0.7)) return
  tone(523, 0, 0.12, { type: 'triangle', gain: 0.22 })
  tone(784, 0.09, 0.16, { type: 'triangle', gain: 0.2 })
}

/** AIM door closing — a falling pair (or doorclose.mp3 if present). */
export function doorClose() {
  if (playClip('doorclose.mp3', 0.7)) return
  tone(659, 0, 0.12, { type: 'triangle', gain: 0.2 })
  tone(392, 0.09, 0.18, { type: 'triangle', gain: 0.2 })
}

/**
 * Signing on to AIM. Uses signon.mp3 when you drop one in; otherwise a
 * slightly grander version of the door swing.
 */
export function signOn() {
  if (playClip('signon.mp3', 0.75)) return
  tone(523, 0, 0.13, { type: 'triangle', gain: 0.22 })
  tone(784, 0.1, 0.15, { type: 'triangle', gain: 0.21 })
  tone(1046, 0.22, 0.3, { type: 'triangle', gain: 0.2 })
}

/** Incoming message ding (or receive.mp3 if present). */
export function receiveDing() {
  if (playClip('receive.mp3', 0.6)) return
  tone(880, 0, 0.09, { type: 'sine', gain: 0.18 })
  tone(1174, 0.06, 0.12, { type: 'sine', gain: 0.16 })
}

/** Outgoing message — a softer single ping. */
export function sendDing() {
  tone(1046, 0, 0.08, { type: 'sine', gain: 0.14 })
}

/** Nokia keypad tone. Slight per-key variation keeps it alive. */
export function keyTone(seed = 0) {
  const base = 720 + (seed % 4) * 40
  tone(base, 0, 0.05, { type: 'square', gain: 0.06 })
}

/** A soft confirmation chirp when a message is accepted. */
export function chime() {
  tone(659, 0, 0.14, { type: 'sine', gain: 0.16 })
  tone(988, 0.1, 0.22, { type: 'sine', gain: 0.16 })
}

/** A silly chicken squawk for the hypnotist game. */
export function cluck() {
  tone(520, 0, 0.07, { type: 'sawtooth', gain: 0.1, to: 760 })
  tone(680, 0.08, 0.06, { type: 'sawtooth', gain: 0.09, to: 440 })
  tone(600, 0.16, 0.05, { type: 'square', gain: 0.07 })
}

/** A low woozy tone while the spiral pulls at you. */
export function woozy() {
  tone(180, 0, 0.4, { type: 'sine', gain: 0.06, to: 120 })
}

/** A crunch/thud for the swerve into the ditch. */
export function crunch() {
  noiseBurst(0, 0.35, 0.16)
  tone(90, 0, 0.3, { type: 'square', gain: 0.14, to: 50 })
}

/** A soft, short scrub swish while washing a dish. */
export function scrubTick() {
  noiseBurst(0, 0.06, 0.05)
}

/** A little water splash when a dish comes clean. */
export function splash() {
  noiseBurst(0, 0.18, 0.09)
  tone(1200, 0.02, 0.12, { type: 'sine', gain: 0.1, to: 2000 })
}

/** A soft click when a puzzle piece snaps into place. */
export function snap() {
  tone(320, 0, 0.05, { type: 'square', gain: 0.09 })
  tone(520, 0.04, 0.06, { type: 'square', gain: 0.08 })
}

/** Low gravel rumble for drifting off the dirt road. */
export function gravel() {
  noiseBurst(0, 0.22, 0.07)
  tone(70, 0, 0.2, { type: 'square', gain: 0.08, to: 55 })
}

/** A clumsy stumble — wrong foot on the stairs. */
export function stumble() {
  tone(220, 0, 0.08, { type: 'square', gain: 0.1, to: 140 })
  tone(120, 0.09, 0.12, { type: 'square', gain: 0.09, to: 80 })
}

/** A tiny rising cue when an eye opens — the moment to act (or freeze). */
export function eyeCue() {
  tone(660, 0, 0.07, { type: 'sine', gain: 0.1 })
  tone(990, 0.06, 0.09, { type: 'sine', gain: 0.09 })
}

/** A dry clock tick for countdown pressure. */
export function tick() {
  tone(1100, 0, 0.03, { type: 'square', gain: 0.05 })
}

/** A flat denied buzz — you acted at the wrong moment. */
export function deniedBuzz() {
  tone(150, 0, 0.11, { type: 'square', gain: 0.08 })
}

/** A long low snore — the fake-out resolving back to sleep. */
export function snore() {
  tone(110, 0, 0.35, { type: 'sine', gain: 0.05, to: 85 })
}

/** Sunrise sting — time ran out (kept gentle, it's a comedy beat). */
export function sunriseSting() {
  tone(392, 0, 0.25, { type: 'triangle', gain: 0.14 })
  tone(494, 0.2, 0.25, { type: 'triangle', gain: 0.13 })
  tone(587, 0.4, 0.4, { type: 'triangle', gain: 0.12 })
}

/** A little victory jingle for finishing a game. */
export function victory() {
  tone(523, 0, 0.12, { type: 'triangle', gain: 0.16 })
  tone(659, 0.11, 0.12, { type: 'triangle', gain: 0.16 })
  tone(784, 0.22, 0.14, { type: 'triangle', gain: 0.16 })
  tone(1046, 0.36, 0.28, { type: 'triangle', gain: 0.18 })
}

/** How long the real recording runs, so the boot screen can match it. */
export const DIALUP_MS = resolveClip('dialup.mp3') ? 9800 : 6200

/**
 * The 56k handshake. Plays the genuine CC0 recording in src/audio/dialup.mp3
 * — dial tone, real touch-tones dialing out, the pause, the answer tone, the
 * screech — and falls back to the synthesized evocation if the file is gone
 * or the browser refuses to play it. Returns a stop() you can call to cut it.
 */
export function playDialup(): () => void {
  if (muted) return () => {}
  const src = resolveClip('dialup.mp3')
  if (src) {
    const a = new Audio(src)
    a.volume = 0.65
    let stopped = false
    let fallbackStop: (() => void) | null = null
    void a.play().catch(() => {
      // Playback refused (rare after unlockAudio) — use the synth instead.
      if (!stopped) fallbackStop = synthDialup()
    })
    return () => {
      stopped = true
      a.pause()
      a.currentTime = 0
      fallbackStop?.()
    }
  }
  return synthDialup()
}

/** The hand-built evocation, kept as a fallback. About 5.5 seconds. */
function synthDialup(): () => void {
  if (muted) return () => {}
  // DTMF-ish dialing
  const digits = [0.0, 0.18, 0.36, 0.54, 0.72, 0.9, 1.08]
  digits.forEach((t, i) => {
    tone(1209 + (i % 3) * 60, t, 0.1, { type: 'sine', gain: 0.12 })
    tone(697 + (i % 4) * 80, t, 0.1, { type: 'sine', gain: 0.12 })
  })
  // Ring
  tone(440, 1.5, 0.6, { type: 'sine', gain: 0.14 })
  tone(480, 1.5, 0.6, { type: 'sine', gain: 0.14 })
  // Carrier answer tone
  tone(2100, 2.4, 0.5, { type: 'sine', gain: 0.13 })
  tone(1750, 3.0, 0.7, { type: 'sine', gain: 0.12, to: 1200 })
  // The handshake screech: warbling tones over static
  for (let i = 0; i < 8; i++) {
    const t = 3.4 + i * 0.24
    tone(800 + Math.abs(((i * 137) % 700)), t, 0.2, { type: 'sawtooth', gain: 0.05 })
    noiseBurst(t, 0.24, 0.06)
  }
  noiseBurst(3.4, 2.0, 0.05)
  // Connection "settles"
  tone(1000, 5.4, 0.2, { type: 'sine', gain: 0.05, to: 300 })

  return () => {
    // Best-effort stop by muting briefly; new context isn't torn down.
    if (ctx) {
      const g = ctx.createGain()
      g.gain.value = 0
      g.connect(ctx.destination)
    }
  }
}
