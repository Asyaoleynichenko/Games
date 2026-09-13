import { ui } from '../assets'

/**
 * The ten frames handed over from the Figma file 🛒 (page «экраны»).
 *
 * Every screen in this prototype is one of these frames, so the node id is
 * kept next to each one — that is the only reliable way to re-check a layout
 * or re-export an asset later. The frames fall into three layouts:
 *
 *   hub    — themed background, character carousel, XP block, profile sheet
 *   play   — the same top half, plus «Играть» and a 361x215 media block
 *   awards — white screen, sticker grid, optionally a featured reward card
 *
 * All geometry in the components is written in the frame's own coordinate
 * space (393x852 for the phone frames), which matches the device shell.
 */
export type FrameId =
  | 'hub-egg'
  | 'play-egg'
  | 'hub-toast'
  | 'play-toast'
  | 'hub-lemon'
  | 'play-lemon'
  | 'play-lemon-alt'
  | 'menu'
  | 'awards-grid'
  | 'awards'

export type FrameLayout = 'hub' | 'play' | 'menu' | 'awards'

export interface FrameSpec {
  id: FrameId
  /** Figma node id — `?node-id=` in the file URL. */
  node: string
  /** Frame name as it reads in Figma. */
  figmaName: string
  /** Short label for the demo rail. */
  label: string
  layout: FrameLayout
  /** Frame size in Figma. Shorter frames are blocks, not full screens. */
  size: { w: number; h: number }
  /** Which character the hub/play frames are centred on. */
  character?: 'egg' | 'toast' | 'lemon'
  /** The 361x215 block under «Играть». */
  media?: string
  /** Awards frames: whether the «Званный гость» card is present. */
  featured?: boolean
}

export const frames: FrameSpec[] = [
  {
    id: 'hub-egg',
    node: '18:3782',
    figmaName: 'iPhone 16 - 10',
    label: 'Хаб — яичница',
    layout: 'hub',
    size: { w: 393, h: 852 },
    character: 'egg',
  },
  {
    id: 'play-egg',
    node: '18:3916',
    figmaName: 'iPhone 16 - 11',
    label: 'Игра — яичница',
    layout: 'play',
    size: { w: 393, h: 852 },
    character: 'egg',
    media: ui.boardBreakfast,
  },
  {
    id: 'hub-toast',
    node: '18:3837',
    figmaName: 'iPhone 16 - 12',
    label: 'Хаб — тост',
    layout: 'hub',
    size: { w: 393, h: 852 },
    character: 'toast',
  },
  {
    id: 'play-toast',
    node: '18:3892',
    figmaName: 'iPhone 16 - 13',
    label: 'Игра — тост',
    layout: 'play',
    size: { w: 393, h: 852 },
    character: 'toast',
    media: ui.photoToastStack,
  },
  {
    id: 'hub-lemon',
    node: '18:3941',
    figmaName: 'iPhone 16 - 14',
    label: 'Хаб — лимон',
    layout: 'hub',
    size: { w: 393, h: 852 },
    character: 'lemon',
  },
  {
    id: 'play-lemon',
    node: '18:3996',
    figmaName: 'iPhone 16 - 15',
    label: 'Игра — лимон',
    layout: 'play',
    size: { w: 393, h: 852 },
    character: 'lemon',
    media: ui.boardFruit,
  },
  {
    id: 'play-lemon-alt',
    node: '18:4464',
    figmaName: 'iPhone 16 - 16',
    label: 'Игра — лимон, раунд 2',
    layout: 'play',
    size: { w: 393, h: 852 },
    character: 'lemon',
    media: ui.boardFruitB,
  },
  {
    id: 'menu',
    node: '25:4917',
    figmaName: 'Menu',
    label: 'Профиль',
    layout: 'menu',
    size: { w: 393, h: 1020 },
  },
  {
    id: 'awards-grid',
    node: '18:4087',
    figmaName: 'Main Frame',
    label: 'Награды — сетка',
    layout: 'awards',
    size: { w: 393, h: 484 },
    featured: false,
  },
  {
    id: 'awards',
    node: '18:4346',
    figmaName: 'Screen',
    label: 'Награды',
    layout: 'awards',
    size: { w: 393, h: 788 },
    featured: true,
  },
]

export const frameById = (id: FrameId) =>
  frames.find((f) => f.id === id) ?? frames[0]

/** The play frame that «Играть» leads to, per character. */
export const playFrameFor: Record<string, FrameId> = {
  egg: 'play-egg',
  toast: 'play-toast',
  lemon: 'play-lemon',
}

/** The hub frame each character owns. */
export const hubFrameFor: Record<string, FrameId> = {
  egg: 'hub-egg',
  toast: 'hub-toast',
  lemon: 'hub-lemon',
}

export interface HardenedState {
  id: string
  node: string
  label: string
}

/** Figma section 133:725 — HARDENED / Complete state map + mini-game. */
export const hardenedStates: HardenedState[] = [
  { id: 'hub-default', node: '133:726', label: 'Хаб — играть' },
  { id: 'hub-menu', node: '133:768', label: 'Хаб — меню' },
  { id: 'hub-loading', node: '133:919', label: 'Хаб — загрузка' },
  { id: 'hub-offline', node: '133:1097', label: 'Хаб — нет сети' },
  { id: 'hub-empty', node: '133:1280', label: 'Хаб — нет заданий' },
  { id: 'rewards-grid', node: '133:1458', label: 'Награды — сетка' },
  { id: 'rewards-detail', node: '133:1579', label: 'Награды — деталь' },
  { id: 'tetris-tutorial', node: '133:1672', label: 'Тетрис — туториал' },
  { id: 'tetris-playing', node: '133:1714', label: 'Тетрис — игра' },
  { id: 'tetris-paused', node: '133:1756', label: 'Тетрис — пауза' },
  { id: 'tetris-success', node: '133:1798', label: 'Тетрис — успех' },
  { id: 'tetris-failure', node: '133:1840', label: 'Тетрис — проигрыш' },
  { id: 'rewards-claim-error', node: '133:1882', label: 'Награда — ошибка' },
  { id: 'hub-long', node: '133:2040', label: 'Хаб — длинный' },
  { id: 'tetris-loading', node: '148:842', label: 'Тетрис — загрузка' },
  { id: 'tetris-offline', node: '148:951', label: 'Тетрис — нет связи' },
]
