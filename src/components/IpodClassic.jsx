import { useEffect, useRef, useState } from 'react'
import { ipodMenuTitle, ipodMessages } from '../ipodMessages'

const VISIBLE_ROWS = 5
const STEP_RADIANS = (18 * Math.PI) / 180
const TAP_SLOP_PX = 12
const WHEEL_DELTA_PX = 36
const RESTART_AFTER_SECONDS = 3

function resolveSrc(src) {
  if (!src) return ''
  if (/^(https?:|blob:|data:)/.test(src)) return src
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(src).replace(/^\//, '')}`
}

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

function windowStart(selected, count, visible) {
  if (count <= visible) return 0
  const max = count - visible
  const ideal = selected - Math.floor((visible - 1) / 2)
  return Math.min(max, Math.max(0, ideal))
}

function pointerAngle(event, element) {
  const rect = element.getBoundingClientRect()
  const x = event.clientX - (rect.left + rect.width / 2)
  const y = event.clientY - (rect.top + rect.height / 2)
  return Math.atan2(y, x)
}

function shortestDelta(previous, next) {
  let delta = next - previous
  if (delta > Math.PI) delta -= Math.PI * 2
  if (delta < -Math.PI) delta += Math.PI * 2
  return delta
}

function wheelZone(event, element) {
  const angle = pointerAngle(event, element)
  const quarter = Math.PI / 4
  if (angle >= -3 * quarter && angle < -quarter) return 'menu'
  if (angle >= -quarter && angle < quarter) return 'next'
  if (angle >= quarter && angle < 3 * quarter) return 'play'
  return 'prev'
}

let clickContext = null

function playMenuClick() {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) return
  if (!clickContext) clickContext = new Context()
  if (clickContext.state === 'suspended') void clickContext.resume()
  const now = clickContext.currentTime
  const osc = clickContext.createOscillator()
  const gain = clickContext.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1400, now)
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.016)
  gain.gain.setValueAtTime(0.04, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)
  osc.connect(gain)
  gain.connect(clickContext.destination)
  osc.start(now)
  osc.stop(now + 0.022)
}

function Battery() {
  return (
    <svg className="ipod-battery" viewBox="0 0 28 12" aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="23"
        height="10.5"
        rx="1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="24.6" y="3.4" width="2.2" height="5.2" rx="0.6" fill="currentColor" />
      <rect x="2.1" y="2.15" width="20.2" height="7.7" rx="0.6" fill="currentColor" />
    </svg>
  )
}

function PlayMark() {
  return (
    <svg className="ipod-playmark" viewBox="0 0 10 10" aria-hidden="true">
      <path fill="currentColor" d="M1.6 0.8v8.4L9 5 1.6 0.8z" />
    </svg>
  )
}

const ipodPhoto = `${import.meta.env.BASE_URL}ipod-classic.png`

export default function IpodClassic() {
  const count = ipodMessages.length
  const rootRef = useRef(null)
  const wheelRef = useRef(null)
  const audioRef = useRef(null)
  const dragRef = useRef(null)
  const pressTimer = useRef(0)
  const playToken = useRef(0)
  const wheelDelta = useRef(0)
  const selectedRef = useRef(0)
  const currentRef = useRef(null)
  const screenRef = useRef('menu')
  const missingRef = useRef(false)
  const actionsRef = useRef({})

  const [screen, setScreen] = useState('menu')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [missing, setMissing] = useState(false)
  const [unplayable, setUnplayable] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [pressed, setPressed] = useState(null)

  function setScreenTo(next) {
    screenRef.current = next
    setScreen(next)
  }

  function messageIsAudible() {
    const audio = audioRef.current
    return Boolean(audio && !audio.paused && audio.currentSrc && !missingRef.current)
  }

  function clickIfQuiet() {
    if (!messageIsAudible()) playMenuClick()
  }

  function moveSelection(direction) {
    if (count === 0) return
    const next = Math.min(count - 1, Math.max(0, selectedRef.current + direction))
    if (next === selectedRef.current) return
    selectedRef.current = next
    setSelectedIndex(next)
    clickIfQuiet()
  }

  function scrubBy(steps) {
    const audio = audioRef.current
    if (!audio || missingRef.current) return
    const length = audio.duration
    if (!Number.isFinite(length) || length <= 0) return
    const delta = steps * Math.max(0.5, length / 20)
    const next = Math.min(length, Math.max(0, audio.currentTime + delta))
    audio.currentTime = next
    setCurrentTime(next)
  }

  function stepWheel(direction) {
    if (screenRef.current === 'menu') moveSelection(direction)
    else scrubBy(direction)
  }

  function loadTrack(index, autoplay) {
    const track = ipodMessages[index]
    const audio = audioRef.current
    if (!track || !audio) return
    currentRef.current = index
    setCurrentIndex(index)
    setUnplayable(false)
    const url = resolveSrc(track.src)
    if (!url) {
      missingRef.current = true
      setMissing(true)
      setPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      playToken.current += 1
      audio.pause()
      audio.removeAttribute('src')
      delete audio.dataset.track
      audio.load()
      return
    }
    missingRef.current = false
    setMissing(false)
    if (audio.dataset.track !== track.id) {
      audio.src = url
      audio.dataset.track = track.id
    } else {
      audio.currentTime = 0
    }
    setCurrentTime(0)
    if (!autoplay) {
      playToken.current += 1
      audio.pause()
      setPlaying(false)
      return
    }
    const token = ++playToken.current
    const pending = audio.play()
    if (!pending) return
    pending
      .then(() => {
        if (playToken.current === token) setPlaying(true)
      })
      .catch(() => {
        if (playToken.current === token) setPlaying(false)
      })
  }

  function openHighlighted() {
    if (count === 0) return
    const index = selectedRef.current
    const audio = audioRef.current
    setScreenTo('nowPlaying')
    if (
      currentRef.current === index &&
      audio &&
      !missingRef.current &&
      audio.currentSrc
    ) {
      if (audio.paused) {
        audio.play().catch(() => setPlaying(false))
      }
      return
    }
    loadTrack(index, Boolean(resolveSrc(ipodMessages[index].src)))
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || missingRef.current || !audio.currentSrc) return
    if (audio.paused) audio.play().catch(() => setPlaying(false))
    else audio.pause()
  }

  function center() {
    if (screenRef.current === 'menu') openHighlighted()
    else togglePlay()
  }

  function playPause() {
    if (screenRef.current === 'menu') openHighlighted()
    else togglePlay()
  }

  function menu() {
    setScreenTo('menu')
  }

  function previous() {
    const audio = audioRef.current
    const index = currentRef.current
    if (index == null) {
      if (screenRef.current === 'menu') moveSelection(-1)
      return
    }
    if (!missingRef.current && audio && audio.currentTime > RESTART_AFTER_SECONDS) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }
    if (index <= 0) {
      if (audio && !missingRef.current) {
        audio.currentTime = 0
        setCurrentTime(0)
      }
      return
    }
    loadTrack(index - 1, true)
  }

  function next() {
    const index = currentRef.current
    if (index == null) {
      if (screenRef.current === 'menu') moveSelection(1)
      return
    }
    if (index >= count - 1) return
    loadTrack(index + 1, true)
  }

  function onEnded() {
    const index = currentRef.current
    const audio = audioRef.current
    if (index == null) return
    if (index >= count - 1) {
      setCurrentTime(audio?.currentTime || audio?.duration || 0)
      setPlaying(false)
      return
    }
    loadTrack(index + 1, true)
  }

  useEffect(() => {
    screenRef.current = screen
    selectedRef.current = selectedIndex
    currentRef.current = currentIndex
    missingRef.current = missing
    actionsRef.current = { stepWheel, menu, previous, next, playPause, center }
  })

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
      window.clearTimeout(pressTimer.current)
    }
  }, [])

  useEffect(() => {
    const wheel = wheelRef.current
    if (!wheel) return undefined
    function onWheel(event) {
      event.preventDefault()
      wheelDelta.current += event.deltaY
      while (wheelDelta.current >= WHEEL_DELTA_PX) {
        wheelDelta.current -= WHEEL_DELTA_PX
        actionsRef.current.stepWheel(1)
      }
      while (wheelDelta.current <= -WHEEL_DELTA_PX) {
        wheelDelta.current += WHEEL_DELTA_PX
        actionsRef.current.stepWheel(-1)
      }
    }
    wheel.addEventListener('wheel', onWheel, { passive: false })
    return () => wheel.removeEventListener('wheel', onWheel)
  }, [])

  function flash(zone) {
    setPressed(zone)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(null), 140)
  }

  function onWheelPointerDown(event) {
    if (event.button !== 0) return
    if (event.target.closest('.ipod-center')) return
    const wheel = wheelRef.current
    if (!wheel) return
    try {
      wheel.setPointerCapture(event.pointerId)
    } catch {
      // Capture is unavailable until the browser is tracking this pointer.
    }
    rootRef.current?.focus({ preventScroll: true })
    dragRef.current = {
      id: event.pointerId,
      last: pointerAngle(event, wheel),
      pending: 0,
      moved: false,
      x: event.clientX,
      y: event.clientY,
    }
  }

  function onWheelPointerMove(event) {
    const drag = dragRef.current
    const wheel = wheelRef.current
    if (!drag || drag.id !== event.pointerId || !wheel) return
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > TAP_SLOP_PX) {
      drag.moved = true
    }
    const angle = pointerAngle(event, wheel)
    drag.pending += shortestDelta(drag.last, angle)
    drag.last = angle
    while (drag.pending >= STEP_RADIANS) {
      drag.pending -= STEP_RADIANS
      drag.moved = true
      actionsRef.current.stepWheel(1)
    }
    while (drag.pending <= -STEP_RADIANS) {
      drag.pending += STEP_RADIANS
      drag.moved = true
      actionsRef.current.stepWheel(-1)
    }
  }

  function onWheelPointerUp(event) {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    dragRef.current = null
    if (drag.moved) return
    const wheel = wheelRef.current
    if (!wheel) return
    const zone = wheelZone(event, wheel)
    flash(zone)
    if (zone === 'menu') actionsRef.current.menu()
    else if (zone === 'prev') actionsRef.current.previous()
    else if (zone === 'next') actionsRef.current.next()
    else actionsRef.current.playPause()
  }

  function onKeyDown(event) {
    const key = event.key
    const fromSelf = event.target === event.currentTarget
    if (!fromSelf && (key === 'Enter' || key === ' ')) return
    if (
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'Enter' ||
      key === ' ' ||
      key === 'Escape'
    ) {
      event.preventDefault()
    }
    if (key === 'ArrowUp') {
      if (screenRef.current === 'menu') moveSelection(-1)
      else scrubBy(-1)
    } else if (key === 'ArrowDown') {
      if (screenRef.current === 'menu') moveSelection(1)
      else scrubBy(1)
    } else if (key === 'ArrowLeft') previous()
    else if (key === 'ArrowRight') next()
    else if (key === 'Enter') center()
    else if (key === ' ') playPause()
    else if (key === 'Escape') menu()
  }

  const start = windowStart(selectedIndex, count, VISIBLE_ROWS)
  const rows = ipodMessages.slice(start, start + VISIBLE_ROWS)
  const blanks = Math.max(0, VISIBLE_ROWS - rows.length)
  const track = currentIndex == null ? null : ipodMessages[currentIndex]
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const note = missing
    ? 'Recording coming soon'
    : unplayable
      ? "Couldn't play this recording"
      : ''

  return (
    <div className="ipod-fit">
      <section
        className="ipod"
        ref={rootRef}
        tabIndex={0}
        aria-label="iPod"
        data-screen={screen}
        onKeyDown={onKeyDown}
      >
        <img className="ipod-photo" src={ipodPhoto} alt="" />
        <div className="ipod-screen">
          <div className="ipod-lcd">
            <div className="ipod-status">
              <span className="ipod-status-title">
                {screen === 'menu' ? ipodMenuTitle : 'Now Playing'}
              </span>
              <span className="ipod-status-icons">
                {playing ? <PlayMark /> : null}
                <Battery />
              </span>
            </div>
            {screen === 'menu' ? (
              <div
                className="ipod-menu"
                role="listbox"
                aria-label={ipodMenuTitle}
                aria-activedescendant={
                  rows[0] ? `ipod-track-${ipodMessages[selectedIndex]?.id}` : undefined
                }
              >
                {rows.map((item, offset) => {
                  const index = start + offset
                  const selected = index === selectedIndex
                  return (
                    <div
                      key={item.id}
                      id={`ipod-track-${item.id}`}
                      role="option"
                      aria-selected={selected}
                      className={selected ? 'ipod-row is-selected' : 'ipod-row'}
                    >
                      <span className="ipod-row-title">{item.title}</span>
                    </div>
                  )
                })}
                {Array.from({ length: blanks }, (_, index) => (
                  <div key={`blank-${index}`} className="ipod-row ipod-row-blank" aria-hidden="true" />
                ))}
                {count > VISIBLE_ROWS ? (
                  <div className="ipod-scrollbar" aria-hidden="true">
                    <div
                      className="ipod-scrollbar-thumb"
                      style={{
                        height: `${(VISIBLE_ROWS / count) * 100}%`,
                        top: `${(start / count) * 100}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="ipod-now">
                <p className="ipod-now-title">{track?.title ?? ''}</p>
                {note ? <p className="ipod-now-note">{note}</p> : null}
                <div
                  className="ipod-progress"
                  role="progressbar"
                  aria-label="Playback position"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration) || 0}
                  aria-valuenow={Math.round(currentTime) || 0}
                >
                  <div className="ipod-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="ipod-times">
                  <span>{formatTime(currentTime)}</span>
                  <span>
                    -{formatTime(duration > 0 ? Math.max(0, duration - currentTime) : 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="ipod-wheel"
          ref={wheelRef}
          data-zone={pressed || undefined}
          onPointerDown={onWheelPointerDown}
          onPointerMove={onWheelPointerMove}
          onPointerUp={onWheelPointerUp}
          onPointerCancel={() => {
            dragRef.current = null
          }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            type="button"
            className="ipod-center"
            aria-label="Select"
            tabIndex={-1}
            onPointerDown={(event) => {
              event.stopPropagation()
              rootRef.current?.focus({ preventScroll: true })
            }}
            onClick={() => actionsRef.current.center()}
          />
        </div>
        <audio
          ref={audioRef}
          className="visually-hidden"
          preload="none"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
          onDurationChange={(event) => {
            const next = event.currentTarget.duration
            setDuration(Number.isFinite(next) ? next : 0)
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={onEnded}
          onError={() => {
            if (missingRef.current || !audioRef.current?.currentSrc) return
            setUnplayable(true)
            setPlaying(false)
          }}
        />
      </section>
    </div>
  )
}
