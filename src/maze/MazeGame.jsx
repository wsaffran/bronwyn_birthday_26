import { useCallback, useEffect, useRef, useState } from 'react'
import { HUD_ASPECT, HUD_LETTERS, ICONS } from './icons'
import { createInput } from './input'
import { createMazeEngine } from './engine'
import { readComplete, writeComplete } from './persist'
import './maze.css'

function ArchHud({ collected }) {
  return (
    <div className="maze-hud" aria-hidden="true">
      <div className="maze-hud-arch" style={{ aspectRatio: `${HUD_ASPECT}` }}>
        <img className="maze-hud-letters" src={HUD_LETTERS} alt="" />
        {ICONS.map((icon) => {
          const found = collected.includes(icon.id)
          return (
            <img
              key={icon.id}
              className={found ? 'maze-hud-icon is-found' : 'maze-hud-icon is-missing'}
              src={icon.white}
              alt=""
              style={{
                left: `${icon.nx * 100}%`,
                top: `${icon.ny * 100}%`,
                width: `${icon.nw * 100}%`,
                height: `${icon.nh * 100}%`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

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
    <div className="maze-dpad" aria-hidden="true">
      <button type="button" className="maze-dpad-up" {...bind('up')} tabIndex={-1}>
        ▲
      </button>
      <button type="button" className="maze-dpad-left" {...bind('left')} tabIndex={-1}>
        ◀
      </button>
      <button type="button" className="maze-dpad-right" {...bind('right')} tabIndex={-1}>
        ▶
      </button>
      <button type="button" className="maze-dpad-down" {...bind('down')} tabIndex={-1}>
        ▼
      </button>
    </div>
  )
}

function WinScreen({ onPlayAgain }) {
  return (
    <div className="maze-win">
      <ArchHud collected={ICONS.map((icon) => icon.id)} />
      <p className="maze-win-kicker">You found them all.</p>
      <div className="maze-win-gift">
        {/* Placeholder for the real Day 2 gift. */}
      </div>
      <button type="button" onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  )
}

export default function MazeGame() {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const [input] = useState(() => createInput())
  const [collected, setCollected] = useState([])
  const [complete, setComplete] = useState(readComplete)
  const [playing, setPlaying] = useState(() => !readComplete())

  const handleWin = useCallback(() => {
    writeComplete()
    setComplete(true)
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!playing) return undefined
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return undefined
    let cancelled = false
    let engine

    createMazeEngine({
      canvas,
      stage,
      input,
      onCollect: setCollected,
      onWin: handleWin,
    }).then((created) => {
      if (cancelled) {
        created.destroy()
        return
      }
      engine = created
    })

    const blockScroll = (event) => event.preventDefault()
    stage.addEventListener('touchmove', blockScroll, { passive: false })

    return () => {
      cancelled = true
      engine?.destroy()
      stage.removeEventListener('touchmove', blockScroll)
      input.clear()
    }
  }, [playing, handleWin, input])

  function playAgain() {
    setCollected([])
    setPlaying(true)
  }

  if (complete && !playing) {
    return (
      <div className="maze-root maze-root-win">
        <WinScreen onPlayAgain={playAgain} />
      </div>
    )
  }

  return (
    <div className="maze-root">
      <ArchHud collected={collected} />
      <div className="maze-stage" ref={stageRef} role="application" aria-label="Gothic maze">
        <div className="visually-hidden" aria-live="polite">
          {collected.length} of 5 icons found
        </div>
        <canvas ref={canvasRef} className="maze-canvas">
          Chiaki gothic maze
        </canvas>
        <DPad input={input} />
      </div>
    </div>
  )
}
