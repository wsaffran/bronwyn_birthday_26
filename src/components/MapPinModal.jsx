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
        aria-labelledby="map-pin-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="map-pin-title">{pin.title}</h2>
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
