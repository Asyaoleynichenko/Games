import { useCallback, useEffect, useRef, useState } from 'react'
import { AwardsGrid } from '../components/frame/Awards'
import {
  BlendedBackground,
  FrameHeader,
  FrameNav,
} from '../components/frame/Chrome'
import { CharacterStage } from '../components/frame/CharacterStage'
import {
  HubCurtain,
  type HubCurtainHandle,
} from '../components/frame/HubCurtain'
import { MENU_HEIGHT, MenuSheet } from '../components/frame/MenuSheet'
import { onThemeFor, useThemePager } from '../components/frame/Pager'
import { PlayDock } from '../components/frame/PlayDock'
import { XpInfo } from '../components/frame/XpInfo'
import { FloatingXp } from '../components/Ui'
import { characters } from '../data/characters'
import { useHub } from '../state/HubState'

const HUB_SHEET = 482
const HUB_SHEET_EXPANDED = 56
/** ~56px of sheet above the nav so the lowered curtain can be grabbed. */
const HUB_SHEET_LOWERED = 724

/**
 * Hub and awards. Play preview lives behind the curtain — drag the sheet
 * down to uncover «Играть» and the board, or tap «Сыграй один раунд».
 */
export function GameStage() {
  const {
    screen,
    characterIndex,
    placed,
    accessories,
    unlocked,
    lastPlaced,
    lastXpGain,
    mood,
    goto,
    openSheet,
    queueSticker,
  } = useHub()

  const { ref, fruitRef, progress, onScroll, onFruitScroll, jumpTo } = useThemePager()
  const curtainRef = useRef<HubCurtainHandle>(null)
  const [curtainTop, setCurtainTop] = useState(HUB_SHEET)
  const [openId, setOpenId] = useState<string | null>(
    screen === 'awards' ? 'plus-50' : null,
  )

  const mode = screen === 'awards' || screen === 'awards-grid' ? 'awards' : 'hub'
  const reveal =
    (curtainTop - HUB_SHEET) / Math.max(1, HUB_SHEET_LOWERED - HUB_SHEET)
  const playRevealed = reveal > 0.18
  const playLive = reveal > 0.55

  const onCurtainTop = useCallback((top: number) => setCurtainTop(top), [])

  useEffect(() => {
    if (screen === 'awards') setOpenId('plus-50')
    if (screen === 'awards-grid') setOpenId(null)
  }, [screen])

  const pickNeighbor = (id: string) => {
    const index = characters.findIndex((item) => item.id === id)
    if (index >= 0) jumpTo(index)
  }

  const canvasHeight = Math.max(540, (openId ? 480 : 64) + 520)

  return (
    <div className="frame">
      <BlendedBackground progress={progress} pace={playLive ? 1.35 : 1} />

      <CharacterStage
        fruitRef={fruitRef}
        progress={progress}
        characterIndex={characterIndex}
        placed={placed}
        accessories={accessories}
        animateIds={lastPlaced ? [lastPlaced] : []}
        mood={playLive && mood === 'idle' ? 'playing' : mood}
        scrollable
        onScroll={onFruitScroll}
        onPick={pickNeighbor}
      />

      {mode === 'hub' && (
        <PlayDock
          progress={progress}
          pagerRef={ref}
          onScroll={onScroll}
          enabled={playLive}
          docked
          revealed={playRevealed}
        />
      )}

      <XpInfo onTheme={onThemeFor(progress)} />

      {mode === 'hub' && (
        <HubCurtain
          ref={curtainRef}
          collapsedTop={HUB_SHEET}
          expandedTop={HUB_SHEET_EXPANDED}
          loweredTop={HUB_SHEET_LOWERED}
          onTop={onCurtainTop}
        >
          <div className="frame__canvas" style={{ minHeight: MENU_HEIGHT }}>
            <MenuSheet
              top={0}
              onAction={(target) => {
                if (target === 'quest') goto('quest')
                else if (target === 'game') curtainRef.current?.snapTo('lowered')
                else openSheet('streak')
              }}
            />
          </div>
        </HubCurtain>
      )}

      {mode === 'awards' && (
        <div
          className="frame__scroll frame__scroll--glass frame__scroll--awards"
          style={{ bottom: 'var(--nav-h)' }}
        >
          <div className="frame__canvas" style={{ minHeight: canvasHeight }}>
            <section className="awards-sheet" style={{ top: 0 }}>
              <h1 className="awards__title">Награды</h1>
              <AwardsGrid
                unlocked={unlocked}
                placed={placed}
                openId={openId}
                onPick={setOpenId}
                onStick={(id) => {
                  queueSticker(id)
                  goto('customize')
                }}
              />
            </section>
          </div>
        </div>
      )}

      {lastXpGain && mode === 'hub' && (
        <FloatingXp key={lastXpGain.at} amount={lastXpGain.amount} from="board" />
      )}

      <FrameHeader
        onRewards={() => {
          if (mode === 'awards') setOpenId(null)
          else goto('awards-grid')
        }}
        onTasks={() => openSheet('streak')}
      />

      <FrameNav
        onHome={() => {
          if (mode === 'hub' && playRevealed) curtainRef.current?.snapTo('collapsed')
          else goto('hub')
        }}
        onProfile={() => goto('menu')}
      />
    </div>
  )
}
