import { characterArt } from '../assets'
import type { StickerSlot } from './stickers'

export interface Character {
  id: string
  /** Shown in the streak / customization copy. */
  name: string
  art: string
  /** Base frame fill from Figma. */
  base: string
  /** Text colour that sits on this theme. */
  onTheme: string
  /** Hero size in px, matching the Figma node width. */
  size: number
  /**
   * The sub-rectangle of the artwork square that is actual character, in % of
   * the square. Each export carries a different amount of transparent padding
   * — the lemon fills 42% of its square, the toast 80% — so anything placed on
   * the body has to be positioned relative to this, not to the square.
   */
  body: { x: number; y: number; w: number; h: number }
  /** Where an accessory sits, in % of the hero box. */
  accessory: { left: number; top: number; width: number }
}

/**
 * The hub is a horizontal carousel of characters, each with its own themed
 * background — exactly as the Figma frames are laid out.
 */
export const characters: Character[] = [
  {
    id: 'egg',
    name: 'Яичница',
    art: characterArt.egg,
    base: 'var(--purple)',
    onTheme: '#ffffff',
    size: 338,
    body: { x: 8, y: 10, w: 84, h: 80 },
    accessory: { left: 30, top: 44, width: 40 },
  },
  {
    id: 'toast',
    name: 'Тост',
    art: characterArt.toast,
    base: 'var(--magenta)',
    onTheme: '#ffffff',
    size: 338,
    body: { x: 10, y: 6, w: 80, h: 88 },
    accessory: { left: 27, top: 40, width: 46 },
  },
  {
    id: 'lemon',
    name: 'Лимон',
    art: characterArt.lemon,
    base: 'var(--orange)',
    onTheme: '#1f1f1f',
    size: 421,
    body: { x: 30, y: 17, w: 42, h: 63 },
    accessory: { left: 33, top: 41, width: 36 },
  },
]

export const characterById = (id: string) =>
  characters.find((c) => c.id === id) ?? characters[0]

/** Maps a body-space slot onto the artwork square, in % of the hero box. */
export function slotPosition(character: Character, slot: StickerSlot) {
  const { body } = character
  return {
    left: body.x + (slot.x / 100) * body.w,
    top: body.y + (slot.y / 100) * body.h,
  }
}

/**
 * Sticker size in px. The decorated characters on the «ачивки» page put
 * stickers at roughly a quarter of the body's width, so scale off the body
 * rather than the square.
 */
export function stickerSizeFor(character: Character, box: number) {
  return box * (character.body.w / 100) * 0.34
}
