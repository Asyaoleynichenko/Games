import { useEffect, useState, type MouseEvent } from 'react'
import { ui } from '../../assets'
import {
  hubActions,
  hubActionsLong,
  menuLinks,
  menuTiles,
  serviceTabs,
  type ServiceTabId,
} from '../../data/quests'
import type { HubPhase } from '../../state/HubState'

/**
 * Menu 25:4917 — one long page. Tabs are in-sheet anchors, not panels.
 */
export const MENU_HEIGHT = 1020

const TILE_ART = {
  tileFavorites: ui.tileFavorites,
  tileAbout: ui.tileAbout,
  tileDelivery: ui.tileDelivery,
  tileHelp: ui.tileHelp,
} as const

function MoreDots() {
  return (
    <svg width="13" height="3" viewBox="0 0 13 3" fill="none" aria-hidden>
      <circle cx="1.5" cy="1.5" r="1.5" fill="#2c2d2e" />
      <circle cx="6.5" cy="1.5" r="1.5" fill="#2c2d2e" />
      <circle cx="11.5" cy="1.5" r="1.5" fill="#2c2d2e" />
    </svg>
  )
}

function menuScroller(target: HTMLElement) {
  return (
    (target.closest('.frame__scroll--sheet') as HTMLElement | null) ||
    (target.closest('.frame__scroll') as HTMLElement | null)
  )
}

function offsetInScroller(target: HTMLElement, root: HTMLElement) {
  let y = 0
  let node: HTMLElement | null = target
  while (node && node !== root) {
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return y
}

/** Scroll the hub sheet (not the window) to an in-menu anchor. */
export function scrollMenuTo(id: string, delay = 0) {
  const run = () => {
    const target = document.getElementById(id)
    if (!target) return
    const root = menuScroller(target)
    if (!root) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const tabs = root.querySelector('.svctabs') as HTMLElement | null
    const offset = (tabs?.offsetHeight ?? 0) + 4
    const y = Math.max(0, offsetInScroller(target, root) - offset)
    root.scrollTo({ top: y, behavior: 'smooth' })
  }
  const start = () => requestAnimationFrame(run)
  if (delay) window.setTimeout(start, delay)
  else start()
}

export interface MenuSheetProps {
  top?: number
  floating?: boolean
  phase?: HubPhase
  onAction: (target: 'quest' | 'game' | 'streak') => void
  onRetry?: () => void
  /** Raise the curtain before an in-sheet jump, if it is still halfway down. */
  onBeforeScroll?: () => boolean
}

export function MenuSheet({
  floating = true,
  phase = 'ready',
  onAction,
  onRetry,
  onBeforeScroll,
}: MenuSheetProps) {
  const actions = phase === 'long' ? hubActionsLong : hubActions
  const [tab, setTab] = useState<ServiceTabId>('services')

  useEffect(() => {
    const first = document.getElementById('menu-services')
    const root = first ? menuScroller(first) : null
    if (!root) return

    const nodes = serviceTabs
      .map((item) => document.getElementById(`menu-${item.id}`))
      .filter((node): node is HTMLElement => Boolean(node))

    const syncTab = () => {
      const tabs = root.querySelector('.svctabs') as HTMLElement | null
      const line = (tabs?.getBoundingClientRect().bottom ?? root.getBoundingClientRect().top) + 8
      let current: ServiceTabId = 'services'
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) {
          current = node.id.replace(/^menu-/, '') as ServiceTabId
        }
      }
      const room = root.scrollHeight - root.clientHeight
      if (room > 0 && root.scrollTop >= room - 2) {
        current = 'data'
      }
      setTab(current)
    }

    syncTab()
    root.addEventListener('scroll', syncTab, { passive: true })
    return () => root.removeEventListener('scroll', syncTab)
  }, [])

  const onAnchor = (event: MouseEvent<HTMLAnchorElement>, id: ServiceTabId) => {
    event.preventDefault()
    setTab(id)
    const hash = `#menu-${id}`
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash)
    }
    const locked = onBeforeScroll?.() ?? false
    scrollMenuTo(`menu-${id}`, locked ? 360 : 0)
  }

  return (
    <div className={`menu${floating ? '' : ' menu--flush'}`}>
      <section className="menu__gain" id="menu-gain">
        <h2 className="menu__title">Как получить больше</h2>
        {phase === 'empty' ? (
          <div className="menu__empty">
            <div className="menu__empty-mark" aria-hidden />
            <h3>Пока нет заданий</h3>
            <p>Загляни позже — тут появятся новые способы получить XP</p>
            <button className="cta cta--sm" type="button" onClick={onRetry}>
              Обновить
            </button>
          </div>
        ) : (
          <div className={`menu__xprow${phase === 'long' ? ' menu__xprow--wrap' : ''}`}>
            {(phase === 'loading' ? Array.from({ length: 4 }) : actions).map((action, index) => {
              if (phase === 'loading') {
                return <div key={index} className="xpcard xpcard--skel" />
              }
              const card = action as (typeof actions)[number]
              return (
                <button
                  key={card.id}
                  className="xpcard"
                  onClick={() => (phase === 'offline' ? onRetry?.() : onAction(card.target))}
                >
                  <span className="xpcard__amount">+{card.xp}&nbsp;xp</span>
                  <span className="xpcard__label">
                    {phase === 'offline' ? 'Повторить' : card.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <nav className="svctabs" aria-label="Разделы меню">
        {serviceTabs.map((item) => (
          <a
            key={item.id}
            href={`#menu-${item.id}`}
            className={`svctabs__item${tab === item.id ? ' svctabs__item--active' : ''}`}
            onClick={(event) => onAnchor(event, item.id)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section className="menu__anchor" id="menu-services">
        <div className="promorow">
          <img src={ui.promoRow} alt="Получите 1088 ₽ за прошлые покупки" />
        </div>
      </section>

      <section className="menu__anchor svctabs__panel" id="menu-promos">
        <button className="svctabs__card" type="button">
          <strong>−20%</strong>
          <span>На завтрак сегодня</span>
        </button>
        <button className="svctabs__card" type="button">
          <strong>2=1</strong>
          <span>Молочка из подборки</span>
        </button>
      </section>

      <section className="menu__anchor" id="menu-orders">
        <div className="menu__features">
          <button className="menu__shot" type="button">
            <img src={ui.menuPurchases} alt="История покупок" />
          </button>
          <div className="menu__stack">
            <button className="menu__mini" type="button">
              История заказов
            </button>
            <button className="menu__parcels" type="button">
              <img src={ui.menuParcels} alt="Посылки" />
            </button>
          </div>
        </div>
      </section>

      <section className="menu__anchor menu__data" id="menu-data">
        <div className="menu__profile">
          <img className="menu__ava" src={ui.menuAvatar} alt="" />
          <div className="menu__who">
            <p className="menu__name">Андрей Ивашин</p>
            <p className="menu__phone">+7 (921) 946-83-79</p>
          </div>
          <button className="menu__more" type="button" aria-label="Ещё">
            <MoreDots />
          </button>
        </div>

        <div className="menu__tiles">
          {menuTiles.map((tile) => (
            <button key={tile.id} className="menu__tile" type="button">
              <img src={TILE_ART[tile.art]} alt="" />
              <span>{tile.label}</span>
            </button>
          ))}
        </div>

        <div className="menu__links">
          {menuLinks.map((label) => (
            <button key={label} className="menu__link" type="button">
              {label}
            </button>
          ))}
          <button className="menu__link menu__link--out" type="button">
            Выйти из профиля
          </button>
        </div>
      </section>
    </div>
  )
}
