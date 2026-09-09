export type FeaturedMotion = 'spin' | 'spin-rev' | 'shine' | 'pulse' | 'drift'
export type FeaturedRayKind = 'soft' | 'lines' | 'needles'

export interface FeaturedTheme {
  from: string
  mid: string
  rayKind: FeaturedRayKind
  rayFrom: string
  rayTo: string
  motion: FeaturedMotion
  seed: number
}

/** Colours follow the sticker artwork so each opened card reads as its own world. */
const THEMES: Record<string, FeaturedTheme> = {
  'plus-50': {
    from: '#6a1bff',
    mid: '#9747ff',
    rayKind: 'lines',
    rayFrom: '#ffffff',
    rayTo: '#e4c2ff',
    motion: 'spin',
    seed: 11,
  },
  'novy-obraz': {
    from: '#e59a00',
    mid: '#ffd24a',
    rayKind: 'soft',
    rayFrom: '#fff8d6',
    rayTo: '#ffe066',
    motion: 'shine',
    seed: 21,
  },
  'zabota': {
    from: '#ff6a00',
    mid: '#ff9d00',
    rayKind: 'needles',
    rayFrom: '#fff1cc',
    rayTo: '#ffb347',
    motion: 'spin-rev',
    seed: 31,
  },
  'lyubimy-magazin': {
    from: '#ff2d7b',
    mid: '#ff47fc',
    rayKind: 'lines',
    rayFrom: '#ffffff',
    rayTo: '#ff9ad8',
    motion: 'pulse',
    seed: 41,
  },
  'druzya': {
    from: '#c41230',
    mid: '#ff5a6a',
    rayKind: 'soft',
    rayFrom: '#ffd4da',
    rayTo: '#ff8a96',
    motion: 'drift',
    seed: 51,
  },
  'plus-100': {
    from: '#1553e8',
    mid: '#4aa3ff',
    rayKind: 'lines',
    rayFrom: '#eaf4ff',
    rayTo: '#7ec8ff',
    motion: 'spin',
    seed: 61,
  },
  'sem-dney': {
    from: '#5c6578',
    mid: '#9aa3b5',
    rayKind: 'needles',
    rayFrom: '#ffffff',
    rayTo: '#d0d7e6',
    motion: 'shine',
    seed: 71,
  },
  'energiya': {
    from: '#0e8f58',
    mid: '#20bf7a',
    rayKind: 'soft',
    rayFrom: '#e3ffe8',
    rayTo: '#7ae0a8',
    motion: 'pulse',
    seed: 81,
  },
  'osoby-sticker': {
    from: '#4b16d8',
    mid: '#8b5cff',
    rayKind: 'needles',
    rayFrom: '#f3e8ff',
    rayTo: '#c9a6ff',
    motion: 'spin-rev',
    seed: 91,
  },
  'tri-dnya': {
    from: '#0f9aa8',
    mid: '#2fd0c8',
    rayKind: 'lines',
    rayFrom: '#e7fffd',
    rayTo: '#7eefe8',
    motion: 'drift',
    seed: 101,
  },
  'sezon-leto': {
    from: '#ff8a00',
    mid: '#ffd428',
    rayKind: 'soft',
    rayFrom: '#fff4c4',
    rayTo: '#ffd86a',
    motion: 'shine',
    seed: 111,
  },
  'fruktovaya-komanda': {
    from: '#d63d8a',
    mid: '#ff7ab6',
    rayKind: 'needles',
    rayFrom: '#ffe0f0',
    rayTo: '#ff9ac8',
    motion: 'spin',
    seed: 121,
  },
  kollektsioner: {
    from: '#1f6f8a',
    mid: '#3db8d4',
    rayKind: 'lines',
    rayFrom: '#e8fbff',
    rayTo: '#7ee0f2',
    motion: 'drift',
    seed: 131,
  },
  'uroven-10': {
    from: '#7a4b00',
    mid: '#e8a020',
    rayKind: 'soft',
    rayFrom: '#fff3d0',
    rayTo: '#ffd36a',
    motion: 'pulse',
    seed: 141,
  },
}

function hashId(id: string) {
  let h = 2166136261
  for (let i = 0; i < id.length; i += 1) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return h >>> 0
}

const MOTIONS: FeaturedMotion[] = ['spin', 'spin-rev', 'shine', 'pulse', 'drift']
const KINDS: FeaturedRayKind[] = ['soft', 'lines', 'needles']

export function featuredTheme(id: string): FeaturedTheme {
  const known = THEMES[id]
  if (known) return known
  const h = hashId(id)
  const hue = h % 360
  return {
    from: `hsl(${hue} 82% 38%)`,
    mid: `hsl(${hue} 78% 54%)`,
    rayKind: KINDS[h % 3],
    rayFrom: '#ffffff',
    rayTo: `hsl(${hue} 90% 78%)`,
    motion: MOTIONS[h % 5],
    seed: (h % 800) + 13,
  }
}
