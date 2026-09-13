import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { CustomizeScreen } from './screens/CustomizeScreen'
import { GameStage } from './screens/GameStage'
import { LevelUpScreen } from './screens/LevelUpScreen'
import { MenuFrame } from './screens/MenuFrame'
import { NewStickerScreen } from './screens/NewStickerScreen'
import { PlayScreen } from './screens/PlayScreen'
import { QuestScreen } from './screens/QuestScreen'
import { ClaimErrorSheet, StickerSheet, StreakSheet } from './screens/Sheets'
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

function scaleCap() {
  if (window.matchMedia('(min-width: 1600px)').matches) return 1.5
  if (window.matchMedia('(min-width: 1280px)').matches) return 1.35
  if (window.matchMedia('(min-width: 960px)').matches) return 1.25
  return Number.POSITIVE_INFINITY
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
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="device-slot" ref={ref}>
      {children}
    </div>
  )
}

function Device() {
  const { screen, sheet } = useHub()
  const Extra = extras[screen]
  const showHub = screen === 'hub' || screen === 'awards' || screen === 'awards-grid'
  const showPlay = screen === 'play' || screen === 'play-alt'

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
            {sheet && typeof sheet === 'object' && (
              <StickerSheet key={sheet.sticker} stickerId={sheet.sticker} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  )
}

export default function App() {
  return (
    <HubProvider>
      <div className="stage">
        <DeviceSlot>
          <Device />
        </DeviceSlot>
        <DemoRail />
      </div>
    </HubProvider>
  )
}
