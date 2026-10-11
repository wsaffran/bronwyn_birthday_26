import { useEffect, useRef } from 'react'

export default function MapPinModal({ pin, onClose }) {
  const closeRef = useRef(null)

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
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onClose, pin.id])

  return (
    <div className="map-modal-backdrop" onClick={onClose}>
      <div
        className="map-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={pin.title ? 'map-pin-title' : undefined}
        aria-label={pin.title ? undefined : 'Photo'}
        onClick={(event) => event.stopPropagation()}
      >
        {pin.title || pin.subtitle ? (
          <div className="map-modal-heading">
            {pin.title ? <h2 id="map-pin-title">{pin.title}</h2> : null}
            {pin.subtitle ? <p className="map-modal-subtitle">{pin.subtitle}</p> : null}
          </div>
        ) : null}
        {pin.photo ? (
          <img
            className="map-modal-photo"
            src={`${import.meta.env.BASE_URL}${pin.photo}`}
            alt=""
          />
        ) : null}
        {pin.body ? <p>{pin.body}</p> : null}
        <button ref={closeRef} type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
