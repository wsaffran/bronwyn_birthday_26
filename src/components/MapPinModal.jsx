import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3.2 9.1h3.1L11 5v14l-4.7-4.1H3.2z" />
      <path
        className="map-modal-audio-waves"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M14.4 8.6a4.7 4.7 0 0 1 0 6.8M17 6.2a8.1 8.1 0 0 1 0 11.6"
      />
    </svg>
  )
}

export default function MapPinModal({ pin, onClose }) {
  const closeRef = useRef(null)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const hasAudioControl = pin.audio != null
  const audioSrc = pin.audio ? `${import.meta.env.BASE_URL}${pin.audio}` : ''

  useEffect(() => {
    const previous = document.activeElement
    closeRef.current?.focus()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      audioRef.current?.pause()
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onClose, pin.id])

  function toggleAudio() {
    const audio = audioRef.current
    if (!audio || !audioSrc) return
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false))
      return
    }
    audio.pause()
  }

  return createPortal(
    <div className="map-modal-backdrop" onClick={onClose}>
      <div
        className={hasAudioControl ? 'map-modal map-modal-with-audio' : 'map-modal'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={pin.title ? 'map-pin-title' : undefined}
        aria-label={pin.title ? undefined : 'Photo'}
        onClick={(event) => event.stopPropagation()}
      >
        {hasAudioControl ? (
          <button
            type="button"
            className={playing ? 'map-modal-audio is-playing' : 'map-modal-audio'}
            aria-label={playing ? 'Pause recording' : 'Play recording'}
            aria-pressed={playing}
            onClick={toggleAudio}
          >
            <SpeakerIcon />
          </button>
        ) : null}
        {hasAudioControl ? (
          <audio
            ref={audioRef}
            src={audioSrc || undefined}
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        ) : null}
        {pin.title || pin.subtitle ? (
          <div className="map-modal-heading">
            {pin.title ? <h2 id="map-pin-title">{pin.title}</h2> : null}
            {pin.subtitle ? <p className="map-modal-subtitle">{pin.subtitle}</p> : null}
          </div>
        ) : null}
        {pin.photo ? (
          <div className="map-modal-photo-frame">
            <img
              className="map-modal-photo"
              src={`${import.meta.env.BASE_URL}${pin.photo}`}
              alt=""
            />
          </div>
        ) : null}
        {pin.body ? <p>{pin.body}</p> : null}
        <button ref={closeRef} type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  )
}
