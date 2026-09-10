import { HAPPY_BIRTHDAY } from '../constants'
import { days } from '../days'
import { useProgress } from '../progress'

const letteringSrc = `${import.meta.env.BASE_URL}chiaki-lettering-white.png`

function HomeHeading() {
  return (
    <div className="home-hero">
      <div
        className="home-lettering"
        style={{ '--lettering-src': `url("${letteringSrc}")` }}
        aria-hidden="true"
      />
      <h1>{HAPPY_BIRTHDAY}</h1>
    </div>
  )
}

export default function Home() {
  const { allUnlocked, hasUnlocked, isUnlocked, nextDay, selectDay } =
    useProgress()
  const showRevisit = allUnlocked || !nextDay
  const lede = !hasUnlocked
    ? 'A new gift unlocks each day. Start with day one when you have your clue.'
    : showRevisit
      ? 'Every gift is open. Pick a day to revisit.'
      : "Come back after you open today's envelope."

  return (
    <main className="page page-home">
      <HomeHeading />
      <p className="lede">{lede}</p>
      {showRevisit ? (
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
      ) : (
        <button type="button" onClick={() => selectDay(nextDay.id)}>
          {hasUnlocked ? `Continue with ${nextDay.label}` : 'Start with day 1'}
        </button>
      )}
    </main>
  )
}
