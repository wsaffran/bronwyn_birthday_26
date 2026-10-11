import { useState } from 'react'
import FloralBackdrop from '../components/FloralBackdrop'
import MuseumHall from '../components/MuseumHall'
import NYCMap from '../components/NYCMap'
import CatCollage from '../components/CatCollage'
import IpodClassic from '../components/IpodClassic'
import MemoryGame from '../components/MemoryGame'
import { useProgress } from '../progress'

function MusicGift({ day }) {
  return (
    <>
      <div className="embed-frame">
        <iframe
          data-testid="embed-iframe"
          title="Birthday playlist on Spotify"
          src={day.embedUrl}
          width="100%"
          height="152"
          style={{ borderRadius: 12 }}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <ol className="playlist-key">
        {(day.songKey ?? []).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </>
  )
}

function normalizePassword(value) {
  return value.toLowerCase().replace(/\s+/g, '')
}

function passwordMatches(input, day) {
  const normalized = normalizePassword(input)
  const accepted = [day.password, ...(day.passwordAliases ?? [])]
  return accepted.some((password) => normalizePassword(password) === normalized)
}

function weakPasswordHint(input, day) {
  const guess = normalizePassword(input)
  if (!guess) return ''
  const matched = (day.weakPasswords ?? []).some((password) => normalizePassword(password) === guess)
  if (!matched) return ''
  const hints = day.weakPasswordHints ?? {}
  const hintKey = Object.keys(hints).find((key) => normalizePassword(key) === guess)
  return hintKey ? hints[hintKey] : ''
}

function PlaceholderGift({ day }) {
  return (
    <p className="lede">
      This is {day.label} for now.
    </p>
  )
}

function GiftBody({ day }) {
  if (day.kind === 'music') return <MusicGift day={day} />
  if (day.kind === 'map') return <NYCMap />
  if (day.kind === 'museum') return <MuseumHall />
  if (day.kind === 'ipod') return <IpodClassic />
  if (day.kind === 'memory') return <MemoryGame />
  return <PlaceholderGift day={day} />
}

export default function Day() {
  const { selectedDay: day, isUnlocked, isDateOpen, canAttempt, unlock } = useProgress()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [misses, setMisses] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [revealedHints, setRevealedHints] = useState(() => new Set())
  const unlocked = Boolean(day && isUnlocked(day.id))

  function closePass() {
    setShowPass(false)
    setAnswerRevealed(false)
  }

  function revealHint(index) {
    setRevealedHints((current) => {
      if (current.has(index)) return current
      const next = new Set(current)
      next.add(index)
      return next
    })
  }

  if (!day) return null

  const hints = day.hints ?? []
  const hintsEarned = Math.min(hints.length, Math.floor(misses / 3))
  function handleSubmit(event) {
    event.preventDefault()
    if (passwordMatches(password, day)) {
      unlock(day.id)
      setError('')
      return
    }
    const nextMisses = misses + 1
    setMisses(nextMisses)
    if (nextMisses >= 10) setShowPass(true)
    setError(weakPasswordHint(password, day) || 'Sorry pookie, please try again')
  }

  if (!canAttempt(day.id)) {
    if (!isDateOpen(day.id)) {
      return (
        <main className="page">
          <h1>Not yet</h1>
          <p className="lede">This gift opens on {day.label}.</p>
        </main>
      )
    }

    return (
      <main className="page">
        <h1>Nice try!</h1>
        <p className="lede">
          I'm sorry Bronwyn, but you are not allowed to open this gift yet.
        </p>
      </main>
    )
  }

  const collage = day.kind === 'memory' && !unlocked
  const musicPage = day.kind === 'music' && unlocked
  const mapPage = day.kind === 'map' && unlocked
  const museumPage = day.kind === 'museum' && unlocked
  const ipodPage = day.kind === 'ipod' && unlocked
  const memoryPage = day.kind === 'memory' && unlocked

  function frame(body) {
    if (mapPage) return <main className="page page-oct13">{body}</main>
    if (museumPage) return <main className="page page-museum">{body}</main>
    if (ipodPage) return <main className="page page-ipod">{body}</main>
    if (memoryPage) return <main className="page page-memory">{body}</main>
    if (musicPage) return <main className="page page-music">{body}</main>
    if (!collage) return <main className="page">{body}</main>
    return (
      <main className="page page-oct14">
        <CatCollage />
        <div className="oct14-panel">{body}</div>
      </main>
    )
  }

  if (unlocked) {
    if (
      day.kind === 'map' ||
      day.kind === 'museum' ||
      day.kind === 'ipod' ||
      day.kind === 'memory' ||
      day.kind === 'music'
    ) {
      return frame(<GiftBody day={day} />)
    }
    return frame(
      <>
        <h1>{day.title}</h1>
        <GiftBody day={day} />
      </>,
    )
  }

  return (
    <>
      <FloralBackdrop />
      {frame(
    <div className={showPass ? 'lock-screen lock-screen-revealed' : 'lock-screen'}>
      <div className="lock-screen-main">
        <h1 className="lock-title-ja">{day.labelJa}</h1>
        <form
          className="lock-form"
          autoComplete="off"
          data-1p-ignore=""
          data-lpignore="true"
          data-protonpass-ignore=""
          data-bwignore=""
          onSubmit={handleSubmit}
        >
          <input
            id={`${day.slug}-unlock`}
            aria-label="Password"
            placeholder="Answer"
            name="unlock"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            data-1p-ignore=""
            data-lpignore="true"
            data-protonpass-ignore=""
            data-bwignore=""
            data-form-type="other"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError('')
            }}
          />
          <p className="lock-feedback">{error}</p>
          <button type="submit">Enter</button>
        </form>
      </div>
      <div className="lock-hints">
        {hints.slice(0, hintsEarned).map((hint, index) =>
          revealedHints.has(index) ? (
            <p className="lede" key={index}>
              {hint}
            </p>
          ) : (
            <button type="button" className="lock-hint-reveal" key={index} onClick={() => revealHint(index)}>
              Hint {index + 1}
            </button>
          ),
        )}
      </div>
      {showPass ? (
        <div className="lock-pass-backdrop" onClick={closePass}>
          <div
            className="lock-pass"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lock-pass-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="lock-pass-close"
              aria-label="Close"
              onClick={closePass}
            >
              ×
            </button>
            <img className="lock-pass-face" src="/lock-smile.png" alt="" />
            <div className="lock-pass-copy">
              <p id="lock-pass-title">
                Don't worry babe...
                <br />
                this one is ON ME!
              </p>
              {answerRevealed ? (
                <p className="lock-pass-password">{day.password}</p>
              ) : (
                <button type="button" className="lock-pass-reveal" onClick={() => setAnswerRevealed(true)}>
                  Reveal answer
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>,
      )}
    </>
  )
}
