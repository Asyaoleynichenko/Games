import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Screen } from '../components/Chrome'
import { FrameHeader, FrameNav } from '../components/frame/Chrome'
import { CharacterHero, StickerImage } from '../components/Character'
import { Cta } from '../components/Ui'
import { characters, slotPosition } from '../data/characters'
import { REWARD_STICKER, slots, stickerById } from '../data/stickers'
import { useHub } from '../state/HubState'

export function CustomizeScreen() {
  const { characterIndex, placed, accessories, pendingSticker, placeSticker, goto, openSheet } = useHub()
  const character = characters[characterIndex]
  const id = pendingSticker ?? REWARD_STICKER
  const sticker = stickerById(id)
  const [justPlaced, setJustPlaced] = useState<string | null>(null)

  const isPlaced = placed.includes(id)
  const targetSlot = slots[Math.min(placed.length, slots.length - 1)]

  const stick = () => {
    if (isPlaced) return
    placeSticker(id)
    setJustPlaced(id)
  }

  return (
    <Screen character={character}>
      <FrameHeader
        onRewards={() => goto('awards-grid')}
        onTasks={() => openSheet('streak')}
      />

      <div className="screen__scroll">
        <div className="screen-stack screen-stack--grow">
          <span
            style={{
              color: character.onTheme,
              fontSize: 15,
              fontWeight: 500,
              opacity: 0.85,
            }}
          >
            {isPlaced ? 'Твой персонаж' : 'Новый стикер'}
          </span>

          <div style={{ position: 'relative', marginTop: 12 }}>
            <CharacterHero
              character={character}
              size={344}
              placed={placed}
              accessories={accessories}
              animateIds={justPlaced ? [justPlaced] : []}
              highlight={justPlaced}
              mood={isPlaced ? 'happy' : 'reward'}
              shared
            />

            <AnimatePresence>
              {!isPlaced && targetSlot && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: [0.8, 0.3, 0.8], scale: [1, 1.08, 1] }}
                  exit={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                  className="place-slot"
                  style={{
                    left: `${slotPosition(character, targetSlot).left}%`,
                    top: `${slotPosition(character, targetSlot).top}%`,
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {isPlaced ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.45 }}
                style={{ marginTop: 24 }}
              >
                <span className="levelbadge" style={{ fontSize: 30 }}>
                  Готово
                </span>
                <p
                  style={{
                    margin: '12px 0 0',
                    color: character.onTheme,
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  «{sticker?.title}» теперь на персонаже
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  margin: '20px 0 0',
                  color: character.onTheme,
                  fontSize: 17,
                  fontWeight: 500,
                }}
              >
                Нажми, чтобы наклеить
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="screen-actions">
          <AnimatePresence mode="wait">
            {!isPlaced ? (
              <motion.div
                key="tray"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, scale: 0.92 }}
                transition={{ duration: 0.26 }}
              >
                <motion.button
                  layoutId={`place-${id}`}
                  onClick={stick}
                  whileTap={{ scale: 0.96 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'block', margin: '0 auto 16px' }}
                >
                  <StickerImage id={id} size={124} />
                </motion.button>
                <Cta block onClick={stick}>
                  Наклеить
                </Cta>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 }}
              >
                <Cta block onClick={() => goto('hub')}>
                  На главную
                </Cta>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <FrameNav onHome={() => goto('hub')} onProfile={() => goto('menu')} />
    </Screen>
  )
}
