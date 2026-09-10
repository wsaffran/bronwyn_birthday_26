import { useEffect, useState } from 'react'
import { getTimeUntilBirthday } from '../constants'

function pad(value) {
  return String(value).padStart(2, '0')
}

export default function CountdownBanner() {
  const [remaining, setRemaining] = useState(() => getTimeUntilBirthday())

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(getTimeUntilBirthday())
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  const { days, hours, minutes, seconds, reached } = remaining
  const label = reached
    ? "It's Bronwyn's birthday"
    : `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds until Bronwyn's birthday`

  return (
    <div className="countdown-banner" role="timer" aria-label={label}>
      {reached ? (
        <p className="countdown-clock countdown-clock-done">HAPPY BIRTHDAY</p>
      ) : (
        <>
          <p className="countdown-clock" aria-hidden="true">
            <span className="countdown-digits">{pad(days)}</span>
            <span className="countdown-sep">:</span>
            <span className="countdown-digits">{pad(hours)}</span>
            <span className="countdown-sep">:</span>
            <span className="countdown-digits">{pad(minutes)}</span>
            <span className="countdown-sep">:</span>
            <span className="countdown-digits">{pad(seconds)}</span>
          </p>
          <p className="countdown-caption">Bronwyn's birthday countdown</p>
        </>
      )}
    </div>
  )
}
