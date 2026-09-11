import { useCallback, useEffect, useRef, useState } from 'react'
import { createInput } from '../maze/input'
import { createCityEngine } from './engine'
import { ACTION_CODES } from './constants'
import './citymap.css'

function DPad({ input }) {
  const bind = (dir) => ({
    onPointerDown(event) {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      input.setDir(dir, true)
    },
    onPointerUp(event) {
      event.preventDefault()
      input.setDir(dir, false)
    },
    onPointerCancel() {
      input.setDir(dir, false)
    },
    onLostPointerCapture() {
      input.setDir(dir, false)
    },
    onContextMenu(event) {
      event.preventDefault()
    },
  })

  return (
    <div className="city-dpad" aria-hidden="true">
      <button type="button" className="city-dpad-up" {...bind('up')} tabIndex={-1}>
        ▲
      </button>
      <button type="button" className="city-dpad-left" {...bind('left')} tabIndex={-1}>
        ◀
      </button>
      <button type="button" className="city-dpad-right" {...bind('right')} tabIndex={-1}>
        ▶
      </button>
      <button type="button" className="city-dpad-down" {...bind('down')} tabIndex={-1}>
        ▼
      </button>
    </div>
  )
}

function LandmarkModal({ landmark, onClose }) {
  return (
    <div className="city-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="city-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={landmark.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="city-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="city-modal-photo">
          <img src={landmark.image} alt={landmark.name} />
        </div>
        <h2 className="city-modal-title">{landmark.name}</h2>
        <p className="city-modal-story">{landmark.story}</p>
      </div>
    </div>
  )
}

export default function CityMapGame() {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [input] = useState(() => createInput())
  const [active, setActive] = useState(null)
  const [open, setOpen] = useState(null)
  const openRef = useRef(null)

  const devPlace =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('place')
  const [coord, setCoord] = useState(null)
  const [playerPos, setPlayerPos] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return undefined
    let cancelled = false
    let engine

    createCityEngine({ canvas, stage, input, onActiveLandmark: setActive }).then((created) => {
      if (cancelled) {
        created.destroy()
        return
      }
      engine = created
      engineRef.current = created
    })

    const blockScroll = (event) => event.preventDefault()
    stage.addEventListener('touchmove', blockScroll, { passive: false })

    return () => {
      cancelled = true
      engine?.destroy()
      engineRef.current = null
      stage.removeEventListener('touchmove', blockScroll)
      input.clear()
    }
  }, [input])

  // Own the keyboard listeners here (not in the async engine) so React
  // StrictMode's mount/unmount/mount cannot leave the window without listeners.
  useEffect(() => {
    input.attach()
    stageRef.current?.focus()
    return () => input.detach()
  }, [input])

  const openActive = useCallback(() => {
    if (openRef.current || !active) return
    openRef.current = active
    setOpen(active)
    engineRef.current?.setPaused(true)
  }, [active])

  const close = useCallback(() => {
    openRef.current = null
    setOpen(null)
    input.clear()
    engineRef.current?.setPaused(false)
  }, [input])

  useEffect(() => {
    function onKeyDown(event) {
      if (openRef.current) {
        if (event.key === 'Escape') {
          event.preventDefault()
          close()
        }
        return
      }
      if (ACTION_CODES.has(event.code)) {
        event.preventDefault()
        openActive()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openActive, close])

  useEffect(() => {
    if (!devPlace) return undefined
    const id = setInterval(() => {
      setPlayerPos(engineRef.current?.getPlayer() ?? null)
    }, 120)
    return () => clearInterval(id)
  }, [devPlace])

  function handleCanvasClick(event) {
    if (!devPlace || !engineRef.current) return
    const point = engineRef.current.worldFromClient(event.clientX, event.clientY)
    setCoord(point)
    const text = `${point.x}, ${point.y}`
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  return (
    <div className="city-root">
      <div
        className="city-stage"
        ref={stageRef}
        role="application"
        aria-label="NYC map explorer"
        tabIndex={-1}
      >
        <canvas ref={canvasRef} className="city-canvas" onClick={handleCanvasClick}>
          A walkable map of New York City
        </canvas>

        <DPad input={input} />

        <button
          type="button"
          className="city-action"
          aria-label="Interact"
          disabled={!active}
          onPointerDown={(event) => {
            event.preventDefault()
            openActive()
          }}
        >
          Ⓐ
        </button>

        {active && !open ? (
          <button type="button" className="city-prompt" onClick={openActive}>
            Press <span className="city-prompt-key">Ⓐ</span> to visit {active.name}
          </button>
        ) : null}

        {devPlace ? (
          <div className="city-coords" aria-hidden="true">
            <div>player: {playerPos ? `${playerPos.x}, ${playerPos.y}` : '—'}</div>
            <div>click: {coord ? `${coord.x}, ${coord.y} (copied)` : 'click map'}</div>
          </div>
        ) : null}
      </div>

      {open ? <LandmarkModal landmark={open} onClose={close} /> : null}
    </div>
  )
}
