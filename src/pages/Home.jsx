import { days } from '../days'
import { useProgress } from '../progress'

export default function Home() {
  const { allUnlocked, hasUnlocked, isUnlocked, nextDay, selectDay } =
    useProgress()

  if (!hasUnlocked) {
    return (
      <main className="page">
        <h1>Happy Birthday, Bronwyn</h1>
        <p className="lede">
          A new gift unlocks each day. Start with day one when you have your
          clue.
        </p>
        <button type="button" onClick={() => selectDay(1)}>
          Start with day 1
        </button>
      </main>
    )
  }

  if (allUnlocked || !nextDay) {
    return (
      <main className="page">
        <h1>Happy Birthday, Bronwyn</h1>
        <p className="lede">Every gift is open. Pick a day to revisit.</p>
        <ul className="revisit-list">
          {days
            .filter((day) => isUnlocked(day.id))
            .map((day) => (
              <li key={day.id}>
                <button type="button" onClick={() => selectDay(day.id)}>
                  <span>{day.label}</span>
                  <span className="revisit-title">{day.title}</span>
                </button>
              </li>
            ))}
        </ul>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Happy Birthday, Bronwyn</h1>
      <p className="lede">
        Come back with today&apos;s clue when you are ready.
      </p>
      <button type="button" onClick={() => selectDay(nextDay.id)}>
        Continue with {nextDay.label}
      </button>
    </main>
  )
}
