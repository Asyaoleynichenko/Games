import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react'

const COLS = 8
const ROWS = 12
const GRAVITY = 640
const KINDS = 7

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

const COLORS = [
  '#5ad4e8',
  '#f5d442',
  '#ff9d00',
  '#7ad45a',
  '#ff6b6b',
  '#47c4c4',
  '#ff7ad9',
]

function emptyBoard(): number[][] {
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

function stamp(board: number[][], piece: Piece) {
  const next = board.map((row) => row.slice())
  for (let i = 0; i < piece.mat.length; i++) {
    for (let j = 0; j < piece.mat[i].length; j++) {
      if (!piece.mat[i][j]) continue
      const rr = piece.r + i
      const cc = piece.c + j
      if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) next[rr][cc] = piece.kind
    }
  }
  return next
}

function clearLines(board: number[][]) {
  const kept = board.filter((row) => row.some((cell) => cell === 0))
  const cleared = ROWS - kept.length
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(0))
  return { board: kept, cleared }
}

function spawn(kind: number): Piece {
  const mat = SHAPES[kind % SHAPES.length]
  return {
    mat,
    r: 0,
    c: Math.max(0, Math.floor((COLS - mat[0].length) / 2)),
    kind: (kind % KINDS) + 1,
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

/**
 * Lemon game — a compact tetris that fits the 361×215 media block.
 * Tap left/right to move, centre to rotate; «Играть» drops the piece.
 */
export function Tetris({
  seed,
  dropTick = 0,
  enabled,
  onScore,
}: {
  seed: number
  dropTick?: number
  enabled: boolean
  onScore: (xp: number) => void
}) {
  const [board, setBoard] = useState(emptyBoard)
  const [piece, setPiece] = useState<Piece | null>(() => spawn(seed))
  const [over, setOver] = useState(false)
  const [cleared, setCleared] = useState(0)
  const boardRef = useRef(board)
  const pieceRef = useRef(piece)
  const overRef = useRef(over)
  const onScoreRef = useRef(onScore)
  const tickRef = useRef(dropTick)
  boardRef.current = board
  pieceRef.current = piece
  overRef.current = over
  onScoreRef.current = onScore

  const reset = useCallback(() => {
    const next = spawn(seed)
    const fresh = emptyBoard()
    setBoard(fresh)
    setCleared(0)
    setOver(false)
    overRef.current = false
    if (!fits(fresh, next.mat, next.r, next.c)) {
      setPiece(null)
      setOver(true)
      return
    }
    setPiece(next)
  }, [seed])

  useEffect(() => {
    reset()
  }, [seed, reset])

  const lock = useCallback((current: Piece) => {
    let nextBoard = stamp(boardRef.current, current)
    const result = clearLines(nextBoard)
    nextBoard = result.board
    if (result.cleared) {
      setCleared((count) => count + result.cleared)
    }
    onScoreRef.current(40)
    const kind = (current.kind + result.cleared + seed) % KINDS
    const next = spawn(kind)
    setBoard(nextBoard)
    boardRef.current = nextBoard
    if (!fits(nextBoard, next.mat, next.r, next.c)) {
      setPiece(null)
      setOver(true)
      overRef.current = true
      return
    }
    setPiece(next)
  }, [seed])

  const move = useCallback(
    (dr: number, dc: number, rot = false) => {
      if (!enabled || overRef.current) return
      const current = pieceRef.current
      if (!current) return
      const mat = rot ? rotate(current.mat) : current.mat
      const r = current.r + dr
      const c = current.c + dc
      if (fits(boardRef.current, mat, r, c)) {
        const next = { ...current, mat, r, c }
        pieceRef.current = next
        setPiece(next)
        return true
      }
      if (dr > 0 && !rot && dc === 0) lock(current)
      return false
    },
    [enabled, lock],
  )

  useEffect(() => {
    if (!enabled || over) return
    const timer = window.setInterval(() => move(1, 0), GRAVITY)
    return () => window.clearInterval(timer)
  }, [enabled, over, move])

  useEffect(() => {
    if (dropTick === tickRef.current) return
    tickRef.current = dropTick
    if (!enabled) return
    if (overRef.current) {
      reset()
      return
    }
    const current = pieceRef.current
    if (!current) return
    let next = current
    while (fits(boardRef.current, next.mat, next.r + 1, next.c)) {
      next = { ...next, r: next.r + 1 }
    }
    lock(next)
  }, [dropTick, enabled, lock, reset])

  const onTap = (event: MouseEvent<HTMLButtonElement>) => {
    if (over) {
      reset()
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    if (x < 0.3) move(0, -1)
    else if (x > 0.7) move(0, 1)
    else move(0, 0, true)
  }

  const cells = paint(board, piece)

  return (
    <button className="tetris" type="button" onClick={onTap} disabled={!enabled}>
      <div
        className="tetris__grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {cells.flatMap((row, r) =>
          row.map((kind, c) => (
            <span
              key={`${r}-${c}`}
              className={`tetris__cell${kind ? ' is-on' : ''}`}
              style={kind ? { background: COLORS[kind - 1] } : undefined}
            />
          )),
        )}
      </div>
      <p className="tetris__hint">
        {over
          ? 'Поле заполнено — ещё раз'
          : cleared
            ? `Линии: ${cleared}`
            : 'Влево · поворот · вправо'}
      </p>
    </button>
  )
}
