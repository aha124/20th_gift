# Audio

Every sound the game makes is **synthesized live** with the Web Audio API in
`sound.ts` — the AIM door open/close, the message dings, the Nokia key tones,
and even an evocation of the 56k dial-up handshake. Nothing copyrighted ships
in this repo.

## Want the real dial-up recording?

`playDialup()` in `sound.ts` currently synthesizes the handshake. If you'd
rather use the real thing, source a clip released under a **public-domain or
permissive license** (do not rip one), drop it here as `dialup.mp3`, and swap
`playDialup()` to play it:

```ts
import dialup from './dialup.mp3'
export function playDialup() {
  const a = new Audio(dialup)
  a.play()
  return () => { a.pause() }
}
```

## Music (please read)

Do **not** add the Guns N' Roses (Chapter 4) or Guster (Chapter 7) recordings
to this repo, and do not paste their lyrics into `story.ts`. The songs are
referenced by name and mood only. If you want the actual tracks for what is a
private gift, add your own local audio files and keep this a personal,
non-distributed thing.
