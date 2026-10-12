import { useEffect, useId, useState } from 'react'

const GROUPS = [
  {
    id: 'move',
    title: 'Move',
    options: [
      { key: 'joystick', label: 'Joystick' },
      { key: 'touchMove', label: 'Touch to walk' },
    ],
  },
  {
    id: 'open',
    title: 'Open a photo',
    options: [
      { key: 'openBubble', label: 'Bubble above you' },
      { key: 'openButton', label: 'Button' },
      { key: 'clickPins', label: 'Tap pins' },
    ],
  },
  {
    id: 'screen',
    title: 'On screen',
    options: [
      { key: 'zoomButtons', label: 'Zoom buttons' },
      { key: 'homeButton', label: 'Home button' },
    ],
  },
]

function GearIcon() {
  return (
    <svg className="map-settings-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.49.49 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z"
      />
    </svg>
  )
}

export default function MapSettings({ settings, onChange }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return undefined
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className="map-settings">
      {open ? (
        <button
          type="button"
          className="map-settings-backdrop"
          aria-label="Close settings"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <button
        type="button"
        className="map-settings-gear"
        aria-label="Map settings"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <GearIcon />
      </button>
      {open ? (
        <div
          id={panelId}
          className="map-settings-panel"
          role="dialog"
          aria-label="Map settings"
        >
          {GROUPS.map((group) => (
            <section key={group.id} className="map-settings-group">
              <h2>{group.title}</h2>
              {group.options.map((option) => (
                <label key={option.key} className="map-settings-row">
                  <span>{option.label}</span>
                  <span className="map-settings-switch">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={settings[option.key]}
                      onChange={(event) => onChange(option.key, event.target.checked)}
                    />
                  </span>
                </label>
              ))}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  )
}
