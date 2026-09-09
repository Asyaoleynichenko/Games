import { CharacterHero } from '../Character'
import { characters, characterById } from '../../data/characters'
import type { CharacterMood } from '../../state/HubState'
import { themes } from './Chrome'
import { FRUIT_SLIDE } from './Pager'

const SIDE = 282
const SIDE_TOP = 45

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smooth(t: number) {
  const k = Math.max(0, Math.min(1, t))
  return k * k * (3 - 2 * k)
}

/** Layout of character `index` on the strip, given continuous scroll `progress`. */
export function stripSlot(
  index: number,
  progress: number,
  sx = 1,
  sy = 1,
  slide = FRUIT_SLIDE,
) {
  const character = characters[index]
  const hero = themes[character.id].hero
  const offset = index - progress
  const focus = smooth(1 - Math.abs(offset))

  const size = lerp(SIDE * sx, hero.size * sx, focus)
  const top = lerp(SIDE_TOP * sy, hero.top * sy, focus)

  const i0 = Math.max(0, Math.min(characters.length - 1, Math.floor(progress)))
  const i1 = Math.max(0, Math.min(characters.length - 1, i0 + 1))
  const t = progress - i0
  const a = themes[characters[i0].id].hero
  const b = themes[characters[i1].id].hero
  const viewCx = lerp((a.left + a.size / 2) * sx, (b.left + b.size / 2) * sx, t)

  const left = viewCx + offset * slide - size / 2

  return { left, top, size, focus, z: Math.round(2 + focus * 6) }
}

/**
 * Three heroes on one track. The focused one matches the Figma hero box;
 * neighbours shrink toward the 282px peek as they slide off-centre.
 */
export function CharacterStrip({
  progress,
  placed,
  accessories,
  animateIds = [],
  mood = 'idle',
  sx = 1,
  sy = 1,
  slide = FRUIT_SLIDE,
}: {
  progress: number
  placed: string[]
  accessories: string[]
  animateIds?: string[]
  mood?: CharacterMood
  sx?: number
  sy?: number
  slide?: number
}) {
  const focused = Math.max(0, Math.min(characters.length - 1, Math.round(progress)))

  return (
    <>
      {characters.map((item, index) => {
        const slot = stripSlot(index, progress, sx, sy, slide)
        const isFocus = index === focused
        return (
          <div
            key={item.id}
            className={`cast__item${isFocus ? ' is-focus' : ''}`}
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.size,
              height: slot.size,
              zIndex: slot.z,
            }}
          >
            <CharacterHero
              character={characterById(item.id)}
              size={slot.size}
              placed={placed}
              accessories={isFocus ? accessories : []}
              animateIds={isFocus ? animateIds : []}
              mood={isFocus ? mood : undefined}
            />
          </div>
        )
      })}
    </>
  )
}
