import { useEffect } from 'react'
import {
  BlendedBackground,
  FrameHeader,
  FrameNav,
} from '../components/frame/Chrome'
import { CharacterStage } from '../components/frame/CharacterStage'
import { onThemeFor, useThemePager } from '../components/frame/Pager'
import { PlayDock } from '../components/frame/PlayDock'
import { XpInfo } from '../components/frame/XpInfo'
import { FloatingXp } from '../components/Ui'
import { characters } from '../data/characters'
import { useHub } from '../state/HubState'

/**
 * Dedicated play window — the Figma game frames (яичница / тост / лимон).
 * The hub also uncovers the same dock when the curtain is dragged down.
 */
export function PlayScreen() {
  const {
    characterIndex,
    placed,
    accessories,
    lastPlaced,
    lastXpGain,
    pendingLevelUp,
    mood,
    goto,
    openSheet,
  } = useHub()

  const { ref, fruitRef, progress, onScroll, onFruitScroll, jumpTo } = useThemePager()

  useEffect(() => {
    if (!pendingLevelUp) return
    const timer = setTimeout(() => goto('levelup'), 1600)
    return () => clearTimeout(timer)
  }, [pendingLevelUp, goto])

  const pickNeighbor = (id: string) => {
    const index = characters.findIndex((item) => item.id === id)
    if (index >= 0) jumpTo(index)
  }

  return (
    <div className="frame">
      <BlendedBackground progress={progress} pace={1.35} />

      <CharacterStage
        fruitRef={fruitRef}
        progress={progress}
        characterIndex={characterIndex}
        placed={placed}
        accessories={accessories}
        animateIds={lastPlaced ? [lastPlaced] : []}
        mood={mood === 'idle' ? 'playing' : mood}
        scrollable
        onScroll={onFruitScroll}
        onPick={pickNeighbor}
      />

      <PlayDock
        progress={progress}
        pagerRef={ref}
        onScroll={onScroll}
        enabled
      />

      <XpInfo onTheme={onThemeFor(progress)} />

      {lastXpGain && (
        <FloatingXp key={lastXpGain.at} amount={lastXpGain.amount} from="board" />
      )}

      <FrameHeader
        onRewards={() => goto('awards-grid')}
        onTasks={() => openSheet('streak')}
      />
      <FrameNav onHome={() => goto('hub')} onProfile={() => goto('menu')} />
    </div>
  )
}
