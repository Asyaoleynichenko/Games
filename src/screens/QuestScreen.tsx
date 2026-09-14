import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Screen } from '../components/Chrome'
import { FrameHeader, FrameNav } from '../components/frame/Chrome'
import { CharacterHero } from '../components/Character'
import { ProgressBlock } from '../components/Progress'
import { Cta, FloatingXp } from '../components/Ui'
import { characters } from '../data/characters'
import { basketQuest } from '../data/quests'
import { useHub } from '../state/HubState'

type Phase = 'progress' | 'complete' | 'success'

export function QuestScreen() {
  const {
    characterIndex,
    level,
    xp,
    xpMax,
    xpToNext,
    placed,
    accessories,
    addXp,
    goto,
    openSheet,
    pendingLevelUp,
    mood,
  } = useHub()
  const character = characters[characterIndex]
  const quest = basketQuest
  const [phase, setPhase] = useState<Phase>('progress')
  const [shownXp, setShownXp] = useState(xp)

  const collected = phase === 'progress' ? quest.startProgress : quest.products.length

  useEffect(() => {
    if (phase !== 'success' || !pendingLevelUp) return
    const timer = setTimeout(() => goto('levelup'), 1600)
    return () => clearTimeout(timer)
  }, [phase, pendingLevelUp, goto])

  const claim = () => {
    addXp(quest.reward)
    setShownXp(xp + quest.reward)
    setPhase('success')
  }

  return (
    <Screen character={character}>
      <FrameHeader
        onRewards={() => goto('awards-grid')}
        onTasks={() => openSheet('streak')}
      />

      <div className="screen__scroll">
        <div className="screen-stack">
          <div className="screen-hero">
            <CharacterHero
              character={character}
              size={phase === 'success' ? 232 : 176}
              placed={placed}
              accessories={accessories}
              mood={phase === 'success' ? 'happy' : mood}
              shared
            />
            <AnimatePresence>
              {phase === 'success' && <FloatingXp amount={quest.reward} />}
            </AnimatePresence>
          </div>

          <div className="screen-progress">
            <ProgressBlock
              level={level}
              progress={Math.min(1, (phase === 'success' ? shownXp : xp) / xpMax)}
              note={phase === 'success' ? undefined : `Ещё ${xpToNext} XP — и новый промокод`}
              onTheme={character.onTheme}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase !== 'success' ? (
            <motion.div
              key="quest"
              className="sheet sheet--fill"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.26 }}
            >
              <div className="quest-sheet-head">
                <div>
                  <h3 className="section-title" style={{ margin: 0 }}>
                    {phase === 'complete' ? 'Корзина собрана' : quest.title}
                  </h3>
                  <p className="quest-sheet-copy">
                    {quest.description}
                  </p>
                </div>
                <span className="quest-xp">
                  +{quest.reward} XP
                </span>
              </div>

              <div className="quest-grid">
                {quest.products.map((product, index) => {
                  const inBasket = index < collected
                  return (
                    <motion.div
                      key={product.id}
                      className="quest-cell"
                      animate={inBasket ? { scale: [1, 1.05, 1], opacity: 1 } : { opacity: 0.5 }}
                      transition={{ duration: 0.35, delay: index * 0.06 }}
                    >
                      <span style={{ fontSize: 32, lineHeight: 1 }}>{product.glyph}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{product.name}</span>
                      <AnimatePresence>
                        {inBasket && (
                          <motion.span
                            className="quest-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                          >
                            ✓
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 14, color: 'var(--ink-muted)', marginBottom: 8 }}>
                  {collected} из {quest.products.length}
                </div>
                <div className="quest-bar">
                  <motion.div
                    animate={{ width: `${(collected / quest.products.length) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 110, damping: 18 }}
                    style={{ height: '100%', background: 'var(--green)' }}
                  />
                </div>
              </div>

              <div className="sheet-cta">
                {phase === 'progress' ? (
                  <Cta block onClick={() => setPhase('complete')}>
                    Собрать корзину
                  </Cta>
                ) : (
                  <Cta block onClick={claim}>
                    Забрать XP
                  </Cta>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="sheet sheet--fill"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <h3 className="screen-title">Задание выполнено!</h3>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.1 }}
                style={{
                  margin: '16px auto 8px',
                  display: 'inline-flex',
                  padding: '8px 24px',
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--card)',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                +{quest.reward} XP
              </motion.div>
              <p style={{ margin: '12px 0 20px', fontSize: 15, color: 'var(--ink-muted)' }}>
                Твой персонаж растёт! 🍋
              </p>
              <div className="sheet-cta">
                <Cta block onClick={() => goto(pendingLevelUp ? 'levelup' : 'hub')}>
                  На главную
                </Cta>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FrameNav onHome={() => goto('hub')} onProfile={() => goto('menu')} />
    </Screen>
  )
}
