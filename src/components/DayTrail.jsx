import { useLayoutEffect, useRef } from 'react'
import { days } from '../days'
import { useProgress } from '../progress'

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

export default function DayTrail() {
  const {
    selected,
    isHome,
    isUnlocked,
    canAttempt,
    selectDay,
    selectHome,
  } = useProgress()
  const scrollerRef = useRef(null)
  const fadeRef = useRef(null)
  const readyRef = useRef(false)
  const focusId = isHome ? days[0].id : selected

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
                    className={unlocked ? undefined : 'is-locked'}
                    aria-current={current ? 'page' : undefined}
                    aria-label={
                      unlocked
                        ? `${day.label}, opened`
                        : `${day.label}, locked`
                    }
                    disabled={!canAttempt(day.id)}
                    onClick={() => selectDay(day.id)}
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
    </nav>
  )
}
