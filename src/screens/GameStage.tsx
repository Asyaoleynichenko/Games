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
const NAV_DESIGN = 73

function collapsedTopFor(frameH: number, xpBottomPx?: number) {
  const nav = NAV_DESIGN
  const v = frameH / 852
  const s = Math.min(1, (frameH / 852) * 1.25)
  const xpTop =
    frameH <= 568 ? 220 : frameH <= 640 ? 240 : frameH <= 700 ? 255 : frameH <= 740 ? 270 : 341
  const fallbackXp = xpTop * v + 122 * s
  const belowXp = (xpBottomPx ?? fallbackXp) + 20
  const peek = frameH < 740 ? 268 : 312
  const topPx = Math.max(belowXp, frameH - nav - peek)
  return Math.round((Math.max(88, Math.min(topPx, frameH * 0.62)) / frameH) * 852)
}

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
  const [compactLand, setCompactLand] = useState(false)
  const [collapsedTop, setCollapsedTop] = useState(HUB_SHEET)

  const mode = screen === 'awards' || screen === 'awards-grid' ? 'awards' : 'hub'
  const reveal =
    (curtainTop - collapsedTop) / Math.max(1, HUB_SHEET_LOWERED - collapsedTop)
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

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 540px)')
    const sync = () => setCompactLand(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const frame = document.querySelector('.frame')
    if (!frame) return
    const apply = () => {
      const xp = frame.querySelector('.xpinfo')
      const frameBox = frame.getBoundingClientRect()
      const xpBox = xp?.getBoundingClientRect()
      const xpBottom = xpBox ? xpBox.bottom - frameBox.top : undefined
      setCollapsedTop(collapsedTopFor(frame.clientHeight || 852, xpBottom))
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(frame)
    const xp = frame.querySelector('.xpinfo')
    if (xp) observer.observe(xp)
    return () => observer.disconnect()
  }, [])

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
          revealed={playRevealed || compactLand}
        />
      )}

      <XpInfo onTheme={onThemeFor(progress)} />

      {mode === 'hub' && (
        <HubCurtain
          ref={curtainRef}
          collapsedTop={collapsedTop}
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
