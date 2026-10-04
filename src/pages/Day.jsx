import { useState } from 'react'
import MuseumHall from '../components/MuseumHall'
import NYCMap from '../components/NYCMap'
import CatCollage from '../components/CatCollage'
import IpodClassic from '../components/IpodClassic'
import MemoryGame from '../components/MemoryGame'
import { useProgress } from '../progress'

function MusicGift({ day }) {
  return (
    <>
      <p className="lede">
        Press play to listen to the playlist.
      </p>
      <div className="embed-frame">
        <iframe
          title="Birthday playlist on Spotify"
          src={day.embedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <a href={day.playlistUrl} target="_blank" rel="noreferrer">
        Open in Spotify
      </a>
    </>
  )
}

function normalizePassword(value) {
  return value.toLowerCase().replace(/\s+/g, '')
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
  const { selectedDay: day, isUnlocked, isDateOpen, canAttempt, unlock, selectHome } =
    useProgress()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!day) return null

  const unlocked = isUnlocked(day.id)
  function handleSubmit(event) {
    event.preventDefault()
    if (normalizePassword(password) === normalizePassword(day.password)) {
      unlock(day.id)
      setError('')
      return
    }
    setError('Try the clue again.')
  }

  if (!canAttempt(day.id)) {
    if (!isDateOpen(day.id)) {
      return (
        <main className="page">
          <h1>Not yet</h1>
          <p className="lede">This gift opens on {day.label}.</p>
          <button type="button" onClick={selectHome}>
            Home
          </button>
        </main>
      )
    }

    return (
      <main className="page">
        <h1>Nice try!</h1>
        <p className="lede">
          I'm sorry Bronwyn, but you are not allowed to open this gift yet.
        </p>
        <button type="button" onClick={selectHome}>
          Home
        </button>
      </main>
    )
  }

  const collage = day.slug === 'oct-14' && !unlocked
  const mapPage = day.kind === 'map' && unlocked
  const museumPage = day.kind === 'museum' && unlocked
  const ipodPage = day.kind === 'ipod' && unlocked
  const memoryPage = day.kind === 'memory' && unlocked

  function frame(body) {
    if (mapPage) return <main className="page page-oct13">{body}</main>
    if (museumPage) return <main className="page page-museum">{body}</main>
    if (ipodPage) return <main className="page page-ipod">{body}</main>
    if (memoryPage) return <main className="page page-memory">{body}</main>
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
      day.kind === 'memory'
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

  return frame(
    <>
      <h1>Unlock {day.label}</h1>
      <p className="lede">
        Enter the password from your clue to unlock.
      </p>
      <form className="lock-form" onSubmit={handleSubmit}>
        <label htmlFor={`${day.slug}-password`}>Password</label>
        <input
          id={`${day.slug}-password`}
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (error) setError('')
          }}
        />
        {error ? <p>{error}</p> : null}
        <button type="submit">Enter</button>
      </form>
      <button type="button" onClick={selectHome}>
        Home
      </button>
    </>,
  )
}
