import tilesetUrl from './assets/tileset.png'
import walkerUrl from './assets/walker.png'
import {
  DIR,
  HURT_MS,
  SHEET,
  SPRITE_H,
  SPRITE_W,
  TILE,
  TILE_SIZE,
  TRANSITION_MS,
  WALK_MS,
} from './constants'
import { ICONS } from './icons'
import { WINGS, canStep, isHazard, isWallLike } from './maps'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load ${src}`))
    image.src = src
  })
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function sheetIndex(tiles, x, y, tile, gateOpen) {
  if (tile === TILE.WALL) {
    const below = y + 1 < tiles.length ? tiles[y + 1][x] : TILE.WALL
    return isWallLike(below) ? SHEET.WALL_TOP : SHEET.WALL
  }
  if (tile === TILE.PIT) return SHEET.PIT
  if (tile === TILE.SPIKE) return SHEET.SPIKE
  if (tile === TILE.ONEWAY_N) return SHEET.ONEWAY_N
  if (tile === TILE.ONEWAY_E) return SHEET.ONEWAY_E
  if (tile === TILE.ONEWAY_S) return SHEET.ONEWAY_S
  if (tile === TILE.ONEWAY_W) return SHEET.ONEWAY_W
  if (tile === TILE.GATE) return gateOpen ? SHEET.OPEN_GATE : SHEET.GATE
  return (x + y) % 2 === 0 ? SHEET.FLOOR : SHEET.FLOOR2
}

export async function createMazeEngine({
  canvas,
  stage,
  input,
  onCollect,
  onWin,
  onWing,
  onHurt,
}) {
  const [tileset, walker, ...iconImages] = await Promise.all([
    loadImage(tilesetUrl),
    loadImage(walkerUrl),
    ...ICONS.map((icon) => loadImage(icon.src)),
  ])

  const ctx = canvas.getContext('2d')
  const state = {
    wingIndex: 0,
    collected: [],
    x: WINGS[0].start.x,
    y: WINGS[0].start.y,
    fromX: WINGS[0].start.x,
    fromY: WINGS[0].start.y,
    toX: WINGS[0].start.x,
    toY: WINGS[0].start.y,
    walking: false,
    walkT: 0,
    facing: 'down',
    frame: 0,
    lastSafe: { x: WINGS[0].start.x, y: WINGS[0].start.y },
    hurtUntil: 0,
    fade: 0,
    fading: null,
    won: false,
    viewW: 160,
    viewH: 144,
    scale: 3,
    destroyed: false,
  }

  function wing() {
    return WINGS[state.wingIndex]
  }

  function collectedHere() {
    return state.collected.includes(wing().item.id)
  }

  function gateOpen() {
    const current = wing()
    if (!current.exit) return false
    return collectedHere()
  }

  function pixelPos() {
    if (!state.walking) {
      return { x: state.x * TILE_SIZE, y: state.y * TILE_SIZE }
    }
    return {
      x: lerp(state.fromX, state.toX, state.walkT) * TILE_SIZE,
      y: lerp(state.fromY, state.toY, state.walkT) * TILE_SIZE,
    }
  }

  function tryMove(dirName) {
    if (state.won || state.fading || state.walking) return
    if (performance.now() < state.hurtUntil) return
    const dir = DIR[dirName]
    if (!dir) return
    state.facing = dirName
    const to = { x: state.x + dir.x, y: state.y + dir.y }
    const current = wing()
    const collectedCount = collectedHere() ? 1 : 0
    if (!canStep(current.tiles, { x: state.x, y: state.y }, to, collectedCount, current.gateReq)) {
      return
    }
    state.walking = true
    state.walkT = 0
    state.fromX = state.x
    state.fromY = state.y
    state.toX = to.x
    state.toY = to.y
    state.frame = 1
  }

  function arrive() {
    state.x = state.toX
    state.y = state.toY
    state.walking = false
    state.walkT = 0
    state.frame = 0
    const current = wing()
    const tile = current.tiles[state.y][state.x]

    if (isHazard(tile)) {
      state.x = state.lastSafe.x
      state.y = state.lastSafe.y
      state.toX = state.x
      state.toY = state.y
      state.hurtUntil = performance.now() + HURT_MS
      onHurt?.()
      return
    }

    if (tile !== TILE.GATE) {
      state.lastSafe = { x: state.x, y: state.y }
    }

    if (
      !collectedHere() &&
      state.x === current.item.x &&
      state.y === current.item.y
    ) {
      state.collected = [...state.collected, current.item.id]
      onCollect?.([...state.collected])
      if (state.collected.length === ICONS.length) {
        state.won = true
        onWin?.()
        return
      }
    }

    if (current.exit && gateOpen() && state.x === current.exit.x && state.y === current.exit.y) {
      beginNextWing()
    }
  }

  function beginNextWing() {
    const nextIndex = state.wingIndex + 1
    if (nextIndex >= WINGS.length) return
    state.fading = 'out'
    state.fade = 0
    state._nextWing = nextIndex
  }

  function enterWing(index) {
    state.wingIndex = index
    const next = WINGS[index]
    state.x = next.start.x
    state.y = next.start.y
    state.fromX = next.start.x
    state.fromY = next.start.y
    state.toX = next.start.x
    state.toY = next.start.y
    state.walking = false
    state.facing = 'down'
    state.lastSafe = { x: next.start.x, y: next.start.y }
    onWing?.(index)
  }

  function resize() {
    const rect = stage.getBoundingClientRect()
    const maxScale = Math.max(
      2,
      Math.min(5, Math.floor(rect.width / (TILE_SIZE * 10)), Math.floor(rect.height / (TILE_SIZE * 8))),
    )
    const scale = maxScale
    const viewW = Math.max(TILE_SIZE * 8, Math.floor(rect.width / scale))
    const viewH = Math.max(TILE_SIZE * 8, Math.floor(rect.height / scale))
    state.scale = scale
    state.viewW = viewW
    state.viewH = viewH
    canvas.width = viewW
    canvas.height = viewH
    canvas.style.width = `${viewW * scale}px`
    canvas.style.height = `${viewH * scale}px`
  }

  function camera() {
    const pos = pixelPos()
    const mapW = wing().width * TILE_SIZE
    const mapH = wing().height * TILE_SIZE
    let camX = pos.x + TILE_SIZE / 2 - state.viewW / 2
    let camY = pos.y + TILE_SIZE / 2 - state.viewH / 2
    if (mapW <= state.viewW) camX = (mapW - state.viewW) / 2
    else camX = Math.max(0, Math.min(mapW - state.viewW, camX))
    if (mapH <= state.viewH) camY = (mapH - state.viewH) / 2
    else camY = Math.max(0, Math.min(mapH - state.viewH, camY))
    return { x: Math.floor(camX), y: Math.floor(camY) }
  }

  function draw() {
    const current = wing()
    const cam = camera()
    const pos = pixelPos()
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#0a0810'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const x0 = Math.max(0, Math.floor(cam.x / TILE_SIZE) - 1)
    const y0 = Math.max(0, Math.floor(cam.y / TILE_SIZE) - 1)
    const x1 = Math.min(current.width - 1, Math.floor((cam.x + state.viewW) / TILE_SIZE) + 1)
    const y1 = Math.min(current.height - 1, Math.floor((cam.y + state.viewH) / TILE_SIZE) + 1)
    const playerRow = Math.round(pos.y / TILE_SIZE)
    const open = gateOpen()

    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const tile = current.tiles[y][x]
        const index = sheetIndex(current.tiles, x, y, tile, open)
        ctx.drawImage(
          tileset,
          index * TILE_SIZE,
          0,
          TILE_SIZE,
          TILE_SIZE,
          x * TILE_SIZE - cam.x,
          y * TILE_SIZE - cam.y,
          TILE_SIZE,
          TILE_SIZE,
        )
      }

      if (
        !collectedHere() &&
        current.item.y === y &&
        current.item.x >= x0 &&
        current.item.x <= x1
      ) {
        const icon = iconImages[state.wingIndex]
        const size = 22
        const dx = current.item.x * TILE_SIZE - cam.x + (TILE_SIZE - size) / 2
        const dy = current.item.y * TILE_SIZE - cam.y + (TILE_SIZE - size) / 2
        ctx.drawImage(icon, dx, dy, size, size)
      }

      if (playerRow === y) {
        drawPlayer(cam, pos)
      }
    }

    if (playerRow < y0 || playerRow > y1) drawPlayer(cam, pos)

    if (performance.now() < state.hurtUntil) {
      ctx.fillStyle = 'rgba(160, 32, 40, 0.28)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    if (state.fade > 0) {
      ctx.fillStyle = `rgba(8, 6, 12, ${state.fade})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  function drawPlayer(cam, pos) {
    const dirIndex = DIR[state.facing].index
    const bob = state.walking ? state.frame : 0
    const hurt = performance.now() < state.hurtUntil
    if (hurt && Math.floor(performance.now() / 60) % 2 === 0) return
    ctx.drawImage(
      walker,
      dirIndex * SPRITE_W,
      bob * SPRITE_H,
      SPRITE_W,
      SPRITE_H,
      Math.round(pos.x - cam.x),
      Math.round(pos.y - cam.y - (SPRITE_H - TILE_SIZE)),
      SPRITE_W,
      SPRITE_H,
    )
  }

  let last = performance.now()
  function tick(now) {
    if (state.destroyed) return
    const dt = Math.min(40, now - last)
    last = now

    if (state.fading === 'out') {
      state.fade = Math.min(1, state.fade + dt / TRANSITION_MS)
      if (state.fade >= 1) {
        enterWing(state._nextWing)
        state.fading = 'in'
      }
    } else if (state.fading === 'in') {
      state.fade = Math.max(0, state.fade - dt / TRANSITION_MS)
      if (state.fade <= 0) state.fading = null
    } else if (state.walking) {
      state.walkT = Math.min(1, state.walkT + dt / WALK_MS)
      state.frame = state.walkT < 0.5 ? 1 : 0
      if (state.walkT >= 1) arrive()
    } else {
      const dir = input.primary()
      if (dir) tryMove(dir)
    }

    draw()
    raf = requestAnimationFrame(tick)
  }

  function onResize() {
    resize()
    draw()
  }

  const observer = new ResizeObserver(onResize)
  observer.observe(stage)
  resize()

  let raf = requestAnimationFrame(tick)
  input.attach()

  function destroy() {
    state.destroyed = true
    cancelAnimationFrame(raf)
    observer.disconnect()
    input.detach()
  }

  function reset() {
    state.wingIndex = 0
    state.collected = []
    state.won = false
    state.fading = null
    state.fade = 0
    state.hurtUntil = 0
    enterWing(0)
    onCollect?.([])
  }

  return { destroy, reset, getCollected: () => state.collected }
}
