import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Cta } from '../components/Ui'
import { useHub, type TetrisPhase } from '../state/HubState'

const COLS = 10
const ROWS = 18
const GOAL = 10
const SUCCESS_XP = 80
const LINE_SCORES = [0, 100, 300, 500, 800]
const COLORS = ['#ff7a29', '#ffcc40', '#20bf7a', '#ff47fc', '#5ca8ff', '#47c4c4', '#ff6b6b']
const KICKS = [
  [0, 0],
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
  [0, -2],
  [0, 2],
]

type Mat = number[][]
type Piece = { mat: Mat; r: number; c: number; kind: number }

const SHAPES: Mat[] = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
]

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function rotate(mat: Mat): Mat {
  const rows = mat.length
  const cols = mat[0].length
  const next: Mat = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) next[c][rows - 1 - r] = mat[r][c]
  }
  return next
}

function fits(board: number[][], mat: Mat, r: number, c: number) {
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat[i].length; j++) {
      if (!mat[i][j]) continue
      const rr = r + i
      const cc = c + j
      if (cc < 0 || cc >= COLS || rr >= ROWS) return false
      if (rr >= 0 && board[rr][cc]) return false
    }
  }
  return true
}

function spawn(kind: number): Piece {
  const mat = SHAPES[kind % SHAPES.length]
  return {
    mat,
    r: 0,
    c: Math.max(0, Math.floor((COLS - mat[0].length) / 2)),
    kind: (kind % COLORS.length) + 1,
  }
}

function paint(board: number[][], piece: Piece | null) {
  const cells = board.map((row) => row.slice())
  if (!piece) return cells
  for (let i = 0; i < piece.mat.length; i++) {
    for (let j = 0; j < piece.mat[i].length; j++) {
      if (!piece.mat[i][j]) continue
      const rr = piece.r + i
      const cc = piece.c + j
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) cells[rr][cc] = piece.kind
    }
  }
  return cells
}

function formatScore(value: number) {
  return value.toLocaleString('ru-RU').replace(/\u00A0/g, ' ')
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.5 5.5 8 12l6.5 6.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1.4" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1.4" fill="currentColor" />
    </svg>
  )
}

export function TetrisScreen() {
  const { tetrisPhase, setTetrisPhase, goto, addXp, queueSticker, level } = useHub()
  const live = tetrisPhase === 'playing'

  const [board, setBoard] = useState(emptyBoard)
  const [piece, setPiece] = useState<Piece | null>(null)
  const [nextKind, setNextKind] = useState(2)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [combo, setCombo] = useState(0)
  const [rewarded, setRewarded] = useState(false)

  const boardRef = useRef(board)
  const pieceRef = useRef(piece)
  const liveRef = useRef(live)
  const swipe = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  boardRef.current = board
  pieceRef.current = piece
  liveRef.current = live

  const takeKind = useCallback(() => Math.floor(Math.random() * SHAPES.length), [])

  const spawnNext = useCallback(
    (grid: number[][], kind: number) => {
      const next = spawn(kind)
      if (!fits(grid, next.mat, next.r, next.c)) {
        setPiece(null)
        pieceRef.current = null
        setTetrisPhase('failure')
        return
      }
      setPiece(next)
      pieceRef.current = next
    },
    [setTetrisPhase],
  )

  const startRound = useCallback(() => {
    const fresh = emptyBoard()
    const first = takeKind()
    const upcoming = takeKind()
    setBoard(fresh)
    boardRef.current = fresh
    setScore(0)
    setLines(0)
    setCombo(0)
    setRewarded(false)
    setNextKind(upcoming)
    spawnNext(fresh, first)
    setTetrisPhase('playing')
  }, [setTetrisPhase, spawnNext, takeKind])

  const lock = useCallback(
    (current: Piece) => {
      const stamped = boardRef.current.map((row) => row.slice())
      for (let i = 0; i < current.mat.length; i++) {
        for (let j = 0; j < current.mat[i].length; j++) {
          if (!current.mat[i][j]) continue
          const rr = current.r + i
          const cc = current.c + j
          if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) stamped[rr][cc] = current.kind
        }
      }
      const kept = stamped.filter((row) => row.some((cell) => cell === 0))
      const cleared = ROWS - kept.length
      while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0))
      setBoard(kept)
      boardRef.current = kept

      if (cleared) {
        const nextCombo = combo + 1
        setCombo(nextCombo)
        setScore((value) => value + LINE_SCORES[cleared] * Math.max(1, nextCombo))
        setLines((value) => {
          const next = Math.min(GOAL, value + cleared)
          if (next >= GOAL) setTetrisPhase('success')
          return next
        })
      } else {
        setCombo(0)
      }

      const upcoming = takeKind()
      spawnNext(kept, nextKind)
      setNextKind(upcoming)
    },
    [combo, nextKind, setTetrisPhase, spawnNext, takeKind],
  )

  const move = useCallback(
    (dr: number, dc: number, rot = false) => {
      if (!liveRef.current) return false
      const current = pieceRef.current
      if (!current) return false
      if (rot) {
        const mat = rotate(current.mat)
        for (const [kr, kc] of KICKS) {
          if (fits(boardRef.current, mat, current.r + kr, current.c + kc)) {
            const next = { ...current, mat, r: current.r + kr, c: current.c + kc }
            pieceRef.current = next
            setPiece(next)
            return true
          }
        }
        return false
      }
      const r = current.r + dr
      const c = current.c + dc
      if (fits(boardRef.current, current.mat, r, c)) {
        const next = { ...current, r, c }
        pieceRef.current = next
        setPiece(next)
        return true
      }
      if (dr > 0 && dc === 0) lock(current)
      return false
    },
    [lock],
  )

  useEffect(() => {
    if (!live) return
    const timer = window.setInterval(() => move(1, 0), Math.max(140, 700 - lines * 40))
    return () => window.clearInterval(timer)
  }, [live, lines, move])

  useEffect(() => {
    if (tetrisPhase !== 'success' || rewarded) return
    setRewarded(true)
    addXp(SUCCESS_XP)
    queueSticker('soberi-zavtrak')
  }, [addXp, queueSticker, rewarded, tetrisPhase])

  useEffect(() => {
    if (tetrisPhase !== 'loading') return
    const timer = window.setTimeout(startRound, 900)
    return () => window.clearTimeout(timer)
  }, [startRound, tetrisPhase])

  useEffect(() => {
    const filled = boardRef.current.some((row) => row.some(Boolean))
    if (filled || pieceRef.current) return
    if (
      tetrisPhase !== 'playing' &&
      tetrisPhase !== 'paused' &&
      tetrisPhase !== 'success' &&
      tetrisPhase !== 'failure'
    ) {
      return
    }
    const preview = emptyBoard()
    const palette = [1, 2, 3, 4, 5]
    for (let r = ROWS - 4; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if ((r + c) % 3 === 0) continue
        preview[r][c] = palette[(r + c) % palette.length]
      }
    }
    setBoard(preview)
    boardRef.current = preview
    const falling = spawn(2)
    falling.r = 6
    setPiece(falling)
    pieceRef.current = falling
    if (tetrisPhase === 'success') {
      setLines(GOAL)
      setScore(1860)
    } else if (tetrisPhase === 'failure') {
      setLines(4)
      setScore(620)
    } else {
      setLines(8)
      setScore(1240)
      setCombo(3)
    }
  }, [tetrisPhase])

  const onBoardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipe.current = { x: event.clientX, y: event.clientY, moved: false }
  }

  const onBoardPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current
    if (!start || !live) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const box = event.currentTarget.getBoundingClientRect()
    const step = box.width / COLS
    if (Math.abs(dx) > step * 0.7 && Math.abs(dx) >= Math.abs(dy)) {
      move(0, dx > 0 ? 1 : -1)
      start.x = event.clientX
      start.moved = true
    } else if (dy > step * 0.85 && Math.abs(dy) > Math.abs(dx)) {
      move(1, 0)
      start.y = event.clientY
      start.moved = true
    }
  }

  const onBoardPointerUp = () => {
    const start = swipe.current
    swipe.current = null
    if (start && !start.moved) move(0, 0, true)
  }

  const cells = paint(board, live || tetrisPhase === 'paused' ? piece : piece)
  const remain = Math.max(0, GOAL - lines)
  const overlay = overlayCopy(tetrisPhase)

  return (
    <div className="tgame">
      <div className="tgame__bg" aria-hidden />
      <div className="tgame__scrim" aria-hidden />

      <header className="tgame__head">
        <button
          className="tgame__icon"
          type="button"
          aria-label="Назад"
          onClick={() => goto('hub')}
        >
          <BackIcon />
        </button>
        <h1 className="tgame__title">Завтрак-тетрис</h1>
        <button
          className="tgame__icon"
          type="button"
          aria-label="Пауза"
          onClick={() => {
            if (tetrisPhase === 'playing') setTetrisPhase('paused')
            else if (tetrisPhase === 'paused') setTetrisPhase('playing')
          }}
        >
          <PauseIcon />
        </button>
      </header>

      <section className="tgame__stats">
        <div>
          <p>Счёт</p>
          <strong>{formatScore(score)}</strong>
        </div>
        <div>
          <p>Линии</p>
          <strong>
            {lines} / {GOAL}
          </strong>
        </div>
        <div>
          <p>Уровень</p>
          <strong>{level}</strong>
        </div>
      </section>

      <div className="tgame__play">
        <div
          className="tgame__board"
          onPointerDown={onBoardPointerDown}
          onPointerMove={onBoardPointerMove}
          onPointerUp={onBoardPointerUp}
          onPointerCancel={onBoardPointerUp}
        >
          {cells.flatMap((row, r) =>
            row.map((kind, c) => (
              <span
                key={`${r}-${c}`}
                className={`tgame__cell${kind ? ' is-on' : ''}`}
                style={kind ? { background: COLORS[kind - 1] } : undefined}
              />
            )),
          )}
        </div>

        <aside className="tgame__side">
          <div className="tgame__card">
            <p>Дальше</p>
            <div className="tgame__next">
              {SHAPES[nextKind].map((row, r) =>
                row.map((on, c) => (
                  <span
                    key={`${r}-${c}`}
                    className={on ? 'is-on' : ''}
                    style={{
                      gridColumn: c + 1,
                      gridRow: r + 1,
                      background: on ? COLORS[3] : 'transparent',
                    }}
                  />
                )),
              )}
            </div>
          </div>
          <div className="tgame__card tgame__card--goal">
            <p>Цель</p>
            <strong>
              Собери
              <br />
              {GOAL} линий
            </strong>
          </div>
          <div className="tgame__card tgame__card--combo">
            <p>Комбо</p>
            <strong>×{Math.max(1, combo)}</strong>
          </div>
        </aside>
      </div>

      <div className="tgame__hint">
        <span>Свайп — двигать</span>
        <span>Тап — поворот</span>
      </div>

      <div className="tgame__progress">
        <div>
          <span>До награды</span>
          <span>
            {remain} {remain === 1 ? 'линия' : remain < 5 ? 'линии' : 'линий'}
          </span>
        </div>
        <div className="tgame__bar">
          <i style={{ width: `${(lines / GOAL) * 100}%` }} />
        </div>
      </div>

      <p className="tgame__note">Прогресс раунда сохраняется при паузе</p>

      {overlay && (
        <div className="tgame__dim">
          <section className={`tgame__sheet${overlay.center ? ' tgame__sheet--center' : ''}`}>
            <h2>{overlay.title}</h2>
            <p>{overlay.body}</p>
            {'rules' in overlay && overlay.rules && (
              <ul className="tgame__rules">
                <li>
                  <i style={{ background: '#ffcc40' }} />
                  Свайп — перемещай фигуру
                </li>
                <li>
                  <i style={{ background: '#ff47fc' }} />
                  Тап — поворачивай
                </li>
                <li>
                  <i style={{ background: '#20bf7a' }} />
                  Собери 10 линий за раунд
                </li>
              </ul>
            )}
            {overlay.rewards && (
              <div className="tgame__rewards">
                <span>+{SUCCESS_XP} XP</span>
                <span>+1 стикер</span>
              </div>
            )}
            {overlay.primary && (
              <Cta
                block
                onClick={() => {
                  if (overlay.primary === 'start') startRound()
                  else if (overlay.primary === 'resume') setTetrisPhase('playing')
                  else if (overlay.primary === 'retry') setTetrisPhase('loading')
                  else if (overlay.primary === 'claim') {
                    goto('awards')
                  }
                }}
              >
                {overlay.primaryLabel}
              </Cta>
            )}
            {overlay.secondary && (
              <Cta
                block
                variant={overlay.secondary === 'exit' ? 'white' : 'ghost'}
                onClick={() => {
                  if (overlay.secondary === 'exit') goto('hub')
                  else startRound()
                }}
              >
                {overlay.secondaryLabel}
              </Cta>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function overlayCopy(phase: TetrisPhase) {
  if (phase === 'tutorial') {
    return {
      title: 'Как играть в тетрис',
      body: 'Собирай горизонтальные линии из продуктовых блоков.',
      primary: 'start' as const,
      primaryLabel: 'Начать раунд',
      rules: true,
    }
  }
  if (phase === 'paused') {
    return {
      title: 'Пауза',
      body: 'Прогресс раунда сохранён. Можно продолжить с этой доски.',
      primary: 'resume' as const,
      primaryLabel: 'Продолжить',
      secondary: 'exit' as const,
      secondaryLabel: 'Выйти из раунда',
    }
  }
  if (phase === 'success') {
    return {
      title: 'Раунд собран',
      body: '10 линий закрыты. Награда уже в профиле.',
      rewards: true,
      primary: 'claim' as const,
      primaryLabel: 'Забрать награду',
      secondary: 'again' as const,
      secondaryLabel: 'Ещё раунд',
    }
  }
  if (phase === 'failure') {
    return {
      title: 'Поле заполнено',
      body: 'Прогресс раунда сохранён. Можно продолжить с этой доски.',
      primary: 'resume' as const,
      primaryLabel: 'Продолжить',
      secondary: 'exit' as const,
      secondaryLabel: 'Выйти',
    }
  }
  if (phase === 'loading') {
    return {
      title: 'Собираем поле',
      body: 'Подтягиваем прогресс раунда и следующую фигуру.',
      center: true,
    }
  }
  if (phase === 'offline') {
    return {
      title: 'Связь прервалась',
      body: 'Раунд на паузе. Прогресс сохранён — можно продолжить, когда сеть вернётся.',
      primary: 'retry' as const,
      primaryLabel: 'Повторить',
      secondary: 'exit' as const,
      secondaryLabel: 'Выйти из раунда',
    }
  }
  return null
}
