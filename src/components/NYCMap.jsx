import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import Joystick from './Joystick'
import MapPinModal from './MapPinModal'
import { MAP_MAX_ZOOM, MAP_MIN_ZOOM, MAP_START, mapPins } from '../mapPins'

const SPEED_PX_PER_SEC = 180
const CLUSTER_PX = 30
const TARGET_GAP_PX = 30
const SPREAD_ENTER_PX = 155
const SPREAD_EXIT_PX = 180
const MAX_SHIFT_PX = 30
const SEPARATION_STEPS = 8
const walkerSrc = `${import.meta.env.BASE_URL}avatars/map-walker.png`
const pinImgUrl = window.devicePixelRatio > 1 ? iconRetinaUrl : iconUrl

const pinIcon = L.divIcon({
  className: 'map-pin-marker',
  iconSize: [48, 56],
  iconAnchor: [24, 56],
  html: `<img class="map-pin-shadow" src="${shadowUrl}" alt="" draggable="false" /><img class="map-pin-img" src="${pinImgUrl}" alt="" draggable="false" />`,
})

function separate(pos, mover, other, moverShare) {
  let dx = pos[other].x - pos[mover].x
  let dy = pos[other].y - pos[mover].y
  let len = Math.hypot(dx, dy)
  if (len < 1) {
    const angle = ((mover * 2 + other) * Math.PI) / 4
    dx = Math.cos(angle)
    dy = Math.sin(angle)
    len = 1
  }
  if (len >= TARGET_GAP_PX) return
  const push = TARGET_GAP_PX - len
  const ux = (dx / len) * push
  const uy = (dy / len) * push
  pos[mover].x -= ux * moverShare
  pos[mover].y -= uy * moverShare
  if (moverShare < 1) {
    const otherShare = 1 - moverShare
    pos[other].x += ux * otherShare
    pos[other].y += uy * otherShare
  }
}

function spreadTargets(points, engagedPairs) {
  const pos = points.map((point) => L.point(point.x, point.y))
  const movable = new Array(points.length).fill(false)
  for (const [i, j] of engagedPairs) {
    movable[i] = true
    movable[j] = true
  }

  for (let step = 0; step < SEPARATION_STEPS; step++) {
    for (const [i, j] of engagedPairs) separate(pos, i, j, 0.5)
    for (let i = 0; i < pos.length; i++) {
      if (!movable[i]) continue
      for (let k = 0; k < pos.length; k++) {
        if (i === k || movable[k]) continue
        const dx = points[k].x - points[i].x
        const dy = points[k].y - points[i].y
        if (Math.hypot(dx, dy) >= CLUSTER_PX) continue
        separate(pos, i, k, 1)
      }
    }
    for (let i = 0; i < pos.length; i++) {
      if (!movable[i]) continue
      const dx = pos[i].x - points[i].x
      const dy = pos[i].y - points[i].y
      const shift = Math.hypot(dx, dy)
      if (shift <= MAX_SHIFT_PX) continue
      const scale = MAX_SHIFT_PX / shift
      pos[i].x = points[i].x + dx * scale
      pos[i].y = points[i].y + dy * scale
    }
  }

  return pos
}

export default function NYCMap() {
  const canvasRef = useRef(null)
  const mapRef = useRef(null)
  const playerRef = useRef({ lat: MAP_START.lat, lng: MAP_START.lng })
  const vectorRef = useRef({ x: 0, y: 0 })
  const pausedRef = useRef(false)
  const walkerRef = useRef(null)
  const [activePin, setActivePin] = useState(null)

  useEffect(() => {
    pausedRef.current = Boolean(activePin)
    if (activePin) walkerRef.current?.classList.remove('is-walking')
  }, [activePin])

  const handleVector = useCallback((vector) => {
    vectorRef.current = vector
  }, [])

  const closePin = useCallback(() => {
    setActivePin(null)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    let cancelled = false
    const map = L.map(canvas, {
      center: [MAP_START.lat, MAP_START.lng],
      zoom: MAP_START.zoom,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAP_MAX_ZOOM,
    }).addTo(map)

    const markers = []
    const spreadPairs = new Set()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    for (const pin of mapPins) {
      if (pin.circleRadius) {
        L.circle([pin.lat, pin.lng], {
          radius: pin.circleRadius,
          color: '#ff1a1a',
          fillColor: '#ff1a1a',
          fillOpacity: 0.45,
          weight: 3,
          interactive: false,
        }).addTo(map)
      }
      const marker = L.marker([pin.lat, pin.lng], {
        icon: pinIcon,
        title: pin.title || undefined,
        keyboard: true,
      })
      marker.on('click', () => setActivePin(pin))
      marker.addTo(map)
      const icon = marker.getElement()
      if (icon) {
        icon.setAttribute('role', 'button')
        icon.setAttribute('aria-label', pin.title ? `Open ${pin.title}` : 'Open photo')
      }
      markers.push(marker)
    }

    function updatePins(mapInstance, dt) {
      const player = mapInstance.latLngToContainerPoint(playerRef.current)
      const truth = mapPins.map((pin) =>
        mapInstance.latLngToContainerPoint([pin.lat, pin.lng]),
      )
      const zoom = Math.round(mapInstance.getZoom())
      const engaged = []
      const nextSpread = new Set()

      if (zoom > MAP_MIN_ZOOM) {
        for (let i = 0; i < mapPins.length; i++) {
          for (let j = i + 1; j < mapPins.length; j++) {
            const dx = truth[j].x - truth[i].x
            const dy = truth[j].y - truth[i].y
            if (Math.hypot(dx, dy) > CLUSTER_PX) continue
            const near = Math.hypot(
              player.x - (truth[i].x + truth[j].x) / 2,
              player.y - (truth[i].y + truth[j].y) / 2,
            )
            const key = `${mapPins[i].id}|${mapPins[j].id}`
            const limit = spreadPairs.has(key) ? SPREAD_EXIT_PX : SPREAD_ENTER_PX
            if (near > limit) continue
            nextSpread.add(key)
            engaged.push([i, j])
          }
        }
      }

      spreadPairs.clear()
      for (const key of nextSpread) spreadPairs.add(key)

      const goals = engaged.length ? spreadTargets(truth, engaged) : truth
      const step = reduceMotion ? 1 : 1 - Math.exp(-14 * dt)

      for (let i = 0; i < markers.length; i++) {
        const marker = markers[i]
        const goal = goals[i]
        const current = mapInstance.latLngToContainerPoint(marker.getLatLng())
        const dx = goal.x - current.x
        const dy = goal.y - current.y
        const dist = Math.hypot(dx, dy)
        const fanned = Math.hypot(goal.x - truth[i].x, goal.y - truth[i].y) > 1
        marker.getElement()?.classList.toggle('is-fanned', fanned)
        if (marker.options.zIndexOffset !== (fanned ? 500 : 0)) {
          marker.setZIndexOffset(fanned ? 500 : 0)
        }

        if (dist < 0.4) {
          if (!fanned) {
            const at = marker.getLatLng()
            const pin = mapPins[i]
            if (Math.abs(at.lat - pin.lat) > 1e-7 || Math.abs(at.lng - pin.lng) > 1e-7) {
              marker.setLatLng([pin.lat, pin.lng])
            }
          }
          continue
        }

        const next = L.point(current.x + dx * step, current.y + dy * step)
        marker.setLatLng(mapInstance.containerPointToLatLng(next))
      }
    }

    mapRef.current = map
    playerRef.current = { lat: MAP_START.lat, lng: MAP_START.lng }

    const resize = () => {
      if (cancelled || !mapRef.current) return
      map.invalidateSize()
      map.setView(playerRef.current, map.getZoom(), { animate: false })
      updatePins(map, 0.05)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('orientationchange', resize)
    requestAnimationFrame(resize)

    let rafId = 0
    let lastTime = performance.now()

    function tick(now) {
      if (cancelled) return
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const mapInstance = mapRef.current
      const vector = vectorRef.current

      if (mapInstance && !pausedRef.current) {
        const mag = Math.hypot(vector.x, vector.y)
        walkerRef.current?.classList.toggle('is-walking', mag > 0.01)
        if (mag > 0.01) {
          const center = mapInstance.latLngToContainerPoint(playerRef.current)
          const nextPoint = L.point(
            center.x + vector.x * SPEED_PX_PER_SEC * dt,
            center.y + vector.y * SPEED_PX_PER_SEC * dt,
          )
          const next = mapInstance.containerPointToLatLng(nextPoint)
          playerRef.current = { lat: next.lat, lng: next.lng }
          mapInstance.setView(playerRef.current, mapInstance.getZoom(), {
            animate: false,
          })
        }
      } else {
        walkerRef.current?.classList.remove('is-walking')
      }

      if (mapInstance) updatePins(mapInstance, dt)

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('orientationchange', resize)
      map.remove()
      mapRef.current = null
    }
  }, [mapPins])

  function goHome() {
    const map = mapRef.current
    if (!map) return
    setActivePin(null)
    playerRef.current = { lat: MAP_START.lat, lng: MAP_START.lng }
    map.setView(playerRef.current, MAP_START.zoom, { animate: false })
  }

  function zoomBy(delta) {
    const map = mapRef.current
    if (!map || pausedRef.current) return
    const nextZoom = Math.min(
      MAP_MAX_ZOOM,
      Math.max(MAP_MIN_ZOOM, map.getZoom() + delta),
    )
    map.setView(playerRef.current, nextZoom, { animate: false })
  }

  return (
    <div className="nyc-map">
      <div ref={canvasRef} className="nyc-map-canvas" />
      <img
        ref={walkerRef}
        className="map-walker"
        src={walkerSrc}
        alt=""
        draggable={false}
      />
      <button
        type="button"
        className="map-home"
        aria-label="Return to drop-off"
        onClick={goHome}
      >
        Home
      </button>
      <Joystick onVector={handleVector} paused={Boolean(activePin)} />
      <div className="map-zoom">
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1)}>
          +
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-1)}>
          −
        </button>
      </div>
      {activePin ? <MapPinModal pin={activePin} onClose={closePin} /> : null}
    </div>
  )
}
