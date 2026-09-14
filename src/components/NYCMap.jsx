import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import Joystick from './Joystick'
import MapPinModal from './MapPinModal'
import {
  MAP_MAX_ZOOM,
  MAP_MIN_ZOOM,
  MAP_START,
  mapPins,
} from '../mapPins'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const SPEED_PX_PER_SEC = 180
const walkerSrc = `${import.meta.env.BASE_URL}cats/cat-1.png`

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
    const map = L.map(canvas, {
      center: [MAP_START.lat, MAP_START.lng],
      zoom: MAP_START.zoom,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: MAP_MAX_ZOOM,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    for (const pin of mapPins) {
      const layer = pin.circleRadius
        ? L.circle([pin.lat, pin.lng], {
            radius: pin.circleRadius,
            color: '#ff1a1a',
            fillColor: '#ff1a1a',
            fillOpacity: 0.45,
            weight: 3,
          })
        : L.marker([pin.lat, pin.lng], { title: pin.title })
      layer.addTo(map)
      layer.on('click', () => {
        setActivePin(pin)
      })
    }

    mapRef.current = map
    playerRef.current = { lat: MAP_START.lat, lng: MAP_START.lng }

    const resize = () => {
      map.invalidateSize()
      map.setView(playerRef.current, map.getZoom(), { animate: false })
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('orientationchange', resize)
    requestAnimationFrame(resize)

    let rafId = 0
    let lastTime = performance.now()

    function tick(now) {
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

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('orientationchange', resize)
      map.remove()
      mapRef.current = null
    }
  }, [])

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
