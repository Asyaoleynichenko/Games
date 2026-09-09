import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ui } from '../assets'
import { ThemeLayer } from './frame/Chrome'
import type { Character } from '../data/characters'
import { useHub } from '../state/HubState'

export function StatusBar({ onTheme = '#fff' }: { onTheme?: string }) {
  return (
    <div className="statusbar" style={{ color: onTheme }}>
      <span>9:41</span>
      <div className="statusbar__icons" aria-hidden>
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
          <rect y="7.5" width="3" height="3.5" rx="1" />
          <rect x="4.8" y="5.5" width="3" height="5.5" rx="1" />
          <rect x="9.6" y="3" width="3" height="8" rx="1" />
          <rect x="14.4" width="3" height="11" rx="1" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M8 9.7 1 3.3a9.7 9.7 0 0 1 14 0L8 9.7Z" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.6" y="0.6" width="22" height="10.8" rx="3.4" stroke="currentColor" strokeOpacity="0.5" />
          <rect x="2.2" y="2.2" width="16" height="7.6" rx="2.2" fill="currentColor" />
          <path d="M24 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  )
}

function GiftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.9" y="6.1" width="12.2" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 6.1h14M8 6.1v8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 6.1S6.6 2.1 4.9 2.1a1.9 1.9 0 0 0 0 4M8 6.1s1.4-4 3.1-4a1.9 1.9 0 0 1 0 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="15" height="16" viewBox="0 0 16 17" fill="none" aria-hidden>
      <path
        d="M8 1.6a4.3 4.3 0 0 0-4.3 4.3v2.4L2.5 10.8h11L12.3 8.3V5.9A4.3 4.3 0 0 0 8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6.3 12.9a1.8 1.8 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** «Награды» on the left, «Задания» on the right — the Figma header. */
export function Header({ onBack }: { onBack?: () => void }) {
  const { goto, openSheet } = useHub()
  return (
    <header className="header">
      {onBack ? (
        <motion.button className="pill pill--icon" whileTap={{ scale: 0.93 }} onClick={onBack} aria-label="Назад">
          <BackIcon />
        </motion.button>
      ) : (
        <motion.button className="pill" whileTap={{ scale: 0.95 }} onClick={() => goto('awards')}>
          <GiftIcon />
          Награды
        </motion.button>
      )}
      <motion.button
        className="pill pill--icon"
        whileTap={{ scale: 0.93 }}
        onClick={() => openSheet('streak')}
        aria-label="Задания"
      >
        <BellIcon />
      </motion.button>
    </header>
  )
}

/** The bottom navigation, using the bar exported from Figma. */
export function BottomNav() {
  return (
    <nav className="bottomnav">
      <img src={ui.bottomNav} alt="Главная · Каталог · Апельсин · Профиль" />
    </nav>
  )
}

/** Screen shell: base colour + ray texture + shared transition. */
export function Screen({
  character,
  children,
  background,
}: {
  character?: Character
  children: ReactNode
  background?: string
}) {
  return (
    <motion.div
      className="screen"
      style={{ background: background ?? character?.base ?? 'var(--purple)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {character && <ThemeLayer character={character.id} />}
      {children}
    </motion.div>
  )
}
