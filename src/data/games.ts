export interface GameIntro {
  title: string
  lead: string
  how: string
}

/** Copy for the pre-play modal. All three characters open Завтрак-тетрис. */
export const gameIntro: Record<string, GameIntro> = {
  egg: {
    title: 'Завтрак-тетрис',
    lead: 'Собери полные ряды из завтрака — и получи XP за раунд.',
    how: 'Свайп влево и вправо двигает фигуру, тап по центру поворачивает её. Закрой 10 линий, пока стакан не переполнится.',
  },
  toast: {
    title: 'Завтрак-тетрис',
    lead: 'Тост помогает собирать ряды быстрее. Одна партия — пачка XP.',
    how: 'Двигай фигуры влево и вправо, тапай по центру, чтобы повернуть. Нужно закрыть 10 линий за раунд.',
  },
  lemon: {
    title: 'Завтрак-тетрис',
    lead: 'Лимон любит порядок: чем больше чистых линий, тем больше XP.',
    how: 'Свайп двигает деталь, тап по центру крутит. Собери 10 линий — и забери награду.',
  },
}

export function introFor(id: string): GameIntro {
  return gameIntro[id] ?? gameIntro.egg
}
