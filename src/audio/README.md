# Audio

Most sounds are **synthesized live** with the Web Audio API in `sound.ts` — the
AIM door open/close, the message dings, the Nokia key tones, and the various
game cues. The one real recording is the dial-up handshake.

## What ships here

**`dialup.mp3`** — a genuine 56k dial-up connection: dial tone, real DTMF
touch-tones dialing out, the pause, the answer tone, the handshake screech.
About 9.5 seconds.

> Source: ["Dial up connection (short)"](https://commons.wikimedia.org/wiki/File:Dial_up_connection_(short).oga)
> via Wikimedia Commons, originally from [pdsounds.org](http://www.pdsounds.org/sounds/dial_up_connection).
> **Licensed CC0** (public domain dedication). Converted here to mono 22 kHz MP3
> to keep it small and playable on every browser.

Nothing copyrighted is committed to this repo.

## Dropping in your own recordings

`clips.ts` picks up **any** audio file in this folder by name, and a file that
exists automatically overrides the synthesized version of that sound. So if you
have the genuine AIM sounds from an old install, just drop them in — no code
changes needed:

| Filename | Replaces |
|---|---|
| `dialup.mp3` | the modem handshake (already shipped) |
| `signon.mp3` | the AIM sign-on when she clicks **Sign On** |
| `dooropen.mp3` | the buddy-arrives / window-open sound |
| `doorclose.mp3` | the window-close sound |
| `receive.mp3` | incoming instant message |
| `send.mp3` | outgoing instant message |

`.mp3`, `.ogg`, `.oga`, `.wav`, and `.m4a` all work (MP3 is the safest bet
across browsers). Keep them short. If a file is missing or a browser refuses to
play it, the synthesized version plays instead, so the gift never falls silent.

**A note on the AIM sounds:** those clips are AOL's copyrighted audio, so they
are deliberately not fetched or committed here. If you want them for what is a
private, personal gift, add your own local copies using the table above and keep
the project private.

## Music (please read)

Do **not** add the Guns N' Roses (Chapter 4) or Guster (Chapter 7) recordings
to this repo, and do not paste their lyrics into `story.ts`. The songs are
referenced by name and mood only. If you want the actual tracks for what is a
private gift, add your own local audio files and keep this a personal,
non-distributed thing.
