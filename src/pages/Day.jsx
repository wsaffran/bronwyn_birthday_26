import { useState } from 'react'
import MazeGame from '../maze/MazeGame'
import CityMapGame from '../citymap/CityMapGame'
import CatCollage from '../components/CatCollage'
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

function PlaceholderGift({ day }) {
  return (
    <p className="lede">
      This is {day.label} for now.
    </p>
  )
}

function GiftBody({ day }) {
  if (day.kind === 'music') return <MusicGift day={day} />
  if (day.kind === 'maze') return <MazeGame />
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
    if (password.trim() === day.password) {
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

  if (unlocked) {
    if (day.kind === 'maze') {
      return (
        <main className="page page-maze">
          <h1 className="visually-hidden">{day.title}</h1>
          <MazeGame />
        </main>
      )
    }

    if (day.kind === 'citymap') {
      return (
        <main className="page page-citymap">
          <h1 className="visually-hidden">{day.title}</h1>
          <CityMapGame />
        </main>
      )
    }

  const collage = day.slug === 'oct-14'

  function frame(body) {
    if (!collage) return <main className="page">{body}</main>
    return (
      <main className="page page-oct14">
        <CatCollage />
        <div className="oct14-panel">{body}</div>
      </main>
    )
  }

  if (unlocked) {
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
