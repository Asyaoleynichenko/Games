import { type Ref, type UIEvent, useState } from 'react'
import { Match3 } from '../game/Match3'
import { Tetris } from '../game/Tetris'
import { ToastStack } from '../game/ToastStack'
import { characters } from '../../data/characters'
import { useHub } from '../../state/HubState'
import { ThemePager } from './Pager'

const ROUND_XP = 40

/**
 * Play CTA + live 361×215 board. On the hub it sits behind the curtain and
 * is uncovered when the sheet is dragged down; PlayScreen uses the same dock
 * as a dedicated window.
 */
export function PlayDock({
  progress,
  pagerRef,
  onScroll,
  enabled,
  docked = false,
  revealed = true,
}: {
  progress: number
  pagerRef: Ref<HTMLDivElement>
  onScroll: (event: UIEvent<HTMLDivElement>) => void
  enabled: boolean
  docked?: boolean
  revealed?: boolean
}) {
  const { addXp } = useHub()
  const [seeds, setSeeds] = useState([1, 1, 1])
  const [drops, setDrops] = useState(0)
  const [tetrisDrops, setTetrisDrops] = useState(0)

  const active = Math.max(0, Math.min(2, Math.round(progress)))
  const current = characters[active] ?? characters[0]

  const score = () => addXp(ROUND_XP)

  const play = () => {
    if (current.id === 'toast') {
      setDrops((count) => count + 1)
      return
    }
    if (current.id === 'lemon') {
      setTetrisDrops((count) => count + 1)
      return
    }
    setSeeds((list) =>
      list.map((value, index) => (index === active ? value + 1 : value)),
    )
  }

  return (
    <>
      <ThemePager pagerRef={pagerRef} onScroll={onScroll} className="pager--play">
        {characters.map((character, index) => (
          <div className="pager__page" key={character.id}>
            <div className="media media--live">
              {character.id === 'egg' && (
                <Match3
                  variant="breakfast"
                  seed={seeds[index]}
                  enabled={enabled && Math.abs(progress - index) < 0.5}
                  onScore={score}
                />
              )}
              {character.id === 'toast' && (
                <ToastStack
                  seed={seeds[index]}
                  dropTick={drops}
                  enabled={enabled && Math.abs(progress - index) < 0.5}
                  onScore={score}
                />
              )}
              {character.id === 'lemon' && (
                <Tetris
                  seed={seeds[index]}
                  dropTick={tetrisDrops}
                  enabled={enabled && Math.abs(progress - index) < 0.5}
                  onScore={score}
                />
              )}
            </div>
          </div>
        ))}
      </ThemePager>

      <button
        className={`playbtn playbtn--live${docked ? ' playbtn--dock' : ''}${
          revealed ? ' is-on' : ''
        }`}
        onClick={play}
        disabled={!revealed}
        tabIndex={revealed ? undefined : -1}
      >
        Играть
      </button>
    </>
  )
}
