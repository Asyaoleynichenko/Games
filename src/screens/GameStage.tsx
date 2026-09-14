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
import { MenuSheet, scrollMenuTo } from '../components/frame/MenuSheet'
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
    hubPhase,
    hubSheet,
    setHubPhase,
    setHubSheet,
  } = useHub()

  const { ref, fruitRef, progress, onScroll, onFruitScroll, jumpTo } = useThemePager()
  const curtainRef = useRef<HubCurtainHandle>(null)
  const [curtainTop, setCurtainTop] = useState(
    hubSheet === 'lowered'
      ? HUB_SHEET_LOWERED
      : hubSheet === 'expanded'
        ? HUB_SHEET_EXPANDED
        : HUB_SHEET,
  )
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

  useEffect(() => {
    curtainRef.current?.snapTo(hubSheet)
  }, [hubSheet])

  const openGame = (id?: string) => {
    if (id) {
      const index = characters.findIndex((item) => item.id === id)
      if (index >= 0 && index !== characterIndex) jumpTo(index)
    }
    openSheet('game-intro')
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
        onPick={openGame}
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
          stop={hubSheet}
          onTop={onCurtainTop}
        >
          <div className="frame__canvas">
            <MenuSheet
              phase={hubPhase}
              onRetry={() => setHubPhase('ready')}
              onBeforeScroll={() => {
                if (hubSheet === 'expanded') return false
                setHubSheet('expanded')
                curtainRef.current?.snapTo('expanded')
                return true
              }}
              onAction={(target) => {
                if (target === 'quest') goto('quest')
                else if (target === 'game') openSheet('game-intro')
                else openSheet('streak')
              }}
            />
          </div>
        </HubCurtain>
      )}

      {mode === 'awards' && (
        <div
          className="frame__scroll frame__scroll--glass frame__scroll--awards"
          style={{ bottom: 0 }}
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

      {mode === 'hub' && hubPhase === 'loading' && (
        <div className="status-toast">Загружаем задания</div>
      )}
      {mode === 'hub' && hubPhase === 'offline' && (
        <div className="status-toast">Нет сети</div>
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
          setHubPhase('ready')
          setHubSheet('collapsed')
          curtainRef.current?.snapTo('collapsed')
          scrollMenuTo('menu-gain')
          goto('hub')
        }}
        onCatalog={() => openSheet('catalog')}
        onClubs={() => goto('awards-grid')}
        onProfile={() => {
          if (mode !== 'hub') {
            goto('menu')
            return
          }
          setHubSheet('expanded')
          curtainRef.current?.snapTo('expanded')
          scrollMenuTo('menu-data', 320)
        }}
      />
    </div>
  )
}
