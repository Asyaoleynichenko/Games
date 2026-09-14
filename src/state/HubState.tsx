import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { characters } from '../data/characters'
import {
  REWARD_STICKER,
  initiallyPlaced,
  initiallyUnlocked,
  slots,
} from '../data/stickers'

/**
 * The ten Figma frames plus the four screens that carry the reward loop.
 *
 * `hub` and `play` each stand for three of the frames — which one renders
 * follows the selected character, which is what drives the carousel.
 */
export type ScreenId =
  | 'hub'
  | 'play'
  | 'play-alt'
  | 'menu'
  | 'awards'
  | 'awards-grid'
  | 'quest'
  | 'levelup'
  | 'newsticker'
  | 'customize'
  | 'tetris'

/** Hub sheet variants from Figma «HARDENED / Complete state map». */
export type HubPhase = 'ready' | 'loading' | 'offline' | 'empty' | 'long'

/** Full mini-game flow from the same Figma section. */
export type TetrisPhase =
  | 'tutorial'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'success'
  | 'failure'
  | 'offline'

export type SheetId =
  | 'streak'
  | 'claim-error'
  | 'catalog'
  | 'game-intro'
  | { sticker: string }
  | null

/** Hub white sheet: halfway (default), fully up, or down over play. */
export type HubSheet = 'expanded' | 'collapsed' | 'lowered'

export type CharacterMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'levelup'
  | 'reward'
  | 'playing'

/** XP needed for the next promo code. */
const xpForLevel = (level: number) => (level <= 4 ? 500 : 500 + (level - 4) * 100)

const ACCESSORY = 'glasses'

interface State {
  screen: ScreenId
  sheet: SheetId
  characterIndex: number
  level: number
  xp: number
  xpMax: number
  streakDays: number
  unlocked: string[]
  placed: string[]
  accessories: string[]
  claimedRewardIds: string[]
  pendingLevelUp: boolean
  pendingSticker: string | null
  lastPlaced: string | null
  lastXpGain: { amount: number; at: number } | null
  mood: CharacterMood
  xpToNext: number
  progress: number
  hubPhase: HubPhase
  hubSheet: HubSheet
  tetrisPhase: TetrisPhase
}

interface Actions {
  goto: (screen: ScreenId) => void
  openSheet: (sheet: SheetId) => void
  closeSheet: () => void
  setCharacterIndex: (index: number) => void
  addXp: (amount: number) => void
  commitLevelUp: () => void
  placeSticker: (id: string) => void
  queueSticker: (id: string) => void
  claimReward: (id: string) => void
  resetDemo: () => void
  setHubPhase: (phase: HubPhase) => void
  setHubSheet: (sheet: HubSheet) => void
  setTetrisPhase: (phase: TetrisPhase) => void
  openTetris: (phase?: TetrisPhase) => void
}

const Ctx = createContext<(State & Actions) | null>(null)

export function HubProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('hub')
  const [sheet, setSheet] = useState<SheetId>(null)
  const [characterIndex, setCharacterIndex] = useState(0) // egg — Hub / Menu 133:768
  const [level, setLevel] = useState(4)
  const [xp, setXp] = useState(415)
  const [xpMax, setXpMax] = useState(xpForLevel(4))
  const [streakDays] = useState(17)
  const [unlocked, setUnlocked] = useState<string[]>(initiallyUnlocked)
  const [placed, setPlaced] = useState<string[]>(initiallyPlaced)
  const [accessories, setAccessories] = useState<string[]>([])
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([])
  const [pendingLevelUp, setPendingLevelUp] = useState(false)
  const [pendingSticker, setPendingSticker] = useState<string | null>(null)
  const [lastPlaced, setLastPlaced] = useState<string | null>(null)
  const [lastXpGain, setLastXpGain] = useState<{ amount: number; at: number } | null>(
    null,
  )
  const [moodPulse, setMoodPulse] = useState<CharacterMood | null>(null)
  const [hubPhase, setHubPhase] = useState<HubPhase>('ready')
  const [hubSheet, setHubSheet] = useState<HubSheet>('collapsed')
  const [tetrisPhase, setTetrisPhase] = useState<TetrisPhase>('tutorial')

  useEffect(() => {
    if (!lastXpGain) return
    setMoodPulse('happy')
    const timer = setTimeout(() => setMoodPulse(null), 1000)
    return () => clearTimeout(timer)
  }, [lastXpGain])

  const goto = useCallback((next: ScreenId) => {
    setSheet(null)
    setScreen(next)
  }, [])

  const openTetris = useCallback((phase: TetrisPhase = 'tutorial') => {
    setSheet(null)
    setTetrisPhase(phase)
    setScreen('tetris')
  }, [])

  const openSheet = useCallback((next: SheetId) => setSheet(next), [])
  const closeSheet = useCallback(() => setSheet(null), [])

  const addXp = useCallback(
    (amount: number) => {
      setLastXpGain({ amount, at: Date.now() })
      setXp((current) => {
        const next = current + amount
        if (next >= xpMax) setPendingLevelUp(true)
        return next
      })
    },
    [xpMax],
  )

  const commitLevelUp = useCallback(() => {
    setPendingLevelUp(false)
    setLevel((current) => {
      const next = current + 1
      setXp((currentXp) => Math.max(0, currentXp - xpForLevel(current)))
      setXpMax(xpForLevel(next))
      return next
    })
    setAccessories((current) =>
      current.includes(ACCESSORY) ? current : [...current, ACCESSORY],
    )
    setUnlocked((current) =>
      current.includes(REWARD_STICKER) ? current : [...current, REWARD_STICKER],
    )
    setPendingSticker(REWARD_STICKER)
  }, [])

  const placeSticker = useCallback((id: string) => {
    setPlaced((current) => {
      if (current.includes(id) || current.length >= slots.length) return current
      return [...current, id]
    })
    setLastPlaced(id)
    setPendingSticker((current) => (current === id ? null : current))
  }, [])

  const queueSticker = useCallback((id: string) => setPendingSticker(id), [])

  const claimReward = useCallback((id: string) => {
    setClaimedRewardIds((current) =>
      current.includes(id) ? current : [...current, id],
    )
  }, [])

  const resetDemo = useCallback(() => {
    setLevel(4)
    setXp(415)
    setXpMax(xpForLevel(4))
    setCharacterIndex(0)
    setUnlocked(initiallyUnlocked)
    setPlaced(initiallyPlaced)
    setAccessories([])
    setClaimedRewardIds([])
    setPendingLevelUp(false)
    setPendingSticker(null)
    setLastPlaced(null)
    setLastXpGain(null)
    setMoodPulse(null)
    setSheet(null)
    setHubPhase('ready')
    setHubSheet('collapsed')
    setTetrisPhase('tutorial')
    setScreen('hub')
  }, [])

  const mood: CharacterMood =
    screen === 'levelup'
      ? 'levelup'
      : screen === 'newsticker' || screen === 'customize'
        ? 'reward'
        : pendingLevelUp
          ? 'excited'
          : (moodPulse ??
            (screen === 'play' || screen === 'play-alt' || screen === 'tetris'
              ? 'playing'
              : 'idle'))

  const value = useMemo(
    () => ({
      screen,
      sheet,
      characterIndex: Math.min(characterIndex, characters.length - 1),
      level,
      xp,
      xpMax,
      streakDays,
      unlocked,
      placed,
      accessories,
      claimedRewardIds,
      pendingLevelUp,
      pendingSticker,
      lastPlaced,
      lastXpGain,
      mood,
      xpToNext: Math.max(0, xpMax - xp),
      progress: Math.min(1, xp / xpMax),
      hubPhase,
      hubSheet,
      tetrisPhase,
      goto,
      openSheet,
      closeSheet,
      setCharacterIndex,
      addXp,
      commitLevelUp,
      placeSticker,
      queueSticker,
      claimReward,
      resetDemo,
      setHubPhase,
      setHubSheet,
      setTetrisPhase,
      openTetris,
    }),
    [
      screen,
      sheet,
      characterIndex,
      level,
      xp,
      xpMax,
      streakDays,
      unlocked,
      placed,
      accessories,
      claimedRewardIds,
      pendingLevelUp,
      pendingSticker,
      lastPlaced,
      lastXpGain,
      mood,
      hubPhase,
      hubSheet,
      tetrisPhase,
      goto,
      openSheet,
      closeSheet,
      addXp,
      commitLevelUp,
      placeSticker,
      queueSticker,
      claimReward,
      resetDemo,
      setHubPhase,
      setHubSheet,
      setTetrisPhase,
      openTetris,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHub() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHub must be used inside HubProvider')
  return ctx
}
