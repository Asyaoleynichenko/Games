import { characters } from './data/characters'
import { frames, hardenedStates, type FrameId } from './data/frames'
import {
  useHub,
  type HubPhase,
  type ScreenId,
  type TetrisPhase,
} from './state/HubState'

/**
 * Review panel outside the device frame — for walking the flow during a demo.
 * Not part of the product UI. Hidden below the desktop breakpoint.
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
    hubPhase,
    hubMenuOpen,
    tetrisPhase,
    sheet,
    setCharacterIndex,
    goto,
    openSheet,
    resetDemo,
    addXp,
    pendingLevelUp,
    setHubPhase,
    setHubMenuOpen,
    openTetris,
  } = useHub()

  const openFrame = (id: FrameId) => {
    const route = frameRoute[id]
    if (route.character !== undefined) setCharacterIndex(route.character)
    if (route.screen === 'hub') {
      setHubPhase('ready')
      setHubMenuOpen(true)
    }
    goto(route.screen)
  }

  const openHardened = (id: string) => {
    const hub = (phase: HubPhase, menu: boolean) => {
      setHubPhase(phase)
      setHubMenuOpen(menu)
      goto('hub')
    }
    const tetris = (phase: TetrisPhase) => openTetris(phase)

    if (id === 'hub-default') hub('ready', false)
    else if (id === 'hub-menu') hub('ready', true)
    else if (id === 'hub-loading') hub('loading', true)
    else if (id === 'hub-offline') hub('offline', true)
    else if (id === 'hub-empty') hub('empty', true)
    else if (id === 'hub-long') hub('long', true)
    else if (id === 'rewards-grid') goto('awards-grid')
    else if (id === 'rewards-detail') goto('awards')
    else if (id === 'rewards-claim-error') {
      goto('awards')
      openSheet('claim-error')
    } else if (id === 'tetris-tutorial') tetris('tutorial')
    else if (id === 'tetris-playing') tetris('playing')
    else if (id === 'tetris-paused') tetris('paused')
    else if (id === 'tetris-success') tetris('success')
    else if (id === 'tetris-failure') tetris('failure')
    else if (id === 'tetris-loading') tetris('loading')
    else if (id === 'tetris-offline') tetris('offline')
  }

  const isHardenedOn = (id: string) => {
    if (id === 'hub-default') {
      return screen === 'hub' && hubPhase === 'ready' && !hubMenuOpen
    }
    if (id === 'hub-menu') {
      return screen === 'hub' && hubPhase === 'ready' && hubMenuOpen
    }
    if (id === 'hub-loading') return screen === 'hub' && hubPhase === 'loading'
    if (id === 'hub-offline') return screen === 'hub' && hubPhase === 'offline'
    if (id === 'hub-empty') return screen === 'hub' && hubPhase === 'empty'
    if (id === 'hub-long') return screen === 'hub' && hubPhase === 'long'
    if (id === 'rewards-grid') return screen === 'awards-grid'
    if (id === 'rewards-detail') return screen === 'awards' && sheet !== 'claim-error'
    if (id === 'rewards-claim-error') return sheet === 'claim-error'
    if (id === 'tetris-tutorial') return screen === 'tetris' && tetrisPhase === 'tutorial'
    if (id === 'tetris-playing') return screen === 'tetris' && tetrisPhase === 'playing'
    if (id === 'tetris-paused') return screen === 'tetris' && tetrisPhase === 'paused'
    if (id === 'tetris-success') return screen === 'tetris' && tetrisPhase === 'success'
    if (id === 'tetris-failure') return screen === 'tetris' && tetrisPhase === 'failure'
    if (id === 'tetris-loading') return screen === 'tetris' && tetrisPhase === 'loading'
    if (id === 'tetris-offline') return screen === 'tetris' && tetrisPhase === 'offline'
    return false
  }

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
      <div className="demo-rail__label">Карта состояний</div>
      <div className="demo-rail__list">
        {hardenedStates.map((state) => (
          <button
            key={state.id}
            onClick={() => openHardened(state.id)}
            className={`demo-rail__row${isHardenedOn(state.id) ? ' is-on' : ''}`}
            title={state.node}
          >
            <span>{state.label}</span>
            <span className="demo-rail__node">{state.node}</span>
          </button>
        ))}
      </div>

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
