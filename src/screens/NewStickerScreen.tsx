import { motion } from 'framer-motion'
import { Screen } from '../components/Chrome'
import { FrameHeader, FrameNav } from '../components/frame/Chrome'
import { StickerImage } from '../components/Character'
import { Cta, Sparkles } from '../components/Ui'
import { characters } from '../data/characters'
import { REWARD_STICKER, stickerById } from '../data/stickers'
import { useHub } from '../state/HubState'

export function NewStickerScreen() {
  const { characterIndex, pendingSticker, goto, openSheet } = useHub()
  const character = characters[characterIndex]
  const id = pendingSticker ?? REWARD_STICKER
  const sticker = stickerById(id)

  return (
    <Screen character={character}>
      <FrameHeader
        onRewards={() => goto('awards-grid')}
        onTasks={() => openSheet('streak')}
      />

      <div className="screen__scroll">
        <div className="screen-stack screen-stack--grow">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="levelbadge"
            style={{ fontSize: 22 }}
          >
            Новый стикер!
          </motion.span>

          <div className="screen-hero screen-hero--sticker" style={{ marginTop: 24 }}>
            <Sparkles count={12} radius={130} />
            <motion.div
              layoutId={`place-${id}`}
              initial={{ scale: 0.25, rotate: -22, opacity: 0 }}
              animate={{ scale: 1, rotate: -5, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, mass: 0.85 }}
            >
              <motion.div
                animate={{ rotate: [-5, -1, -5], y: [0, -8, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <StickerImage id={id} size="100%" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.42 }}
            style={{ marginTop: 32 }}
          >
            <p className="screen-title" style={{ color: character.onTheme }}>
              {sticker?.title}
            </p>
            <p className="screen-body" style={{ color: character.onTheme, opacity: 0.8 }}>
              {sticker?.requirement}
            </p>
            <p className="screen-kicker" style={{ marginTop: 20, color: character.onTheme }}>
              Добавь его на персонажа
            </p>
          </motion.div>
        </div>

        <motion.div
          className="screen-actions"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.52 }}
        >
          <Cta block onClick={() => goto('customize')}>
            Наклеить
          </Cta>
        </motion.div>
      </div>
      <FrameNav onHome={() => goto('hub')} onProfile={() => goto('menu')} />
    </Screen>
  )
}
