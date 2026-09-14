import { useEffect, useRef } from 'react'

const DEADZONE = 0.12
const KEY_DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
}

function clampVector(x, y) {
  const mag = Math.hypot(x, y)
  if (mag > 1) {
    return { x: x / mag, y: y / mag }
  }
  return { x, y }
}

function applyDeadzone(x, y) {
  const mag = Math.hypot(x, y)
  if (mag < DEADZONE) return { x: 0, y: 0 }
  const scaled = (mag - DEADZONE) / (1 - DEADZONE)
  return { x: (x / mag) * scaled, y: (y / mag) * scaled }
}

export default function Joystick({ onVector, paused }) {
  const padRef = useRef(null)
  const knobRef = useRef(null)
  const pointerIdRef = useRef(null)
  const stickRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef(new Set())
  const pausedRef = useRef(paused)
  const onVectorRef = useRef(onVector)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    onVectorRef.current = onVector
  }, [onVector])

  useEffect(() => {
    function emit() {
      if (pausedRef.current) {
        onVectorRef.current({ x: 0, y: 0 })
        return
      }

      let x = stickRef.current.x
      let y = stickRef.current.y
      for (const code of keysRef.current) {
        const dir = KEY_DIRS[code]
        if (!dir) continue
        x += dir.x
        y += dir.y
      }

      onVectorRef.current(clampVector(x, y))
    }

    function setKnob(x, y) {
      const knob = knobRef.current
      const pad = padRef.current
      if (!knob || !pad) return
      const travel = Math.max(16, pad.clientWidth / 2 - 22)
      knob.style.transform = `translate(${x * travel}px, ${y * travel}px)`
    }

    function vectorFromPointer(event) {
      const pad = padRef.current
      if (!pad) return { x: 0, y: 0 }
      const box = pad.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      const max = box.width / 2 - 10
      const mag = Math.hypot(dx, dy)
      const clampedX = mag > max ? (dx / mag) * max : dx
      const clampedY = mag > max ? (dy / mag) * max : dy
      return applyDeadzone(clampedX / max, clampedY / max)
    }

    function onPointerDown(event) {
      if (pausedRef.current) return
      if (pointerIdRef.current !== null) return
      pointerIdRef.current = event.pointerId
      padRef.current?.setPointerCapture(event.pointerId)
      const next = vectorFromPointer(event)
      stickRef.current = next
      setKnob(next.x, next.y)
      emit()
      event.preventDefault()
    }

    function onPointerMove(event) {
      if (event.pointerId !== pointerIdRef.current) return
      const next = vectorFromPointer(event)
      stickRef.current = next
      setKnob(next.x, next.y)
      emit()
      event.preventDefault()
    }

    function releasePointer(event) {
      if (event.pointerId !== pointerIdRef.current) return
      pointerIdRef.current = null
      stickRef.current = { x: 0, y: 0 }
      setKnob(0, 0)
      emit()
    }

    function onKeyDown(event) {
      if (pausedRef.current) return
      if (!KEY_DIRS[event.code]) return
      if (event.repeat) return
      keysRef.current.add(event.code)
      if (event.code.startsWith('Arrow')) event.preventDefault()
      emit()
    }

    function onKeyUp(event) {
      if (!KEY_DIRS[event.code]) return
      keysRef.current.delete(event.code)
      emit()
    }

    const pad = padRef.current
    pad.addEventListener('pointerdown', onPointerDown)
    pad.addEventListener('pointermove', onPointerMove)
    pad.addEventListener('pointerup', releasePointer)
    pad.addEventListener('pointercancel', releasePointer)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      pad.removeEventListener('pointerdown', onPointerDown)
      pad.removeEventListener('pointermove', onPointerMove)
      pad.removeEventListener('pointerup', releasePointer)
      pad.removeEventListener('pointercancel', releasePointer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    if (!paused) return
    pointerIdRef.current = null
    stickRef.current = { x: 0, y: 0 }
    keysRef.current.clear()
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)'
    onVectorRef.current({ x: 0, y: 0 })
  }, [paused])

  return (
    <div className="map-joystick" aria-hidden="true">
      <div ref={padRef} className="map-joystick-pad">
        <div ref={knobRef} className="map-joystick-knob" />
      </div>
    </div>
  )
}
