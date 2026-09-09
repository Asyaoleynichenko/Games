export interface HubAction {
  id: string
  xp: number
  label: string
  target: 'quest' | 'game' | 'streak'
}

/** The four «Как получить больше» cards, verbatim from Figma. */
export const hubActions: HubAction[] = [
  { id: 'basket', xp: 40, label: 'Собери полезную корзину', target: 'quest' },
  { id: 'podborka', xp: 20, label: 'Купи 2 продукта из подборки', target: 'quest' },
  { id: 'round', xp: 10, label: 'Сыграй один раунд', target: 'game' },
  { id: 'seven-days', xp: 30, label: 'Заходи 7 дней в приложение', target: 'streak' },
]

export interface QuestProduct {
  id: string
  name: string
  glyph: string
}

export const basketQuest = {
  id: 'basket',
  title: 'Собери полезную корзину',
  description: 'Добавь 3 продукта из подборки и получи XP',
  reward: 150,
  startProgress: 2,
  products: [
    { id: 'milk', name: 'Молоко', glyph: '🥛' },
    { id: 'hlopya', name: 'Хлопья', glyph: '🥣' },
    { id: 'banany', name: 'Бананы', glyph: '🍌' },
  ] as QuestProduct[],
}

export interface Reward {
  id: string
  title: string
  subtitle: string
  stickerId?: string
}

export const availableRewards: Reward[] = [
  {
    id: 'zvanny-gost',
    title: 'Званный гость',
    subtitle: 'Заходи 7 дней подряд — получи −10% на онлайн-покупку',
    stickerId: 'plus-50',
  },
]

export const claimedRewards: Reward[] = [
  { id: 'promo-coffee', title: 'Бесплатный кофе', subtitle: 'Получено 8 августа' },
  { id: 'promo-bakery', title: '−15% на выпечку', subtitle: 'Получено 30 июля' },
]

/** The «Мои сервисы» tab row on the hub, verbatim from Figma. */
export const serviceTabs = ['Мои\u00a0сервисы', 'Акции', 'Заказы', 'Мои\u00a0данные']

export const menuTiles = [
  { id: 'favorites', label: 'Избранное', art: 'tileFavorites' },
  { id: 'about', label: 'О сервисе', art: 'tileAbout' },
  { id: 'delivery', label: 'Условия доставки и\u00a0оплаты', art: 'tileDelivery' },
  { id: 'help', label: 'Я помогаю', art: 'tileHelp' },
] as const

/** Figma 50:2116 — 40px rows, last row 28px. */
export const menuLinks = [
  'Моя\u00a0выгода',
  'Подарочные сертификаты',
  'Способы оплаты',
  'Настройки уведомлений',
  'Связаться с нами',
  'Программа спаси лес',
  'Клубы',
]
