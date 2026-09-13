import { TETRIS_COLORS } from '../../screens/TetrisScreen'
import { useHub } from '../../state/HubState'

const PREVIEW = [
  [0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 2, 2, 3, 3, 4, 4, 5, 5, 1],
  [1, 2, 0, 3, 4, 4, 0, 5, 5, 1],
  [2, 0, 2, 3, 3, 4, 5, 0, 5, 0],
  [0, 1, 1, 0, 3, 3, 0, 4, 0, 0],
]

/**
 * Hub play CTA + the one mini-game preview (Завтрак-тетрис, Figma 133:1714).
 */
export function PlayDock({
  docked = false,
  revealed = true,
}: {
  progress?: number
  pagerRef?: unknown
  onScroll?: unknown
  enabled?: boolean
  docked?: boolean
  revealed?: boolean
}) {
  const { openTetris } = useHub()
  const play = () => openTetris('playing')

  return (
    <>
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

      <button
        className="media media--live media--tetris"
        type="button"
        onClick={play}
        disabled={!revealed}
        aria-label="Открыть завтрак-тетрис"
      >
        <div className="tgame__field">
          {PREVIEW.flatMap((row, r) =>
            row.map((kind, c) => (
              <span
                key={`${r}-${c}`}
                className={`tgame__cell${kind ? ' is-on' : ''}`}
                style={kind ? { ['--cell' as string]: TETRIS_COLORS[kind - 1] } : undefined}
              />
            )),
          )}
        </div>
      </button>
    </>
  )
}
