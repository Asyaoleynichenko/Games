import { ui } from '../../assets'
import { hubActions, menuLinks, menuTiles, serviceTabs } from '../../data/quests'

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
  onAction: (target: 'quest' | 'game' | 'streak') => void
}

export function MenuSheet({ top, floating = true, onAction }: MenuSheetProps) {
  return (
    <div
      className={`menu${floating ? '' : ' menu--flush'}`}
      style={{ top, minHeight: MENU_HEIGHT }}
    >
      <section className="menu__gain">
        <h2 className="menu__title">Как получить больше</h2>
        <div className="menu__xprow">
          {hubActions.map((action) => (
            <button
              key={action.id}
              className="xpcard"
              onClick={() => onAction(action.target)}
            >
              <span className="xpcard__amount">+{action.xp}&nbsp;xp</span>
              <span className="xpcard__label">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="menu__tabsblock">
        <div className="svctabs">
          {serviceTabs.map((tab, index) => (
            <span
              key={tab}
              className={`svctabs__item${index === 0 ? ' svctabs__item--active' : ''}`}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="promorow">
          <img src={ui.promoRow} alt="Получите 1088 ₽ за прошлые покупки" />
        </div>
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
