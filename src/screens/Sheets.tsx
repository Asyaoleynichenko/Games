import { motion } from 'framer-motion'
import { StickerImage } from '../components/Character'
import { BottomSheet, Cta } from '../components/Ui'
import { characters } from '../data/characters'
import { basketQuest } from '../data/quests'
import { stickerById } from '../data/stickers'
import { useHub } from '../state/HubState'

/** Streak — framed as time spent together, never as loss. */
export function StreakSheet() {
  const { streakDays, characterIndex, closeSheet } = useHub()
  const character = characters[characterIndex]
  const week = Array.from({ length: 7 }, () => true)

  return (
    <BottomSheet onClose={closeSheet}>
      <div style={{ textAlign: 'center' }}>
        <img src={character.art} alt="" width={72} style={{ margin: '0 auto' }} />
        <h3 style={{ margin: '8px 0 4px', fontSize: 22, fontWeight: 600 }}>
          {streakDays} дней вместе
        </h3>
        <p style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--ink-muted)' }}>
          Заходи каждый день — и персонаж будет расти
        </p>
      </div>

      <div className="streak-week">
        {week.map((done, index) => (
          <motion.div
            key={index}
            className={`streak-day${done ? ' is-on' : ' is-off'}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.045, type: 'spring', stiffness: 420, damping: 20 }}
          >
            {done ? '✓' : ''}
          </motion.div>
        ))}
      </div>

      <div className="streak-hint">
        <span style={{ fontSize: 22 }}>⭐</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 500 }}>
            Ещё 3 дня — особый стикер
          </span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--ink-muted)' }}>
            Персонаж будет ждать тебя завтра 🍋
          </span>
        </span>
      </div>

      <Cta block onClick={closeSheet}>
        Понятно
      </Cta>
    </BottomSheet>
  )
}

/** Rewards / Claim error — Figma 133:1882. */
export function ClaimErrorSheet() {
  const { closeSheet, goto } = useHub()

  return (
    <BottomSheet onClose={closeSheet}>
      <div className="claim-error">
        <h2>Награду не удалось забрать</h2>
        <p>
          Похоже, сеть моргнула. Прогресс раунда на месте — попробуй ещё раз.
        </p>
        <Cta
          block
          onClick={() => {
            closeSheet()
            goto('awards')
          }}
        >
          Повторить
        </Cta>
        <Cta block variant="white" onClick={closeSheet}>
          Закрыть
        </Cta>
      </div>
    </BottomSheet>
  )
}

/** Bottom-nav «Каталог». */
export function CatalogSheet() {
  const { closeSheet, goto } = useHub()

  return (
    <BottomSheet onClose={closeSheet}>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: '32px' }}>
        Каталог
      </h2>
      <p style={{ margin: '8px 0 16px', fontSize: 16, color: 'var(--ink-muted)' }}>
        Подборка к завтраку — собери корзину и получи XP
      </p>
      <div className="svctabs__panel" style={{ marginBottom: 16 }}>
        {basketQuest.products.map((product) => (
          <div key={product.id} className="svctabs__card">
            <strong>{product.glyph}</strong>
            <span>{product.name}</span>
          </div>
        ))}
      </div>
      <Cta
        block
        onClick={() => {
          closeSheet()
          goto('quest')
        }}
      >
        К заданию
      </Cta>
    </BottomSheet>
  )
}

/** Sticker detail, opened from the collection grid. */
export function StickerSheet({ stickerId }: { stickerId: string }) {
  const { closeSheet, placed, queueSticker, goto } = useHub()
  const sticker = stickerById(stickerId)
  if (!sticker) return null

  const onCharacter = placed.includes(sticker.id)

  return (
    <BottomSheet onClose={closeSheet}>
      <div className="sticker-row">
        <StickerImage id={sticker.id} size={96} />
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{sticker.title}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>
            {sticker.requirement}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ink-muted)' }}>
            Получен {sticker.earnedOn ?? '12 августа'}
          </p>
        </div>
      </div>

      {onCharacter ? (
        <Cta block variant="white" onClick={closeSheet}>
          Уже на персонаже
        </Cta>
      ) : (
        <Cta
          block
          onClick={() => {
            queueSticker(sticker.id)
            goto('customize')
          }}
        >
          Наклеить на персонажа
        </Cta>
      )}
    </BottomSheet>
  )
}
