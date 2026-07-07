# Photos and personal assets

Drop your real images here, then point to them from `src/content/story.ts`.

Two reveal slots are wired up and waiting:

- **The guitar** (Chapter 7). Save it as `guitar.jpg` here, then in
  `story.ts` find the Chapter 7 `photo` beat and set:
  `import guitar from '../assets/guitar.jpg'` and `src: guitar`.
- **The wedding** (Chapter 10, Worlds End). Save it as `wedding.jpg`, and set
  the Chapter 10 `photo` beat's `src` the same way.

Until you add them, the game shows a gentle placeholder frame so everything
still plays start to finish. Those two reveals will do more than any effect —
add them when you can.

Anything you drop in here is bundled by Vite when imported. Keep this a private,
personal build; do not commit copyrighted material you don't have rights to
distribute (see the note on music in the main README).
