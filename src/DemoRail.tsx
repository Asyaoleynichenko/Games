import { characters } from './data/characters'
import { frames, type FrameId } from './data/frames'
import { useHub, type ScreenId } from './state/HubState'

/**
 * Review panel outside the device frame — for walking the flow during a demo.
 * Not part of the product UI. Hidden below the desktop breakpoint.
 *
 * The top list is the ten handed-over Figma frames, labelled with their node
 * ids so a screen can be checked against the source. Below it are the four
 * screens that carry the reward loop, which the source file does not cover.
 */
const frameRoute: Record<FrameId, { screen: ScreenId; character?: number }> = {
  'hub-egg': { screen: 'hub', character: 0 },
  'play-egg': { screen: 'play', character: 0 },
  'hub-toast': { screen: 'hub', character: 1 },
  'play-toast': { screen: 'play', character: 1 },
  'hub-lemon': { screen: 'hub', character: 2 },
  'play-lemon': { screen: 'play', character: 2 },
  'play-lemon-alt': { screen: 'play-alt', character: 2 },
  menu: { screen: 'menu' },
  'awards-grid': { screen: 'awards-grid' },
  awards: { screen: 'awards' },
}

const loopScreens: { id: ScreenId; label: string }[] = [
  { id: 'quest', label: 'Задание' },
  { id: 'levelup', label: 'Новый уровень' },
  { id: 'newsticker', label: 'Новый стикер' },
  { id: 'customize', label: 'Кастомизация' },
]

export function DemoRail() {
  const {
    screen,
    level,
    xp,
    xpMax,
    placed,
    unlocked,
    characterIndex,
    setCharacterIndex,
    goto,
    openSheet,
    resetDemo,
    addXp,
    pendingLevelUp,
  } = useHub()

  const openFrame = (id: FrameId) => {
    const route = frameRoute[id]
    if (route.character !== undefined) setCharacterIndex(route.character)
    goto(route.screen)
  }

  // The milestone screen only makes sense mid-level-up, so top up when
  // jumping straight to it.
  const openLoop = (id: ScreenId) => {
    if (id === 'levelup' && !pendingLevelUp && xp < xpMax) addXp(xpMax - xp)
    goto(id)
  }

  const isActive = (id: FrameId) => {
    const route = frameRoute[id]
    if (route.screen !== screen) return false
    return route.character === undefined || route.character === characterIndex
  }

  return (
    <aside className="demo-rail">
      <div className="demo-rail__label">Экраны из Figma</div>
      <div className="demo-rail__list">
        {frames.map((frame) => (
          <button
            key={frame.id}
            onClick={() => openFrame(frame.id)}
            className={`demo-rail__row${isActive(frame.id) ? ' is-on' : ''}`}
            title={`${frame.figmaName} · ${frame.node}`}
          >
            <span>{frame.label}</span>
            <span className="demo-rail__node">{frame.node}</span>
          </button>
        ))}
      </div>

      <div className="demo-rail__label">Цикл награды</div>
      <div className="demo-rail__list">
        {loopScreens.map((item) => (
          <button
            key={item.id}
            onClick={() => openLoop(item.id)}
            className={`demo-rail__row${screen === item.id ? ' is-on' : ''}`}
          >
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={() => openSheet('streak')} className="demo-rail__row">
          <span>Дни вместе</span>
        </button>
      </div>

      <div className="demo-rail__label">Персонаж</div>
      <div className="demo-rail__chars">
        {characters.map((character, index) => (
          <button
            key={character.id}
            onClick={() => setCharacterIndex(index)}
            title={character.name}
            className={`demo-rail__char${index === characterIndex ? ' is-on' : ''}`}
          >
            <img src={character.art} alt={character.name} />
          </button>
        ))}
      </div>

      <div className="demo-rail__meta">
        <div>
          {screen} · {level} уровень · {xp} / {xpMax} XP
        </div>
        <div>{placed.length} стикеров на персонаже</div>
        <div>{unlocked.length} собрано</div>
      </div>

      <button onClick={resetDemo} className="demo-rail__reset">
        Сбросить демо
      </button>
    </aside>
  )
}
