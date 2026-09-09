export type StickerCategory = 'achievements' | 'shopping' | 'seasonal'

export interface Sticker {
  id: string
  title: string
  /** How it was earned — shown in the detail sheet. */
  requirement: string
  /** Title on the opened reward card. Falls back to `title`. */
  cardTitle?: string
  /** Body copy on the opened reward card. Falls back to `requirement`. */
  cardBody?: string
  category: StickerCategory
  rare?: boolean
  earnedOn?: string
  /** What the player gets once the sticker is unlocked. */
  reward?: string
}

/** Predefined positions on the character, in % of the hero box. */
export interface StickerSlot {
  x: number
  y: number
  rotate: number
  scale: number
}

/**
 * Positions are in **body space** — 0-100 across the character's actual body,
 * mapped onto the artwork by `slotPosition` in `data/characters.ts`.
 *
 * The layout copies the decorated orange on the «ачивки» page: stickers ring
 * the body at varied angles, and the upper middle stays clear so the face
 * (where a character has one) is never covered.
 */
export const slots: StickerSlot[] = [
  { x: 20, y: 72, rotate: -14, scale: 1 },
  { x: 78, y: 68, rotate: 13, scale: 0.94 },
  { x: 16, y: 36, rotate: -9, scale: 0.9 },
  { x: 84, y: 32, rotate: 15, scale: 0.88 },
  { x: 52, y: 84, rotate: -4, scale: 0.86 },
  { x: 50, y: 56, rotate: -20, scale: 0.82 },
]

/**
 * The full sticker set from the Figma «ачивки» page — 24 pieces of real
 * artwork. Titles are transcribed from the stickers themselves.
 */
export const stickers: Sticker[] = [
  {
    id: 'plus-50',
    title: '+50 XP',
    cardTitle: 'Званный гость',
    requirement: 'Заходи 7 дней подряд',
    cardBody: 'Заходи 7 дней подряд — получи −10%\nНа онлайн-покупку',
    category: 'achievements',
    rare: true,
    earnedOn: '12 августа',
  },
  {
    id: 'tri-dnya',
    title: '3 дня подряд',
    requirement: 'Заходи 3 дня подряд',
    category: 'achievements',
    earnedOn: '18 июля',
  },
  {
    id: 'plus-100',
    title: '+100 XP',
    requirement: 'Пройди 10 раундов',
    category: 'achievements',
    rare: true,
    earnedOn: '8 августа',
  },
  {
    id: 'sezon-leto',
    title: 'Сезон лето',
    requirement: 'Участвуй в летнем событии',
    category: 'seasonal',
    rare: true,
    reward: 'Сезонный промокод −10%',
  },
  {
    id: 'ekspert-vkusa',
    title: 'Эксперт вкуса',
    requirement: 'Попробуй 5 новых продуктов',
    category: 'shopping',
    earnedOn: '24 июля',
  },
  {
    id: 'fruktovaya-komanda',
    title: 'Фруктовая команда',
    requirement: 'Собери 4 фруктовых стикера',
    category: 'achievements',
    rare: true,
    earnedOn: '10 августа',
  },
  {
    id: 'osoby-sticker',
    title: 'Особый стикер',
    requirement: 'Собери 12 стикеров в коллекцию',
    category: 'achievements',
    rare: true,
    reward: 'Промокод −15% на онлайн-покупку',
  },
  {
    id: 'pervy-shag',
    title: 'Первый шаг',
    requirement: 'Сыграй первый раунд',
    category: 'achievements',
    earnedOn: '14 июля',
  },
  {
    id: 'soberi-zavtrak',
    title: 'Собери завтрак',
    requirement: 'Собери полезную корзину',
    category: 'shopping',
    earnedOn: '26 июля',
  },
  {
    id: 'kollektsioner',
    title: 'Коллекционер',
    requirement: 'Собери 20 стикеров',
    category: 'achievements',
    reward: 'Промокод на 300 ₽',
  },
  {
    id: 'interes',
    title: 'Интерес',
    requirement: 'Заходи в игру каждый день',
    category: 'achievements',
    earnedOn: '3 августа',
  },
  {
    id: 'druzya',
    title: 'Друзья',
    requirement: 'Играй вместе с друзьями',
    category: 'achievements',
    earnedOn: '5 августа',
  },
  {
    id: 'sezonnaya-aktivnost',
    title: 'Сезонная активность',
    requirement: 'Участвуй в сезонном событии',
    category: 'seasonal',
    earnedOn: '4 августа',
  },
  {
    id: 'poprobuy-novoe',
    title: 'Попробуй новое',
    requirement: 'Купи продукт из подборки',
    category: 'shopping',
    earnedOn: '22 июля',
  },
  {
    id: 'bolshaya-pokupka',
    title: 'Большая покупка',
    requirement: 'Собери большую корзину',
    category: 'shopping',
    earnedOn: '29 июля',
  },
  {
    id: 'dobrye-dela',
    title: 'Добрые дела',
    requirement: 'Поддержи благотворительность',
    category: 'shopping',
    earnedOn: '31 июля',
  },
  {
    id: 'energiya',
    title: 'Энергия',
    requirement: 'Купи 2 продукта из подборки',
    category: 'shopping',
    earnedOn: '6 августа',
  },
  {
    id: 'stabilnost',
    title: 'Стабильность',
    requirement: 'Заходи 14 дней подряд',
    category: 'achievements',
    earnedOn: '9 августа',
  },
  {
    id: 'lyubimy-magazin',
    title: 'Любимый магазин',
    requirement: 'Заходи в один магазин 5 раз',
    category: 'shopping',
    earnedOn: '30 июля',
  },
  {
    id: 'kollektsiya',
    title: 'Коллекция',
    requirement: 'Открой свою коллекцию',
    category: 'achievements',
    rare: true,
    earnedOn: '15 июля',
  },
  {
    id: 'sem-dney',
    title: '7 дней вместе',
    requirement: 'Заходи 7 дней в приложение',
    category: 'achievements',
    earnedOn: '21 июля',
  },
  {
    id: 'zabota',
    title: 'Забота',
    requirement: 'Собери полезную корзину',
    category: 'shopping',
    earnedOn: '28 июля',
  },
  {
    id: 'uroven-10',
    title: 'Уровень 10',
    requirement: 'Достигни 10 уровня',
    category: 'achievements',
    reward: 'Промокод −20% и +200 XP',
  },
  {
    id: 'novy-obraz',
    title: 'Новый образ',
    requirement: 'Открой новый вид персонажа',
    category: 'achievements',
  },
]

/**
 * The collection exactly as the «Награды» frames lay it out (18:4087 and
 * 18:4346): eight earned stickers in this order, then grey medallions. The
 * featured frame lifts «+50 XP» into its reward card, so it shows seven.
 */
export const COLLECTION_ORDER = [
  'plus-50',
  'novy-obraz',
  'zabota',
  'lyubimy-magazin',
  'druzya',
  'plus-100',
  'sem-dney',
  'energiya',
]

/**
 * Locked achievements shown as grey previews after the earned set.
 * Each one has a how-to and a reward (promo / XP) on the opened card.
 */
export const LOCKED_ORDER = [
  'osoby-sticker',
  'uroven-10',
  'kollektsioner',
  'sezon-leto',
]

export const stickerById = (id: string) => stickers.find((s) => s.id === id)

export function awardCopy(id: string) {
  const sticker = stickerById(id)
  return {
    title: sticker?.cardTitle ?? sticker?.title ?? '',
    body: sticker?.cardBody ?? sticker?.requirement ?? '',
    requirement: sticker?.requirement ?? '',
    reward: sticker?.reward ?? 'Стикер в коллекцию',
  }
}

/** Awarded with the next promo code — the reward the demo loop hands over. */
export const REWARD_STICKER = 'osoby-sticker'

/** Unlocked on open: the eight the frames show as earned. */
export const initiallyUnlocked = COLLECTION_ORDER

/**
 * Empty on open, because the frames show the characters clean. Stickers only
 * appear on the hero once the user has placed one.
 */
export const initiallyPlaced: string[] = []
