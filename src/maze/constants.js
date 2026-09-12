export const TILE_SIZE = 16
export const SPRITE_W = 16
export const SPRITE_H = 24
export const WALK_MS = 145
export const HURT_MS = 280
export const TRANSITION_MS = 220
export const LIGHT_INNER = 2.05
export const LIGHT_OUTER = 3.4

export const DIR = {
  up: { x: 0, y: -1, index: 3, opposite: 'down' },
  down: { x: 0, y: 1, index: 0, opposite: 'up' },
  left: { x: -1, y: 0, index: 1, opposite: 'right' },
  right: { x: 1, y: 0, index: 2, opposite: 'left' },
}

export const DIR_FROM_DELTA = {
  '0,-1': 'up',
  '0,1': 'down',
  '-1,0': 'left',
  '1,0': 'right',
}

export const TILE = {
  FLOOR: 0,
  WALL: 1,
  PIT: 2,
  SPIKE: 3,
  ONEWAY_N: 4,
  ONEWAY_E: 5,
  ONEWAY_S: 6,
  ONEWAY_W: 7,
  GATE: 8,
}

export const ONEWAY_DIR = {
  [TILE.ONEWAY_N]: 'up',
  [TILE.ONEWAY_E]: 'right',
  [TILE.ONEWAY_S]: 'down',
  [TILE.ONEWAY_W]: 'left',
}

export const ONEWAY_TILE = {
  up: TILE.ONEWAY_N,
  right: TILE.ONEWAY_E,
  down: TILE.ONEWAY_S,
  left: TILE.ONEWAY_W,
}

export const SHEET = {
  FLOOR: 0,
  FLOOR2: 1,
  WALL: 2,
  WALL_TOP: 3,
  PIT: 4,
  SPIKE: 5,
  ONEWAY_N: 6,
  ONEWAY_E: 7,
  ONEWAY_S: 8,
  ONEWAY_W: 9,
  GATE: 10,
  OPEN_GATE: 11,
  TORCH: 12,
}

export const COMPLETE_KEY = 'bronwyn-day2-maze-complete'
