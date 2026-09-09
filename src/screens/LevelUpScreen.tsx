import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Screen } from '../components/Chrome'
import { FrameHeader, FrameNav } from '../components/frame/Chrome'
import { CharacterHero } from '../components/Character'
import { Cta, Sparkles } from '../components/Ui'
import { characters } from '../data/characters'
import { useHub } from '../state/HubState'

export function LevelUpScreen() {
  const { characterIndex, level, placed, accessories, pendingLevelUp, commitLevelUp, goto, openSheet } =
    useHub()
  const character = characters[characterIndex]
  const committed = useRef(false)

  // The milestone commits as the screen opens, so the level ticks over and the
  // new accessory lands as part of the celebration.
  useEffect(() => {
    if (pendingLevelUp && !committed.current) {
      committed.current = true
      commitLevelUp()
    }
  }, [pendingLevelUp, commitLevelUp])

  return (
    <Screen character={character}>
      <FrameHeader
        onRewards={() => goto('awards-grid')}
        onTasks={() => openSheet('streak')}
      />

      <div className="screen__scroll">
        <div className="screen-stack screen-stack--grow">
          <motion.span
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="levelbadge"
            style={{ fontSize: 20 }}
          >
            Новый уровень!
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.08 }}
            className="levelbadge"
            style={{ fontSize: 40, marginTop: 12 }}
          >
            {level} уровень
          </motion.span>

          <div className="screen-hero screen-hero--lg" style={{ marginTop: 16 }}>
            <Sparkles count={14} radius={148} />
            <CharacterHero
              character={character}
              size={356}
              placed={placed}
              accessories={accessories}
              mood="levelup"
              shared
            />
          </div>

          <motion.p
            className="screen-kicker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.5 }}
            style={{ marginTop: 24, color: character.onTheme }}
          >
            У твоего персонажа новый образ
          </motion.p>

          <motion.div
            className="unlocked-chip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 18, delay: 0.6 }}
          >
            🕶️ Очки открыты
          </motion.div>
        </div>

        <motion.div
          className="screen-actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.7 }}
        >
          <Cta block onClick={() => goto('newsticker')}>
            Посмотреть
          </Cta>
          <Cta variant="ghost" onClick={() => goto('hub')}>
            Позже
          </Cta>
        </motion.div>
      </div>
      <FrameNav onHome={() => goto('hub')} onProfile={() => goto('menu')} />
    </Screen>
  )
}
