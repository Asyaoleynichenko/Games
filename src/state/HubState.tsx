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

export type SheetId = 'streak' | { sticker: string } | null

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
}

const Ctx = createContext<(State & Actions) | null>(null)

export function HubProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('hub')
  const [sheet, setSheet] = useState<SheetId>(null)
  const [characterIndex, setCharacterIndex] = useState(2) // lemon — the brief's hero
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
    setCharacterIndex(2)
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
            (screen === 'play' || screen === 'play-alt' ? 'playing' : 'idle'))

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
      goto,
      openSheet,
      closeSheet,
      addXp,
      commitLevelUp,
      placeSticker,
      queueSticker,
      claimReward,
      resetDemo,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHub() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHub must be used inside HubProvider')
  return ctx
}
