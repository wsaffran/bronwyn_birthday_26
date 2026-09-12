import { DIR, DIR_FROM_DELTA, ONEWAY_TILE, TILE } from './constants'
import { ICON_META } from './iconMeta'

function mulberry32(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(rng, list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function cellTile(c, r) {
  return { x: c * 2 + 1, y: r * 2 + 1 }
}

function wallBetween(a, b) {
  return { x: a.c + b.c + 1, y: a.r + b.r + 1 }
}

const CARDINALS = [
  { c: 0, r: -1, dir: 'up' },
  { c: 1, r: 0, dir: 'right' },
  { c: 0, r: 1, dir: 'down' },
  { c: -1, r: 0, dir: 'left' },
]

function makeGrid(width, height, fill) {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => fill))
}

function neighbors(cols, rows, c, r) {
  return CARDINALS.map((d) => ({ c: c + d.c, r: r + d.r, dir: d.dir })).filter(
    (n) => n.c >= 0 && n.r >= 0 && n.c < cols && n.r < rows,
  )
}

function generateCells(cols, rows, rng) {
  const visited = makeGrid(cols, rows, false)
  const edges = []
  const stack = [{ c: 0, r: rows - 1 }]
  visited[rows - 1][0] = true

  while (stack.length) {
    const cur = stack[stack.length - 1]
    const nexts = shuffle(
      rng,
      neighbors(cols, rows, cur.c, cur.r).filter((n) => !visited[n.r][n.c]),
    )
    if (!nexts.length) {
      stack.pop()
      continue
    }
    const n = nexts[0]
    visited[n.r][n.c] = true
    edges.push({ a: cur, b: { c: n.c, r: n.r }, dir: n.dir, spanning: true })
    stack.push({ c: n.c, r: n.r })
  }

  return edges
}

function openingsOf(cols, rows, edges, c, r) {
  return edges.filter(
    (e) => (e.a.c === c && e.a.r === r) || (e.b.c === c && e.b.r === r),
  ).length
}

function braidMaze(cols, rows, edges, rng, amount) {
  const extra = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (openingsOf(cols, rows, [...edges, ...extra], c, r) !== 1) continue
      if (rng() > amount) continue
      const options = neighbors(cols, rows, c, r).filter((n) => {
        return ![...edges, ...extra].some(
          (e) =>
            (e.a.c === c && e.a.r === r && e.b.c === n.c && e.b.r === n.r) ||
            (e.b.c === c && e.b.r === r && e.a.c === n.c && e.a.r === n.r),
        )
      })
      if (!options.length) continue
      const n = options[Math.floor(rng() * options.length)]
      extra.push({
        a: { c, r },
        b: { c: n.c, r: n.r },
        dir: n.dir,
        spanning: false,
      })
    }
  }
  return extra
}

function tilesFromEdges(cols, rows, edges) {
  const width = cols * 2 + 1
  const height = rows * 2 + 1
  const tiles = makeGrid(width, height, TILE.WALL)
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const t = cellTile(c, r)
      tiles[t.y][t.x] = TILE.FLOOR
    }
  }
  for (const edge of edges) {
    const w = wallBetween(edge.a, edge.b)
    tiles[w.y][w.x] = TILE.FLOOR
  }
  return { tiles, width, height }
}

function keyOf(c, r) {
  return `${c},${r}`
}

function bfsCells(cols, rows, edges, start) {
  const adj = new Map()
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) adj.set(keyOf(c, r), [])
  }
  for (const e of edges) {
    adj.get(keyOf(e.a.c, e.a.r)).push(e.b)
    adj.get(keyOf(e.b.c, e.b.r)).push(e.a)
  }
  const dist = new Map([[keyOf(start.c, start.r), 0]])
  const prev = new Map()
  const q = [start]
  while (q.length) {
    const cur = q.shift()
    const d = dist.get(keyOf(cur.c, cur.r))
    for (const n of adj.get(keyOf(cur.c, cur.r))) {
      const k = keyOf(n.c, n.r)
      if (dist.has(k)) continue
      dist.set(k, d + 1)
      prev.set(k, cur)
      q.push(n)
    }
  }
  return { dist, prev }
}

function pathBetween(prev, end) {
  const path = [end]
  let cur = end
  while (prev.has(keyOf(cur.c, cur.r))) {
    cur = prev.get(keyOf(cur.c, cur.r))
    path.push(cur)
  }
  return path.reverse()
}

function tileWalkable(tile, collected, gateReq) {
  if (tile === TILE.WALL) return false
  if (tile === TILE.GATE) return collected >= gateReq
  return true
}

function oneWayDir(tile) {
  if (tile === TILE.ONEWAY_N) return 'up'
  if (tile === TILE.ONEWAY_E) return 'right'
  if (tile === TILE.ONEWAY_S) return 'down'
  if (tile === TILE.ONEWAY_W) return 'left'
  return null
}

export function canStep(tiles, from, to, collected, gateReq) {
  if (to.y < 0 || to.x < 0 || to.y >= tiles.length || to.x >= tiles[0].length) {
    return false
  }
  const dest = tiles[to.y][to.x]
  if (!tileWalkable(dest, collected, gateReq)) return false

  const move = DIR_FROM_DELTA[`${to.x - from.x},${to.y - from.y}`]
  if (!move) return false

  const destDir = oneWayDir(dest)
  if (destDir && destDir !== move) return false

  const srcDir = oneWayDir(tiles[from.y][from.x])
  if (srcDir && srcDir !== move) return false

  return true
}

function bfsTiles(tiles, start, collected, gateReq, avoidHazards) {
  const h = tiles.length
  const w = tiles[0].length
  const key = (x, y) => `${x},${y}`
  const dist = new Map([[key(start.x, start.y), 0]])
  const q = [start]
  while (q.length) {
    const cur = q.shift()
    for (const dir of Object.values(DIR)) {
      const to = { x: cur.x + dir.x, y: cur.y + dir.y }
      if (to.x < 0 || to.y < 0 || to.x >= w || to.y >= h) continue
      const k = key(to.x, to.y)
      if (dist.has(k)) continue
      if (avoidHazards && (tiles[to.y][to.x] === TILE.PIT || tiles[to.y][to.x] === TILE.SPIKE)) {
        continue
      }
      if (!canStep(tiles, cur, to, collected, gateReq)) continue
      dist.set(k, dist.get(key(cur.x, cur.y)) + 1)
      q.push(to)
    }
  }
  return dist
}

export function shortestPath(tiles, start, goal, collected, gateReq) {
  const h = tiles.length
  const w = tiles[0].length
  const key = (x, y) => `${x},${y}`
  const prev = new Map()
  const q = [start]
  const seen = new Set([key(start.x, start.y)])
  while (q.length) {
    const cur = q.shift()
    if (cur.x === goal.x && cur.y === goal.y) {
      const out = [cur]
      let step = cur
      while (prev.has(key(step.x, step.y))) {
        step = prev.get(key(step.x, step.y))
        out.push(step)
      }
      return out.reverse()
    }
    for (const dir of Object.values(DIR)) {
      const to = { x: cur.x + dir.x, y: cur.y + dir.y }
      if (to.x < 0 || to.y < 0 || to.x >= w || to.y >= h) continue
      const k = key(to.x, to.y)
      if (seen.has(k)) continue
      if (tiles[to.y][to.x] === TILE.PIT || tiles[to.y][to.x] === TILE.SPIKE) continue
      if (!canStep(tiles, cur, to, collected, gateReq)) continue
      seen.add(k)
      prev.set(k, cur)
      q.push(to)
    }
  }
  return null
}

function isSolvable(wing) {
  const { tiles, start, item, exit, gateReq } = wing
  const toItem = bfsTiles(tiles, start, 0, gateReq, true)
  if (!toItem.has(`${item.x},${item.y}`)) return false
  if (!exit) return true
  const toExit = bfsTiles(tiles, item, 1, gateReq, true)
  return toExit.has(`${exit.x},${exit.y}`)
}

function deadEndCells(cols, rows, edges) {
  const out = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (openingsOf(cols, rows, edges, c, r) === 1) out.push({ c, r })
    }
  }
  return out
}

function generateWing(spec, icon, isLast) {
  const { cols, rows, seed, braid, pits, spikes, oneWays } = spec
  const rng = mulberry32(seed)
  const spanning = generateCells(cols, rows, rng)
  const extra = braidMaze(cols, rows, spanning, rng, braid)
  const edges = [...spanning, ...extra]

  const startCell = { c: 0, r: rows - 1 }
  const exitCell = { c: cols - 1, r: 0 }
  const { prev } = bfsCells(cols, rows, edges, startCell)
  const route = pathBetween(prev, exitCell)
  const itemCell = route[Math.max(1, Math.floor(route.length * 0.62))]

  const routeKeys = new Set(route.map((p) => keyOf(p.c, p.r)))
  const { tiles, width, height } = tilesFromEdges(cols, rows, edges)

  const start = cellTile(startCell.c, startCell.r)
  const item = { ...cellTile(itemCell.c, itemCell.r), id: icon.id }
  let exit = null
  const gateReq = isLast ? 0 : 1

  if (!isLast) {
    const exitInner = cellTile(exitCell.c, exitCell.r)
    exit = { x: width - 1, y: exitInner.y }
    tiles[exit.y][exit.x] = TILE.GATE
  }

  const hazardCells = shuffle(
    rng,
    deadEndCells(cols, rows, edges).filter((cell) => {
      if (keyOf(cell.c, cell.r) === keyOf(startCell.c, startCell.r)) return false
      if (keyOf(cell.c, cell.r) === keyOf(itemCell.c, itemCell.r)) return false
      if (keyOf(cell.c, cell.r) === keyOf(exitCell.c, exitCell.r)) return false
      return !routeKeys.has(keyOf(cell.c, cell.r))
    }),
  )

  let pitCount = 0
  for (const cell of hazardCells) {
    if (pitCount >= pits) break
    const t = cellTile(cell.c, cell.r)
    tiles[t.y][t.x] = TILE.PIT
    pitCount += 1
  }

  let spikeCount = 0
  for (const cell of hazardCells.slice(pitCount)) {
    if (spikeCount >= spikes) break
    const t = cellTile(cell.c, cell.r)
    tiles[t.y][t.x] = TILE.SPIKE
    spikeCount += 1
  }

  if (oneWays) {
    const { dist } = bfsCells(cols, rows, edges, startCell)
    const braidEdges = shuffle(
      rng,
      extra.filter((e) => {
        const da = dist.get(keyOf(e.a.c, e.a.r)) ?? 0
        const db = dist.get(keyOf(e.b.c, e.b.r)) ?? 0
        return da !== db
      }),
    )
    let placed = 0
    for (const edge of braidEdges) {
      if (placed >= oneWays) break
      const da = dist.get(keyOf(edge.a.c, edge.a.r))
      const db = dist.get(keyOf(edge.b.c, edge.b.r))
      const from = da < db ? edge.a : edge.b
      const to = da < db ? edge.b : edge.a
      const dir = DIR_FROM_DELTA[`${to.c - from.c},${to.r - from.r}`]
      if (!dir) continue
      const w = wallBetween(edge.a, edge.b)
      const prevTile = tiles[w.y][w.x]
      tiles[w.y][w.x] = ONEWAY_TILE[dir]
      const candidate = {
        tiles,
        start,
        item,
        exit,
        gateReq,
      }
      if (isSolvable(candidate)) {
        placed += 1
      } else {
        tiles[w.y][w.x] = prevTile
      }
    }
  }

  const wing = {
    id: icon.id,
    width,
    height,
    tiles,
    start,
    item,
    exit,
    gateReq,
    name: icon.label,
  }

  if (!isSolvable(wing)) {
    throw new Error(`Unsolvable wing: ${icon.id}`)
  }

  return wing
}

const WING_SPECS = [
  { cols: 8, rows: 6, seed: 11, braid: 0.55, pits: 0, spikes: 0, oneWays: 0 },
  { cols: 10, rows: 8, seed: 27, braid: 0.34, pits: 5, spikes: 0, oneWays: 0 },
  { cols: 10, rows: 8, seed: 44, braid: 0.28, pits: 3, spikes: 0, oneWays: 7 },
  { cols: 11, rows: 8, seed: 81, braid: 0.22, pits: 2, spikes: 6, oneWays: 6 },
  { cols: 12, rows: 9, seed: 108, braid: 0.16, pits: 5, spikes: 5, oneWays: 8 },
]

export const WINGS = WING_SPECS.map((spec, index) =>
  generateWing(spec, ICON_META[index], index === WING_SPECS.length - 1),
)

export function isHazard(tile) {
  return tile === TILE.PIT || tile === TILE.SPIKE
}

export function isWallLike(tile) {
  return tile === TILE.WALL
}
