# Harborview

A 20th anniversary gift for Ashley, told through the tech of 2004. You boot an
old computer, dial-up screams, an AIM buddy list appears, and you fall back
into the fall of 2004 at Wagner College — how the two of you met and married —
ending with one last instant message, twenty years later.

Built as a React + Vite app. **The words and the engine are strictly separate**
so any line can be edited without touching logic.

---

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

Target a **tablet in landscape** first; it also works on a laptop. Tap the dark
screen to power on.

## Where the words live

Everything Ashley reads is in **`src/content/story.ts`** — all narration, every
AIM script, the dialogue choices, the coda, and the chapter order. Edit freely.

Search that file for **`[FILL: ...]`** to find the optional spots you can still
personalize:

- Chapter 3 — his AIM away message
- Chapter 7 — the goodnight word she taps out on the Nokia
- `HIS_PROFILE.quote` at the top of the file (the AIM buddy-info quote line)

> Note: the Guns N' Roses song (Ch. 4) is referenced by name only, and the
> Guster lines on the dry-erase board (Ch. 7) are the ones you supplied, typed
> in as content. Since this repo is public, keep in mind those lyrics are
> reproduced here — make the repo private if that matters to you.

## Photos

Two reveal slots are wired and waiting — the guitar (Ch. 7) and the wedding
(Ch. 10). Drop images into `src/assets/` and point the `photo` beats at them.
See `src/assets/README.md`. Until then, placeholders keep the story playable.

## Sound

All synthesized with the Web Audio API — no copyrighted clips. See
`src/audio/README.md` if you want to swap in a real dial-up recording, and for
the note on why the GNR/Guster tracks and lyrics are deliberately left out.

## Architecture

```
src/
  content/story.ts        all narration, AIM scripts, texts, chapter order
  engine/
    types.ts              the beat/chapter data model (no React)
    StoryMachine.tsx      chapter + beat state machine, save/resume
    useTypewriter.ts      typed-out narration
  components/
    BootScreen.tsx        boot, dial-up, AIM sign-on
    AimWindow.tsx         buddy list + chat  (signature mechanic 1)
    NokiaPhone.tsx        multi-tap keypad   (signature mechanic 2)
    PointClickRoom.tsx    Chapter 5 clickable dorm
    NarrationCard.tsx     typed narration beats
    DialogueScene.tsx     warm dialogue choices
    CdSwerve.tsx          Chapter 1 pixel-art driving cold-open
    HypnosisGame.tsx      Chapter 2 resist-the-mentalist game
    IfcDateGame.tsx       Chapter 6 date: ticket, sushi, subway, ferry
    StayStillGame.tsx     Chapter 7 hold-still-for-Pappy game
    StairwellGame.tsx     Chapter 7 sneak-down-the-stairs game
    DishesGame.tsx        Chapter 8 dish pit (French onion Easter egg)
    BalconyScene.tsx      Chapter 9 pixel-art porch proposal
    PhotoReveal.tsx       unlockable real photos
    CodaScreen.tsx        the present-day closing message
  audio/sound.ts          synthesized sounds
  assets/                 your photos
```

**Progress & resume:** the current chapter, beat, and unlocked bonus are saved
to `localStorage`, so she can close the tablet and pick up where she left off.
The mute toggle and a "start from the ditch" restart live in the top bar.

## The twelve chapters

1. The Ditch · 2. The Mentalist · 3. Buddy List · 4. Laundry · 5. Room 1xx ·
6. IFC · 7. Winter Break · 8. The Country Club · 9. The Balcony ·
10. Worlds End · 11. Coda — *and then* Bonus: Thieves in the Night, unlocked
after the coda.

## Deploy (Vercel)

`vercel.json` is included and configured for Vite with `noindex` headers. Push
to Vercel as a **private project** and share the unguessable production URL —
she taps it on the tablet and it just runs.

The build uses a **relative base** (`base: './'` in `vite.config.ts`), so the
`dist/` folder also works as a fully offline keepsake: build it, then open
`dist/index.html` straight from the file system.

---

Happy anniversary. 🖤
