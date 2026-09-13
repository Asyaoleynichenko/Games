import { useState } from 'react'
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
 * Menu 25:4917 — 393×1020, auto-layout column, pad 20/16, gap 20.
 * Same block on the hub curtain and as the standalone profile screen.
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

export interface MenuSheetProps {
  top: number
  floating?: boolean
  phase?: HubPhase
  onAction: (target: 'quest' | 'game' | 'streak') => void
  onRetry?: () => void
}

export function MenuSheet({
  top,
  floating = true,
  phase = 'ready',
  onAction,
  onRetry,
}: MenuSheetProps) {
  const actions = phase === 'long' ? hubActionsLong : hubActions
  const [tab, setTab] = useState<ServiceTabId>('services')

  return (
    <div
      className={`menu${floating ? '' : ' menu--flush'}`}
      style={{ top, minHeight: MENU_HEIGHT }}
    >
      <section className="menu__gain">
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

      <section className="menu__tabsblock">
        <div className="svctabs" role="tablist" aria-label="Разделы меню">
          {serviceTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`svctabs__item${tab === item.id ? ' svctabs__item--active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === 'services' && (
          <div className="promorow">
            <img src={ui.promoRow} alt="Получите 1088 ₽ за прошлые покупки" />
          </div>
        )}
        {tab === 'promos' && (
          <div className="svctabs__panel">
            <button className="svctabs__card" type="button">
              <strong>−20%</strong>
              <span>На завтрак сегодня</span>
            </button>
            <button className="svctabs__card" type="button">
              <strong>2=1</strong>
              <span>Молочка из подборки</span>
            </button>
          </div>
        )}
        {tab === 'orders' && (
          <div className="svctabs__empty">
            <p>Пока нет заказов</p>
            <span>Собери корзину — и заказ появится здесь</span>
          </div>
        )}
        {tab === 'data' && (
          <div className="svctabs__empty">
            <p>Андрей Ивашин</p>
            <span>+7 (921) 946-83-79</span>
          </div>
        )}
      </section>

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
    </div>
  )
}
