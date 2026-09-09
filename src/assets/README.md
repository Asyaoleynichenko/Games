# Assets

Everything here is exported from the Figma file **🛒** (`K08PtuqPmba96tAU0CFDtY`).
Nothing is drawn by hand — if a shape looks wrong, re-export it rather than
recreating it in CSS.

- `figma/` — characters and screen chrome, from the page **«экраны»**, at 3x
- `figma/ach/` — the sticker set, from the page **«ачивки»** (`18:3746`), at 2x

## Screen chrome and characters

| File | Figma node | What it is |
| --- | --- | --- |
| `char-egg.png` | `18:3836` | Fried egg with a star yolk |
| `char-toast.png` | `18:3891` | Toast branded "NEW" |
| `char-lemon.png` | `18:3995` | Lemon with the anime face (tilted) |
| `char-side-b.png` | `18:3835` | Lemon, upright variant |
| `badge-100xp.png` | `18:3830` | Silver "+100 XP" star on the progress pill |
| `bottom-nav.png` | `18:3822` | Bottom navigation bar |
| `board-breakfast.png` | `18:3915` | Match-3 board, breakfast tiles |
| `board-fruit.png` | `18:4019` | Match-3 board, fruit tiles |
| `sticker-locked.png` | `18:4102` | Grey locked medallion |

## Stickers

`ach/ach-01.png` … `ach-24.png` are the 24 stickers, in the document order of
nodes `18:3747` … `18:3770`. `data/stickers.ts` lists them with the titles
transcribed from the artwork, and `assets/index.ts` maps sticker id → file.

`ach/big-1.png` … `big-6.png` are the six large renders on the same page:

| File | What it is |
| --- | --- |
| `big-1.png` | Fried egg, clean |
| `big-2.png` | Toast "NEW", clean |
| `big-3.png` | Banana, decorated with stickers |
| `big-4.png` | Orange, decorated with stickers |
| `big-5.png` | Strawberry, decorated with stickers |
| `big-6.png` | Lemon with the anime face |

The three decorated fruit are the reference for how stickers should sit on a
character: about six of them, ringing the body at varied angles, each roughly a
quarter of the body's width, with the upper middle left clear. They are not
used as playable characters because the stickers are baked into the artwork.

## Re-exporting

The theme backdrops are drawn in code (SVG bursts, lemon Ben-Day dots,
egg PrismaticBurst) — there are no ray PNG textures.

```bash
# needs a Figma personal access token with read access to the file
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/K08PtuqPmba96tAU0CFDtY?ids=18:3836&format=png&scale=3"
# → { "images": { "18:3836": "https://…" } }, then download that URL
```

## Placement geometry

Each artwork square carries a different amount of transparent padding — the
lemon fills 42% of its square, the toast 88% — so nothing on the body can be
positioned against the square itself.

- `data/characters.ts` gives every character a `body` rectangle (the part of the
  square that is actually character) plus an `accessory` box for the face.
- `data/stickers.ts` defines `slots` in **body space**, 0-100 across that
  rectangle. `slotPosition()` maps a slot onto the artwork, and
  `stickerSizeFor()` scales stickers off the body width.

That indirection is what lets one slot layout look right on all three
characters. Change `body` if a character's art is re-exported at a different
crop.
