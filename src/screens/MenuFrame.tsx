import { motion } from 'framer-motion'
import { FrameNav } from '../components/frame/Chrome'
import { MENU_HEIGHT, MenuSheet } from '../components/frame/MenuSheet'
import { useHub } from '../state/HubState'

/**
 * «Профиль» — Figma 25:4917. The same component that forms the lower half of
 * every hub frame, here on its own as a full screen, so it starts at the top
 * with square corners and clears the nav at the bottom.
 */
export function MenuFrame() {
  const { goto, openSheet } = useHub()

  return (
    <motion.div
      className="frame"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="frame__scroll">
        <div className="frame__canvas" style={{ minHeight: MENU_HEIGHT }}>
          <MenuSheet
            top={0}
            floating={false}
            onAction={(target) => {
              if (target === 'quest') goto('quest')
              else if (target === 'game') goto('play')
              else openSheet('streak')
            }}
          />
        </div>
      </div>

      <FrameNav onHome={() => goto('hub')} onProfile={() => goto('menu')} />
    </motion.div>
  )
}
