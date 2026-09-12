import iconCandle from './assets/icon-candle.png'
import iconCandleWhite from './assets/icon-candle-white.png'
import iconCloth from './assets/icon-cloth.png'
import iconClothWhite from './assets/icon-cloth-white.png'
import iconHand from './assets/icon-hand.png'
import iconHandWhite from './assets/icon-hand-white.png'
import iconSword from './assets/icon-sword.png'
import iconSwordWhite from './assets/icon-sword-white.png'
import iconThorns from './assets/icon-thorns.png'
import iconThornsWhite from './assets/icon-thorns-white.png'
import hudLetters from './assets/hud-letters.png'
import { ICON_META } from './iconMeta'

const ASSETS = {
  hand: { src: iconHand, white: iconHandWhite, nx: 0.08316221765913757, ny: 0.49195402298850577, nw: 0.10780287474332649, nh: 0.3816091954022989 },
  thorns: { src: iconThorns, white: iconThornsWhite, nx: 0.25667351129363447, ny: 0.21839080459770116, nw: 0.11190965092402463, nh: 0.3425287356321839 },
  sword: { src: iconSword, white: iconSwordWhite, nx: 0.4322381930184805, ny: 0.016091954022988506, nw: 0.1273100616016427, nh: 0.825287356321839 },
  candle: { src: iconCandle, white: iconCandleWhite, nx: 0.6160164271047228, ny: 0.15402298850574714, nw: 0.09548254620123203, nh: 0.3632183908045977 },
  cloth: { src: iconCloth, white: iconClothWhite, nx: 0.7905544147843943, ny: 0.4436781609195402, nw: 0.13449691991786447, nh: 0.5218390804597701 },
}

export const ICONS = ICON_META.map((meta) => ({ ...meta, ...ASSETS[meta.id] }))

export const HUD_LETTERS = hudLetters
export const HUD_ASPECT = 974 / 435
