import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BreakfastTile, FruitTile } from './tiles'

type Cell = { id: number; kind: number }
type Pos = { r: number; c: number }

let nextId = 1
const cell = (kind: number): Cell => ({ id: nextId++, kind })
const keyOf = (p: Pos) => `${p.r},${p.c}`
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function makeGrid(rows: number, cols: number, kinds: number): Cell[][] {
  const grid: Cell[][] = []
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = []
    for (let c = 0; c < cols; c++) {
      let kind: number
      do {
        kind = Math.floor(Math.random() * kinds)
      } while (
        (c >= 2 && row[c - 1].kind === kind && row[c - 2].kind === kind) ||
        (r >= 2 && grid[r - 1][c].kind === kind && grid[r - 2][c].kind === kind)
      )
      row.push(cell(kind))
    }
    grid.push(row)
  }
  return grid
}

function matchesIn(grid: (Cell | null)[][]): Set<string> {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const hits = new Set<string>()

  for (let r = 0; r < rows; r++) {
    let run = 1
    for (let c = 1; c <= cols; c++) {
      const same =
        c < cols &&
        grid[r][c] &&
        grid[r][c - 1] &&
        grid[r][c]!.kind === grid[r][c - 1]!.kind
      if (same) run += 1
      else {
        if (run >= 3) {
          for (let k = 0; k < run; k++) hits.add(`${r},${c - 1 - k}`)
        }
        run = 1
      }
    }
  }

  for (let c = 0; c < cols; c++) {
    let run = 1
    for (let r = 1; r <= rows; r++) {
      const same =
        r < rows &&
        grid[r][c] &&
        grid[r - 1][c] &&
        grid[r][c]!.kind === grid[r - 1][c]!.kind
      if (same) run += 1
      else {
        if (run >= 3) {
          for (let k = 0; k < run; k++) hits.add(`${r - 1 - k},${c}`)
        }
        run = 1
      }
    }
  }

  return hits
}

function adjacent(a: Pos, b: Pos) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1
}

function swapCells(grid: Cell[][], a: Pos, b: Pos): Cell[][] {
  const next = grid.map((row) => row.slice())
  const hold = next[a.r][a.c]
  next[a.r][a.c] = next[b.r][b.c]
  next[b.r][b.c] = hold
  return next
}

function gravity(grid: (Cell | null)[][], kinds: number): Cell[][] {
  const rows = grid.length
  const cols = grid[0].length
  const next: Cell[][] = grid.map((row) => row.slice() as Cell[])

  for (let c = 0; c < cols; c++) {
    const stack: Cell[] = []
    for (let r = rows - 1; r >= 0; r--) {
      const tile = grid[r][c]
      if (tile) stack.push(tile)
    }
    for (let r = rows - 1; r >= 0; r--) {
      next[r][c] = stack.shift() ?? cell(Math.floor(Math.random() * kinds))
    }
  }
  return next
}

function findHint(grid: Cell[][]): [Pos, Pos] | null {
  const rows = grid.length
  const cols = grid[0].length
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const here = { r, c }
      const neighbors = [
        { r, c: c + 1 },
        { r: r + 1, c },
      ]
      for (const other of neighbors) {
        if (other.r >= rows || other.c >= cols) continue
        const swapped = swapCells(grid, here, other)
        if (matchesIn(swapped).size > 0) return [here, other]
      }
    }
  }
  return null
}

export function Match3({
  variant,
  seed,
  enabled,
  onScore,
}: {
  variant: 'breakfast' | 'fruit'
  seed: number
  enabled: boolean
  onScore: (xp: number) => void
}) {
  const cols = variant === 'breakfast' ? 7 : 6
  const rows = 4
  const kinds = 7
  const [grid, setGrid] = useState(() => makeGrid(rows, cols, kinds))
  const [selected, setSelected] = useState<Pos | null>(null)
  const [clearing, setClearing] = useState<Set<string>>(new Set())
  const [hint, setHint] = useState<[Pos, Pos] | null>(null)
  const busy = useRef(false)
  const gridRef = useRef(grid)
  const onScoreRef = useRef(onScore)
  gridRef.current = grid
  onScoreRef.current = onScore

  useEffect(() => {
    busy.current = false
    setSelected(null)
    setClearing(new Set())
    setHint(null)
    setGrid(makeGrid(rows, cols, kinds))
  }, [seed, rows, cols, kinds])

  useEffect(() => {
    if (!enabled || busy.current) return
    const timer = setTimeout(() => {
      setHint(findHint(gridRef.current))
    }, 4200)
    return () => clearTimeout(timer)
  }, [grid, enabled])

  const resolve = useCallback(
    async (start: Cell[][]) => {
      let current = start
      let scored = false
      while (true) {
        const hits = matchesIn(current)
        if (hits.size === 0) break
        scored = true
        setClearing(hits)
        await sleep(280)
        const emptied = current.map((row, r) =>
          row.map((tile, c) => (hits.has(`${r},${c}`) ? null : tile)),
        )
        current = gravity(emptied, kinds)
        setGrid(current)
        setClearing(new Set())
        await sleep(240)
      }
      if (scored) onScoreRef.current(10)
      busy.current = false
    },
    [kinds],
  )

  const tap = (r: number, c: number) => {
    if (!enabled || busy.current) return
    setHint(null)
    const pos = { r, c }
    if (!selected) {
      setSelected(pos)
      return
    }
    if (selected.r === r && selected.c === c) {
      setSelected(null)
      return
    }
    if (!adjacent(selected, pos)) {
      setSelected(pos)
      return
    }

    const swapped = swapCells(gridRef.current, selected, pos)
    setGrid(swapped)
    setSelected(null)

    if (matchesIn(swapped).size === 0) {
      busy.current = true
      setTimeout(() => {
        setGrid(gridRef.current === swapped ? swapCells(swapped, selected, pos) : gridRef.current)
        busy.current = false
      }, 220)
      return
    }

    busy.current = true
    void resolve(swapped)
  }

  const TileArt = variant === 'breakfast' ? BreakfastTile : FruitTile
  const hintKeys = hint
    ? new Set([keyOf(hint[0]), keyOf(hint[1])])
    : new Set<string>()

  return (
    <div
      className={`m3 m3--${variant}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {grid.map((row, r) =>
        row.map((tile, c) => {
          const id = keyOf({ r, c })
          const isOn = selected?.r === r && selected?.c === c
          const isClear = clearing.has(id)
          const isHint = hintKeys.has(id)
          return (
            <motion.button
              key={tile.id}
              className={`m3__cell${isOn ? ' is-on' : ''}${isHint ? ' is-hint' : ''}`}
              onClick={() => tap(r, c)}
              layout
              initial={{ scale: 0.55, y: -16, opacity: 0 }}
              animate={
                isClear
                  ? { scale: 0, rotate: 18, opacity: 0, y: 0 }
                  : isOn
                    ? { scale: 1.08, y: 0, opacity: 1, rotate: 0 }
                    : { scale: 1, y: 0, opacity: 1, rotate: 0 }
              }
              transition={
                isClear
                  ? { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                  : { type: 'spring', stiffness: 520, damping: 28 }
              }
              whileTap={{ scale: 0.92 }}
              aria-label="Фишка"
            >
              <TileArt kind={tile.kind} />
              <AnimatePresence>
                {isClear && (
                  <motion.span
                    className="m3__pop"
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          )
        }),
      )}
    </div>
  )
}
