/*
  Real artwork exported from the Figma file 🛒 at 2-4x.
  Node ids are recorded next to each import so any asset can be re-exported.
  Characters and screen chrome come from the page «экраны»; the sticker set
  comes from the page «ачивки» (node 18:3746).
*/

import charEgg from './figma/char-egg.png' // 18:3836
import charToast from './figma/char-toast.png' // 18:3891
import charLemon from './figma/char-lemon.png' // 18:3995

/*
  The 282x282 neighbours that peek in from the frame edges. The file ships
  four of them and reuses them across frames, so they are named by artwork.
*/
import sideToastNew from './figma/char-side-a.png' // 18:3834 — «NEW» toast
import sideOrangeFace from './figma/char-side-b.png' // 18:3835 — orange, anime face
import sideEgg from './figma/char-side-c.png' // 18:3993 — fried egg
import sideToast from './figma/char-side-d.png' // 18:3994 — plain toast

import badge100 from './figma/badge-100xp.png' // 18:3830
import bottomNav from './figma/bottom-nav.png' // 18:3822 "IMG_2531 2"
import stickerLocked from './figma/sticker-locked.png' // 18:4102 — grey medallion

/*
  The 361x215 media block under the «Играть» button. Each play frame carries
  its own: two match-3 boards, and — on the toast frame — a photo instead.
*/
import boardBreakfast from './figma/board-breakfast.png' // 18:3940
import boardFruit from './figma/board-fruit.png' // 18:4019
import boardFruitB from './figma/board-fruit-b.png' // 18:4487
import photoToastStack from './figma/photo-toast-stack.png' // 18:3915

import promoRow from './figma/menu/promo-row.png' // 25:4668 — the «Мои сервисы» promo pair
import stickerFeatured from './figma/sticker-featured.png' // 18:4439 — «Званный гость»
import menuAvatar from './figma/menu/avatar.png' // 52:2773
import menuPurchases from './figma/menu/card-purchases.png' // 48:624
import menuParcels from './figma/menu/card-parcels.png' // 25:4711
import tileFavorites from './figma/menu/tile-favorites.png' // 50:1578
import tileAbout from './figma/menu/tile-about.png' // 50:1596
import tileDelivery from './figma/menu/tile-delivery.png' // 50:1642
import tileHelp from './figma/menu/tile-help.png' // 50:1660

// The 24-sticker set, page «ачивки», nodes 18:3747 … 18:3770 in document order.
import ach01 from './figma/ach/ach-01.png'
import ach02 from './figma/ach/ach-02.png'
import ach03 from './figma/ach/ach-03.png'
import ach04 from './figma/ach/ach-04.png'
import ach05 from './figma/ach/ach-05.png'
import ach06 from './figma/ach/ach-06.png'
import ach07 from './figma/ach/ach-07.png'
import ach08 from './figma/ach/ach-08.png'
import ach09 from './figma/ach/ach-09.png'
import ach10 from './figma/ach/ach-10.png'
import ach11 from './figma/ach/ach-11.png'
import ach12 from './figma/ach/ach-12.png'
import ach13 from './figma/ach/ach-13.png'
import ach14 from './figma/ach/ach-14.png'
import ach15 from './figma/ach/ach-15.png'
import ach16 from './figma/ach/ach-16.png'
import ach17 from './figma/ach/ach-17.png'
import ach18 from './figma/ach/ach-18.png'
import ach19 from './figma/ach/ach-19.png'
import ach20 from './figma/ach/ach-20.png'
import ach21 from './figma/ach/ach-21.png'
import ach22 from './figma/ach/ach-22.png'
import ach23 from './figma/ach/ach-23.png'
import ach24 from './figma/ach/ach-24.png'

export const characterArt = {
  egg: charEgg,
  toast: charToast,
  lemon: charLemon,
  lemonUpright: sideOrangeFace,
}

export const sideArt = {
  toastNew: sideToastNew,
  orangeFace: sideOrangeFace,
  egg: sideEgg,
  toast: sideToast,
}

export const ui = {
  badge100,
  bottomNav,
  boardBreakfast,
  boardFruit,
  boardFruitB,
  photoToastStack,
  promoRow,
  stickerFeatured,
  stickerLocked,
  menuAvatar,
  menuPurchases,
  menuParcels,
  tileFavorites,
  tileAbout,
  tileDelivery,
  tileHelp,
}

/** Sticker artwork keyed by sticker id (see `data/stickers.ts`). */
export const stickerArt: Record<string, string> = {
  'plus-50': ach01,
  'tri-dnya': ach02,
  'plus-100': ach03,
  'sezon-leto': ach04,
  'ekspert-vkusa': ach05,
  'fruktovaya-komanda': ach06,
  'osoby-sticker': ach07,
  'pervy-shag': ach08,
  'soberi-zavtrak': ach09,
  kollektsioner: ach10,
  interes: ach11,
  druzya: ach12,
  'sezonnaya-aktivnost': ach13,
  'poprobuy-novoe': ach14,
  'bolshaya-pokupka': ach15,
  'dobrye-dela': ach16,
  energiya: ach17,
  stabilnost: ach18,
  'lyubimy-magazin': ach19,
  kollektsiya: ach20,
  'sem-dney': ach21,
  zabota: ach22,
  'uroven-10': ach23,
  'novy-obraz': ach24,
}
