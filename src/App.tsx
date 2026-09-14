import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { CustomizeScreen } from './screens/CustomizeScreen'
import { GameStage } from './screens/GameStage'
import { LevelUpScreen } from './screens/LevelUpScreen'
import { MenuFrame } from './screens/MenuFrame'
import { NewStickerScreen } from './screens/NewStickerScreen'
import { PlayScreen } from './screens/PlayScreen'
import { QuestScreen } from './screens/QuestScreen'
import {
  CatalogSheet,
  ClaimErrorSheet,
  GameIntroSheet,
  StickerSheet,
  StreakSheet,
} from './screens/Sheets'
import { TetrisScreen } from './screens/TetrisScreen'
import { DemoRail } from './DemoRail'
import { HubProvider, useHub, type ScreenId } from './state/HubState'

const extras: Partial<Record<ScreenId, () => JSX.Element>> = {
  menu: MenuFrame,
  quest: QuestScreen,
  levelup: LevelUpScreen,
  newsticker: NewStickerScreen,
  customize: CustomizeScreen,
  tetris: TetrisScreen,
}

const FRAME_W = 393
const FRAME_H = 852
const THEME_COLORS = ['#9747ff', '#ff47fc', '#ff9d00']

function scaleCap() {
  if (window.matchMedia('(min-width: 1600px) and (min-height: 800px)').matches) return 1.5
  if (window.matchMedia('(min-width: 1280px) and (min-height: 700px)').matches) return 1.35
  if (window.matchMedia('(min-width: 1100px) and (min-height: 700px)').matches) return 1.25
  return Number.POSITIVE_INFINITY
}

/** Pins the shell to the visible viewport (iOS Chrome toolbars, keyboard). */
function useVisualViewport() {
  useLayoutEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const vv = window.visualViewport
      const width = Math.max(1, Math.round(vv?.width ?? window.innerWidth))
      const height = Math.max(1, Math.round(vv?.height ?? window.innerHeight))
      root.style.setProperty('--vvw', `${width}px`)
      root.style.setProperty('--vvh', `${height}px`)
      root.style.setProperty('--vvx', `${Math.round(vv?.offsetLeft ?? 0)}px`)
      root.style.setProperty('--vvy', `${Math.round(vv?.offsetTop ?? 0)}px`)
    }
    apply()
    window.visualViewport?.addEventListener('resize', apply)
    window.visualViewport?.addEventListener('scroll', apply)
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      window.visualViewport?.removeEventListener('resize', apply)
      window.visualViewport?.removeEventListener('scroll', apply)
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])
}

/** Fits the 393×852 artboard into the slot; CSS --fit is the first-paint fallback. */
function DeviceSlot({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const slot = ref.current
    if (!slot) return

    const apply = (entry?: ResizeObserverEntry) => {
      const box = entry?.contentBoxSize?.[0]
      const width = box?.inlineSize ?? entry?.contentRect.width ?? slot.clientWidth
      const height = box?.blockSize ?? entry?.contentRect.height ?? slot.clientHeight
      const fit = Math.min(width / FRAME_W, height / FRAME_H, scaleCap())
      slot.style.setProperty('--fit', String(fit > 0 && Number.isFinite(fit) ? fit : 1))
    }

    const onResize = () => apply()
    apply()
    const observer = new ResizeObserver((entries) => apply(entries[0]))
    observer.observe(slot)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    const queries = [
      window.matchMedia('(min-width: 1100px)'),
      window.matchMedia('(min-width: 1280px)'),
      window.matchMedia('(min-width: 1600px)'),
    ]
    queries.forEach((mq) => mq.addEventListener('change', onResize))
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      queries.forEach((mq) => mq.removeEventListener('change', onResize))
    }
  }, [])

  return (
    <div className="device-slot" ref={ref}>
      {children}
    </div>
  )
}

function Device() {
  const { screen, sheet, characterIndex } = useHub()
  const Extra = extras[screen]
  const showHub = screen === 'hub' || screen === 'awards' || screen === 'awards-grid'
  const showPlay = screen === 'play' || screen === 'play-alt'

  useEffect(() => {
    const color = THEME_COLORS[characterIndex] ?? THEME_COLORS[0]
    document.documentElement.style.background = color
    document.body.style.background = color
    document.documentElement.style.setProperty('--theme-base', color)
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', color)
  }, [characterIndex])

  return (
    <LayoutGroup>
      <div className="device" data-screen={screen}>
        <div className="device__artboard">
          {showHub && <GameStage />}
          {showPlay && <PlayScreen />}
          {Extra && <Extra />}

          <AnimatePresence>
            {sheet === 'streak' && <StreakSheet key="streak" />}
            {sheet === 'claim-error' && <ClaimErrorSheet key="claim-error" />}
            {sheet === 'catalog' && <CatalogSheet key="catalog" />}
            {sheet === 'game-intro' && <GameIntroSheet key="game-intro" />}
            {sheet && typeof sheet === 'object' && (
              <StickerSheet key={sheet.sticker} stickerId={sheet.sticker} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  )
}

function Shell() {
  useVisualViewport()
  return (
    <div className="stage">
      <DeviceSlot>
        <Device />
      </DeviceSlot>
      <DemoRail />
    </div>
  )
}

export default function App() {
  return (
    <HubProvider>
      <Shell />
    </HubProvider>
  )
}
