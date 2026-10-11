import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { days } from '../days'
import { useProgress } from '../progress'

const HOLD_MS = 500
const MOVE_PX = 10
const TIP_GAP = 8
const TIP_MARGIN = 8

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 3.2 3 11h2.2v9.2h6.1v-6h1.4v6h6.1V11H21L12 3.2z"
      />
    </svg>
  )
}

function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth'
}

function chipRectStart(scrollerBox, chipBox, scrollLeft) {
  return chipBox.left - scrollerBox.left + scrollLeft
}

function alignScroller(scroller, chip, behavior = scrollBehavior()) {
  if (!scroller || !chip) return

  const viewport = scroller.clientWidth
  const maxScroll = Math.max(0, scroller.scrollWidth - viewport)
  const scrollerBox = scroller.getBoundingClientRect()
  const chipBox = chip.getBoundingClientRect()
  const chipStart = chipRectStart(scrollerBox, chipBox, scroller.scrollLeft)
  const left = Math.min(
    maxScroll,
    Math.max(0, chipStart - (viewport - chipBox.width) / 2),
  )

  scroller.scrollTo({ left, behavior })
}

function syncEdgeFades(scroller, fade) {
  if (!scroller || !fade) return
  const next = readEdgeFades(scroller)
  fade.classList.toggle('fade-left', next.left)
  fade.classList.toggle('fade-right', next.right)
}

function readEdgeFades(scroller) {
  const maxScroll = scroller.scrollWidth - scroller.clientWidth
  return {
    left: scroller.scrollLeft > 1,
    right: maxScroll > 1 && scroller.scrollLeft < maxScroll - 1,
  }
}

function chipClassName(locked, holding) {
  const names = []
  if (locked) names.push('is-locked')
  if (holding) names.push('is-holding')
  return names.join(' ') || undefined
}

export default function DayTrail() {
  const {
    selected,
    isHome,
    isUnlocked,
    canAttempt,
    selectDay,
    selectHome,
    relock,
  } = useProgress()
  const scrollerRef = useRef(null)
  const fadeRef = useRef(null)
  const readyRef = useRef(false)
  const holdRef = useRef(null)
  const suppressClickRef = useRef(false)
  const tipRef = useRef(null)
  const [holdingId, setHoldingId] = useState(null)
  const [tip, setTip] = useState(null)
  const focusId = isHome ? days[0].id : selected
  if (tip && (isHome || selected !== tip.id || !isUnlocked(tip.id))) {
    setTip(null)
  }

  function canRelock(id) {
    return !isHome && selected === id && isUnlocked(id)
  }

  function clearHold() {
    if (holdRef.current) {
      window.clearTimeout(holdRef.current.timer)
      holdRef.current = null
    }
    setHoldingId(null)
  }

  function openTip(button) {
    const rect = button.getBoundingClientRect()
    const anchorLeft = rect.left + rect.width / 2
    const anchorTop = rect.top - TIP_GAP
    setHoldingId(null)
    setTip({
      id: Number(button.dataset.day),
      anchorLeft,
      anchorTop,
      left: anchorLeft,
      top: anchorTop,
    })
    suppressClickRef.current = true
  }

  useEffect(() => {
    return () => {
      if (holdRef.current) window.clearTimeout(holdRef.current.timer)
    }
  }, [])

  useLayoutEffect(() => {
    const node = tipRef.current
    if (!tip || !node) return
    const box = node.getBoundingClientRect()
    const half = box.width / 2
    const left = Math.round(
      Math.min(
        window.innerWidth - TIP_MARGIN - half,
        Math.max(TIP_MARGIN + half, tip.anchorLeft),
      ),
    )
    const top = Math.round(Math.max(TIP_MARGIN + box.height, tip.anchorTop))
    if (Math.abs(left - tip.left) < 0.5 && Math.abs(top - tip.top) < 0.5) {
      const action = node.querySelector('button')
      if (action && document.activeElement !== action) {
        action.focus({ preventScroll: true })
      }
      return
    }
    setTip((current) =>
      current && current.id === tip.id ? { ...current, left, top } : current,
    )
  }, [tip])

  useEffect(() => {
    if (!tip || isHome || selected !== tip.id || !isUnlocked(tip.id)) return undefined

    function onKey(event) {
      if (event.key === 'Escape') setTip(null)
    }

    function onPointerDown(event) {
      if (tipRef.current?.contains(event.target)) return
      setTip(null)
    }

    function closeTip() {
      setTip(null)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown, true)
    const scroller = scrollerRef.current
    scroller?.addEventListener('scroll', closeTip, { passive: true })
    window.addEventListener('resize', closeTip)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown, true)
      scroller?.removeEventListener('scroll', closeTip)
      window.removeEventListener('resize', closeTip)
    }
  }, [isHome, isUnlocked, selected, tip])

  function onPointerDown(event) {
    if (event.button !== 0) return
    const button = event.currentTarget
    const id = Number(button.dataset.day)
    if (!canRelock(id)) return

    clearHold()
    const pointerId = event.pointerId
    const startX = event.clientX
    const startY = event.clientY
    const timer = window.setTimeout(() => {
      if (holdRef.current?.timer !== timer) return
      holdRef.current = null
      try {
        button.setPointerCapture(pointerId)
      } catch {
        return
      }
      openTip(button)
    }, HOLD_MS)
    holdRef.current = { timer, startX, startY, pointerId }
    setHoldingId(id)
  }

  function onPointerMove(event) {
    const hold = holdRef.current
    if (!hold || event.pointerId !== hold.pointerId) return
    const dx = event.clientX - hold.startX
    const dy = event.clientY - hold.startY
    if (dx * dx + dy * dy > MOVE_PX * MOVE_PX) clearHold()
  }

  function onPointerLeave(event) {
    const hold = holdRef.current
    if (!hold || event.pointerId !== hold.pointerId) return
    clearHold()
  }

  function onPointerEnd(event) {
    const hold = holdRef.current
    if (hold && event.pointerId === hold.pointerId) clearHold()
    if (!suppressClickRef.current) return
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
  }

  function onChipClick(id) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    selectDay(id)
  }

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const fade = fadeRef.current
    if (!scroller) return

    function syncFades() {
      syncEdgeFades(scroller, fade)
    }

    function align(behavior) {
      alignScroller(
        scroller,
        scroller.querySelector(`[data-day="${focusId}"]`),
        behavior,
      )
      syncFades()
    }

    align(readyRef.current ? scrollBehavior() : 'auto')
    readyRef.current = true

    scroller.addEventListener('scroll', syncFades, { passive: true })
    let width = scroller.clientWidth
    const observer = new ResizeObserver(() => {
      const nextWidth = scroller.clientWidth
      if (nextWidth === width) return
      width = nextWidth
      align('auto')
    })
    observer.observe(scroller)
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', syncFades)
    }
  }, [focusId])

  return (
    <nav className="day-trail" aria-label="Days">
      <button
        type="button"
        className="day-trail-home"
        aria-current={isHome ? 'page' : undefined}
        aria-label="Home"
        onClick={selectHome}
      >
        <HomeIcon />
      </button>
      <div className="day-trail-fade" ref={fadeRef}>
        <div className="day-trail-scroller" ref={scrollerRef}>
          <ol className="day-trail-track">
            {days.map((day) => {
              const unlocked = isUnlocked(day.id)
              const current = !isHome && selected === day.id

              return (
                <li key={day.id}>
                  <button
                    type="button"
                    data-day={day.id}
                    className={chipClassName(!unlocked, holdingId === day.id)}
                    aria-current={current ? 'page' : undefined}
                    aria-label={
                      unlocked
                        ? `${day.label}, opened`
                        : `${day.label}, locked`
                    }
                    disabled={!canAttempt(day.id)}
                    onClick={() => onChipClick(day.id)}
                    onContextMenu={(event) => {
                      if (canRelock(day.id)) event.preventDefault()
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerEnd}
                    onPointerCancel={onPointerEnd}
                    onPointerLeave={onPointerLeave}
                    onFocus={(event) =>
                      alignScroller(scrollerRef.current, event.currentTarget)
                    }
                  >
                    <span className="day-trail-month">{day.chipMonth}</span>
                    <span className="day-trail-date">{day.chipDate}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
      {tip ? (
        <div
          ref={tipRef}
          className="day-reset-tip"
          role="tooltip"
          style={{ left: tip.left, top: tip.top }}
        >
          <button
            type="button"
            onClick={() => {
              const id = tip.id
              setTip(null)
              relock(id)
            }}
          >
            Reset day
          </button>
        </div>
      ) : null}
    </nav>
  )
}
