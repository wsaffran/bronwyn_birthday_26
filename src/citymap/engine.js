import { DIR, SPRITE_H, SPRITE_W } from '../maze/constants'
import walkerUrl from '../maze/assets/walker.png'
import mapUrl from './assets/nyc-map.webp'
import { MAP_META } from './mapMeta'
import { LANDMARKS } from './landmarks'
import {
  ANIM_FPS,
  EDGE_MARGIN,
  INTERACT_RADIUS,
  MARKER,
  MAX_DPR,
  PLAYER_START,
  SCALE,
  WALK_SPEED,
} from './constants'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load ${src}`))
    image.src = src
  })
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

// Creates the canvas render/update loop for the city map. Returns handles the
// React layer uses to pause, clean up, read the player position, and translate
// a click into world (map-pixel) coordinates for the dev coordinate helper.
export async function createCityEngine({ canvas, stage, input, onActiveLandmark }) {
  const [map, walker] = await Promise.all([loadImage(mapUrl), loadImage(walkerUrl)])

  const state = {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    facing: 'down',
    moving: false,
    dpr: 1,
    scale: SCALE,
    drawScale: SCALE,
    viewW: 320,
    viewH: 240,
    camX: 0,
    camY: 0,
    activeId: null,
    paused: false,
    destroyed: false,
  }

  const ctx = canvas.getContext('2d')

  function resize() {
    const rect = stage.getBoundingClientRect()
    const cssW = Math.max(1, rect.width)
    const cssH = Math.max(1, rect.height)
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
    state.dpr = dpr
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    // Visible world region (in map pixels) and the world->canvas draw factor.
    state.viewW = Math.min(MAP_META.width, cssW / SCALE)
    state.viewH = Math.min(MAP_META.height, cssH / SCALE)
    state.drawScale = canvas.width / state.viewW
  }

  function updateCamera() {
    const maxX = Math.max(0, MAP_META.width - state.viewW)
    const maxY = Math.max(0, MAP_META.height - state.viewH)
    state.camX = clamp(state.x - state.viewW / 2, 0, maxX)
    state.camY = clamp(state.y - state.viewH / 2, 0, maxY)
  }

  function updateActiveLandmark() {
    let nearest = null
    let best = INTERACT_RADIUS
    for (const lm of LANDMARKS) {
      const d = Math.hypot(state.x - lm.x, state.y - lm.y)
      if (d <= best) {
        best = d
        nearest = lm
      }
    }
    const nextId = nearest ? nearest.id : null
    if (nextId !== state.activeId) {
      state.activeId = nextId
      onActiveLandmark?.(nearest || null)
    }
  }

  function drawMarker(lm, active, now) {
    const sx = (lm.x - state.camX) * state.drawScale
    const feetY = (lm.y - state.camY) * state.drawScale
    if (sx < -40 || sx > canvas.width + 40 || feetY < -60 || feetY > canvas.height + 60) {
      return
    }
    const r = MARKER.radius * state.dpr
    const headY = feetY - r * 1.7
    // ground shadow
    ctx.fillStyle = MARKER.shadow
    ctx.beginPath()
    ctx.ellipse(sx, feetY, r * 0.7, r * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    // active pulse ring
    if (active) {
      const pulse = 1 + 0.18 * Math.sin(now / 220)
      ctx.strokeStyle = 'rgba(224, 87, 79, 0.55)'
      ctx.lineWidth = 2 * state.dpr
      ctx.beginPath()
      ctx.arc(sx, headY, r * 1.5 * pulse, 0, Math.PI * 2)
      ctx.stroke()
    }
    // teardrop pin: head circle + pointer to the ground
    ctx.fillStyle = active ? MARKER.fillActive : MARKER.fill
    ctx.strokeStyle = MARKER.ring
    ctx.lineWidth = 2 * state.dpr
    ctx.beginPath()
    ctx.arc(sx, headY, r, 0, Math.PI * 2)
    ctx.moveTo(sx - r * 0.62, headY + r * 0.55)
    ctx.lineTo(sx, feetY)
    ctx.lineTo(sx + r * 0.62, headY + r * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    // inner dot
    ctx.fillStyle = MARKER.dot
    ctx.beginPath()
    ctx.arc(sx, headY, r * 0.38, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawPlayer(now) {
    const dirIndex = DIR[state.facing].index
    const frame = state.moving && Math.floor(now / (1000 / ANIM_FPS)) % 2 === 0 ? 1 : 0
    const w = SPRITE_W * state.drawScale
    const h = SPRITE_H * state.drawScale
    const sx = (state.x - state.camX) * state.drawScale
    const feetY = (state.y - state.camY) * state.drawScale
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(
      walker,
      dirIndex * SPRITE_W,
      frame * SPRITE_H,
      SPRITE_W,
      SPRITE_H,
      Math.round(sx - w / 2),
      Math.round(feetY - h),
      Math.round(w),
      Math.round(h),
    )
    ctx.imageSmoothingEnabled = true
  }

  function draw(now) {
    updateCamera()
    ctx.imageSmoothingEnabled = true
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      map,
      state.camX,
      state.camY,
      state.viewW,
      state.viewH,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    for (const lm of LANDMARKS) {
      drawMarker(lm, lm.id === state.activeId, now)
    }
    drawPlayer(now)
  }

  let last = performance.now()
  let raf = 0
  function tick(now) {
    if (state.destroyed) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    if (!state.paused) {
      const dir = input.primary()
      if (dir) {
        const d = DIR[dir]
        state.x = clamp(state.x + d.x * WALK_SPEED * dt, EDGE_MARGIN, MAP_META.width - EDGE_MARGIN)
        state.y = clamp(state.y + d.y * WALK_SPEED * dt, SPRITE_H, MAP_META.height - EDGE_MARGIN)
        state.facing = dir
        state.moving = true
      } else {
        state.moving = false
      }
      updateActiveLandmark()
    }

    draw(now)
    raf = requestAnimationFrame(tick)
  }

  const observer = new ResizeObserver(() => {
    resize()
    draw(performance.now())
  })
  observer.observe(stage)
  resize()
  input.attach()
  raf = requestAnimationFrame(tick)

  return {
    setPaused(paused) {
      state.paused = paused
      if (paused) {
        state.moving = false
        input.clear()
      }
    },
    getPlayer() {
      return { x: Math.round(state.x), y: Math.round(state.y) }
    },
    // Translate a pointer's client coordinates into world (map-pixel) space.
    worldFromClient(clientX, clientY) {
      const rect = canvas.getBoundingClientRect()
      const localX = clientX - rect.left
      const localY = clientY - rect.top
      const x = state.camX + (localX / rect.width) * state.viewW
      const y = state.camY + (localY / rect.height) * state.viewH
      return { x: Math.round(clamp(x, 0, MAP_META.width)), y: Math.round(clamp(y, 0, MAP_META.height)) }
    },
    destroy() {
      state.destroyed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      input.detach()
    },
  }
}
