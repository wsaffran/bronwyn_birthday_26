import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cardBack, photos } from '../memoryCards'

const MISS_MS = 750
const RESULT_MS = 3400
const COLUMNS = 4
const ROWS = 6
const PAIR_COUNT = (COLUMNS * ROWS) / 2
const BEST_COOKIE = 'bronwyn-memory-best'
const LEGACY_BEST_KEY = 'memory-best-moves'
const BEST_MAX_AGE = 60 * 60 * 24 * 400

function readCookie(name) {
  const prefix = `${name}=`
  const row = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  return row ? decodeURIComponent(row.slice(prefix.length)) : ''
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${BEST_MAX_AGE}; path=/; SameSite=Lax`
}

function parseBest(raw) {
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : null
}

function readBest() {
  const saved = parseBest(readCookie(BEST_COOKIE))
  if (saved != null) return saved
  try {
    const legacy = parseBest(localStorage.getItem(LEGACY_BEST_KEY))
    if (legacy != null) writeCookie(BEST_COOKIE, String(legacy))
    return legacy
  } catch {
    return null
  }
}

function writeBest(value) {
  writeCookie(BEST_COOKIE, String(value))
}

function winMessage(moves) {
  if (moves <= 12) return 'HOLY HOW DID YOU DO THAT!'
  if (moves <= 19) return 'I always knew you were wicked smart'
  if (moves <= 26) return 'I knew you knew Hoji well'
  if (moves <= 50) return 'I bet you can beat that!'
  return 'You need to try that again, EXPEDITIOUSLY'
}

function cardSrc(path) {
  if (!path) return null
  if (/^(?:[a-z]+:|\/\/)/i.test(path)) return path
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base}${String(path).replace(/^\//, '')}`
}

function shuffle(items) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

function dealCards() {
  const chosen = shuffle(photos).slice(0, PAIR_COUNT)
  const deck = chosen.flatMap((photo) =>
    [0, 1].map((copy) => ({
      key: `${photo.id}-${copy}`,
      pairId: photo.id,
      image: cardSrc(photo.image),
    })),
  )
  return shuffle(deck)
}

export default function MemoryGame() {
  const [cards, setCards] = useState(dealCards)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(() => new Set())
  const [locked, setLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const [best, setBest] = useState(readBest)
  const [resultOpen, setResultOpen] = useState(false)
  const [resultMoves, setResultMoves] = useState(0)
  const [resultKey, setResultKey] = useState(0)
  const [simScore, setSimScore] = useState('12')
  const hideTimer = useRef(0)
  const resultTimer = useRef(0)
  const movesRef = useRef(0)
  const flippedRef = useRef([])
  const matchedRef = useRef(new Set())
  const lockedRef = useRef(false)
  const backSrc = cardSrc(cardBack)
  const won = matched.size === cards.length
  const rows = Math.ceil(cards.length / COLUMNS)

  useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current)
      window.clearTimeout(resultTimer.current)
    },
    [],
  )

  function playAgain() {
    window.clearTimeout(hideTimer.current)
    flippedRef.current = []
    matchedRef.current = new Set()
    lockedRef.current = false
    setCards(dealCards())
    setFlipped([])
    setMatched(new Set())
    setLocked(false)
    movesRef.current = 0
    setMoves(0)
    window.clearTimeout(resultTimer.current)
    setResultOpen(false)
  }

  function openResult(score) {
    setResultMoves(score)
    setResultKey((key) => key + 1)
    setResultOpen(true)
    window.clearTimeout(resultTimer.current)
    resultTimer.current = window.setTimeout(() => {
      setResultOpen(false)
    }, RESULT_MS)
  }

  function simulateWin(event) {
    event.preventDefault()
    const score = Number(simScore)
    if (!Number.isInteger(score) || score < 1) return
    openResult(score)
  }

  function reveal(key) {
    if (lockedRef.current || matchedRef.current.has(key)) return
    const open = flippedRef.current
    if (open.includes(key) || open.length >= 2) return

    const nextOpen = [...open, key]
    flippedRef.current = nextOpen
    setFlipped(nextOpen)
    if (nextOpen.length < 2) return

    const nextMoves = movesRef.current + 1
    movesRef.current = nextMoves
    setMoves(nextMoves)

    const [firstKey, secondKey] = nextOpen
    const first = cards.find((card) => card.key === firstKey)
    const second = cards.find((card) => card.key === secondKey)
    if (first?.pairId && first.pairId === second?.pairId) {
      const nextMatched = new Set(matchedRef.current)
      nextMatched.add(firstKey)
      nextMatched.add(secondKey)
      matchedRef.current = nextMatched
      flippedRef.current = []
      setMatched(nextMatched)
      setFlipped([])
      if (nextMatched.size === cards.length) {
        openResult(nextMoves)
        setBest((current) => {
          if (current != null && current <= nextMoves) return current
          writeBest(nextMoves)
          return nextMoves
        })
      }
      return
    }

    lockedRef.current = true
    setLocked(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => {
      flippedRef.current = []
      lockedRef.current = false
      setFlipped([])
      setLocked(false)
    }, MISS_MS)
  }

  return (
    <div className="memory-game">
      <div className="memory-board-slot">
        <div className="memory-stack" style={{ '--memory-rows': rows }}>
          <div className="memory-status">
            <p className="memory-best" aria-live="polite">
              Best score: {best ?? '—'}
            </p>
            <p className="memory-moves" aria-live="polite">
              {moves} {moves === 1 ? 'move' : 'moves'}
            </p>
          </div>
          <div className="memory-board" role="group" aria-label="Memory cards">
          {cards.map((card) => {
            const isMatched = matched.has(card.key)
            const isUp = isMatched || flipped.includes(card.key)
            const label = isMatched ? 'Matched card' : isUp ? 'Revealed card' : 'Hidden card'
            return (
              <button
                key={card.key}
                type="button"
                className={isUp ? 'memory-card is-up' : 'memory-card'}
                aria-label={label}
                aria-pressed={isUp}
                disabled={isMatched || locked}
                onClick={() => reveal(card.key)}
              >
                <span className="memory-card-inner">
                  <span className="memory-card-face memory-card-back">
                    {backSrc ? <img src={backSrc} alt="" /> : null}
                  </span>
                  <span className="memory-card-face memory-card-front">
                    {card.image ? <img src={card.image} alt="" /> : null}
                  </span>
                </span>
              </button>
            )
          })}
          </div>
        </div>
      </div>
      <div className="memory-again-slot">
        {won ? (
          <button type="button" className="memory-again" onClick={playAgain}>
            Play again
          </button>
        ) : null}
      </div>
      <form className="memory-sim" onSubmit={simulateWin}>
        <label htmlFor="memory-sim-score">Score</label>
        <input
          id="memory-sim-score"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={simScore}
          onChange={(event) => setSimScore(event.target.value)}
        />
        <button type="submit">Simulate win</button>
      </form>
      {resultOpen
        ? createPortal(
            <div key={resultKey} className="memory-win" role="status">
              <p className="memory-win-score">
                {resultMoves} {resultMoves === 1 ? 'move' : 'moves'}
              </p>
              <p className="memory-win-message">{winMessage(resultMoves)}</p>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
