import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Joystick from './Joystick'
import MapPinModal from './MapPinModal'
import {
  EXHIBIT_VIEW_RADIUS_PX,
  HALL,
  HALL_SPEED_PX_PER_SEC,
  HALL_START,
  museumExhibits,
  museumFloors,
  museumWalls,
} from '../museumExhibits'

const walkerSrc = `${import.meta.env.BASE_URL}avatars/map-walker.png`
const floorSrc = `${import.meta.env.BASE_URL}museum/floor-pattern.png`

function PixelFrame({ src }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const image = new Image()
    image.src = src
    image.onload = () => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      const cols = 36
      const rows = 26
      canvas.width = cols
      canvas.height = rows
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      const scale = Math.max(cols / image.width, rows / image.height)
      const dw = image.width * scale
      const dh = image.height * scale
      ctx.drawImage(image, (cols - dw) / 2, (rows - dh) / 2, dw, dh)
    }
    return () => {
      cancelled = true
    }
  }, [src])

  return <canvas ref={canvasRef} className="museum-picture-pixels" aria-hidden="true" />
}

function rectClearance(x, y, rect) {
  const left = x - rect.x
  const right = rect.x + rect.w - x
  const top = y - rect.y
  const bottom = rect.y + rect.h - y
  if (left >= 0 && right >= 0 && top >= 0 && bottom >= 0) {
    return Math.min(left, right, top, bottom)
  }
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w))
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h))
  return -Math.hypot(x - nearestX, y - nearestY)
}

function floorClearance(x, y) {
  let best = -Infinity
  for (const floor of museumFloors) {
    const gap = rectClearance(x, y, floor)
    if (gap > best) best = gap
  }
  return best
}

function distanceToPicture(x, y, exhibit) {
  const rect = {
    x: exhibit.x - exhibit.w / 2,
    y: exhibit.y,
    w: exhibit.w,
    h: exhibit.h,
  }
  const gap = rectClearance(x, y, rect)
  return gap >= 0 ? 0 : -gap
}

function movePlayer(player, dx, dy) {
  const next = { x: player.x + dx, y: player.y + dy }
  const xOnly = { x: next.x, y: player.y }
  const yOnly = { x: player.x, y: next.y }
  if (floorClearance(next.x, next.y) >= 0) return next
  if (floorClearance(xOnly.x, xOnly.y) >= 0) return xOnly
  if (floorClearance(yOnly.x, yOnly.y) >= 0) return yOnly

  const stuck = floorClearance(player.x, player.y)
  if (stuck < 0) {
    let best = player
    let bestGap = stuck
    for (const option of [next, xOnly, yOnly]) {
      const gap = floorClearance(option.x, option.y)
      if (gap > bestGap) {
        best = option
        bestGap = gap
      }
    }
    return best
  }

  return player
}

export default function MuseumHall() {
  const hallRef = useRef(null)
  const worldRef = useRef(null)
  const walkerRef = useRef(null)
  const shadowRef = useRef(null)
  const playerRef = useRef({ x: HALL_START.x, y: HALL_START.y })
  const vectorRef = useRef({ x: 0, y: 0 })
  const pausedRef = useRef(false)
  const nearbyIdRef = useRef(null)
  const [activeExhibit, setActiveExhibit] = useState(null)
  const [nearbyExhibit, setNearbyExhibit] = useState(null)

  useEffect(() => {
    pausedRef.current = Boolean(activeExhibit)
    if (activeExhibit) walkerRef.current?.classList.remove('is-walking')
  }, [activeExhibit])

  const handleVector = useCallback((vector) => {
    vectorRef.current = vector
  }, [])

  const closeExhibit = useCallback(() => {
    setActiveExhibit(null)
  }, [])

  const openNearbyExhibit = useCallback(() => {
    if (!nearbyExhibit) return
    setActiveExhibit(nearbyExhibit)
  }, [nearbyExhibit])

  useLayoutEffect(() => {
    const hall = hallRef.current
    if (!hall) return undefined
    let cancelled = false

    function placeScene() {
      const player = playerRef.current
      if (worldRef.current) {
        worldRef.current.style.transform = `translate(${hall.clientWidth / 2 - player.x}px, ${hall.clientHeight / 2 - player.y}px)`
      }
      if (walkerRef.current) {
        walkerRef.current.style.left = `${player.x}px`
        walkerRef.current.style.top = `${player.y}px`
      }
      if (shadowRef.current) {
        shadowRef.current.style.left = `${player.x}px`
        shadowRef.current.style.top = `${player.y}px`
      }
    }

    function syncNearby() {
      const player = playerRef.current
      let nearest = null
      let nearestDist = Infinity
      for (const exhibit of museumExhibits) {
        const distance = distanceToPicture(player.x, player.y, exhibit)
        if (distance < nearestDist) {
          nearestDist = distance
          nearest = exhibit
        }
      }
      const inRange = nearest && nearestDist <= EXHIBIT_VIEW_RADIUS_PX ? nearest : null
      const nextId = inRange?.id ?? null
      if (nearbyIdRef.current === nextId) return
      nearbyIdRef.current = nextId
      setNearbyExhibit(inRange)
    }

    placeScene()
    syncNearby()

    const resize = () => {
      if (cancelled) return
      placeScene()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(hall)
    window.addEventListener('orientationchange', resize)

    let rafId = 0
    let lastTime = performance.now()

    function tick(now) {
      if (cancelled) return
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const vector = vectorRef.current
      const mag = Math.hypot(vector.x, vector.y)

      if (!pausedRef.current && mag > 0.01) {
        walkerRef.current?.classList.add('is-walking')
        playerRef.current = movePlayer(
          playerRef.current,
          vector.x * HALL_SPEED_PX_PER_SEC * dt,
          vector.y * HALL_SPEED_PX_PER_SEC * dt,
        )
      } else {
        walkerRef.current?.classList.remove('is-walking')
      }

      placeScene()
      syncNearby()
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('orientationchange', resize)
    }
  }, [])

  const activePin = activeExhibit
    ? {
        id: activeExhibit.id,
        title: activeExhibit.title,
        photo: activeExhibit.photo,
        body: activeExhibit.caption,
      }
    : null

  return (
    <div ref={hallRef} className="museum">
      <div
        ref={worldRef}
        className="museum-world"
        style={{ width: HALL.width, height: HALL.height }}
      >
        {museumFloors.map((floor) => (
          <div
            key={floor.id}
            className="museum-floor"
            style={{
              left: floor.x,
              top: floor.y,
              width: floor.w,
              height: floor.h,
              '--floor-src': `url("${floorSrc}")`,
            }}
          />
        ))}
        {museumWalls.map((wall) => (
          <div
            key={wall.id}
            className="museum-wall"
            style={{ left: wall.x, top: wall.y, width: wall.w, height: wall.h }}
          />
        ))}
        {museumExhibits.map((exhibit) => (
          <div
            key={exhibit.id}
            className="museum-picture"
            style={{
              left: exhibit.x,
              top: exhibit.y,
              width: exhibit.w,
              height: exhibit.h,
              marginLeft: -exhibit.w / 2,
            }}
          >
            <PixelFrame src={`${import.meta.env.BASE_URL}${exhibit.photo}`} />
          </div>
        ))}
        <div ref={shadowRef} className="museum-shadow" />
        <img
          ref={walkerRef}
          className="map-walker"
          src={walkerSrc}
          alt=""
          draggable={false}
        />
      </div>
      {nearbyExhibit && !activeExhibit ? (
        <button
          type="button"
          className="map-pin-open"
          aria-label={`View ${nearbyExhibit.title}`}
          onClick={openNearbyExhibit}
        >
          View
        </button>
      ) : null}
      <Joystick onVector={handleVector} paused={Boolean(activeExhibit)} />
      {activePin ? <MapPinModal pin={activePin} onClose={closeExhibit} /> : null}
    </div>
  )
}
