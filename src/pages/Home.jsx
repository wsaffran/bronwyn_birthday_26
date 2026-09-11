import { HAPPY_BIRTHDAY } from '../constants'
import { days } from '../days'
import { useProgress } from '../progress'

const letteringSrc = `${import.meta.env.BASE_URL}chiaki-lettering-white.png`
const floralSrc = `${import.meta.env.BASE_URL}floral-linework-white.png`

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
  const { allUnlocked, nextDay, canAttempt, selectDay } = useProgress()
  const nextIsOpen = Boolean(nextDay) && canAttempt(nextDay.id)
  const copy = nextIsOpen
    ? `Continue with ${nextDay.label}`
    : nextDay
      ? `Come back on ${nextDay.label}!`
      : 'Hi, you have unlocked every day. I hope you had fun!'

  return (
    <>
      <div
        className="home-floral"
        style={{ '--floral-src': `url("${floralSrc}")` }}
        aria-hidden="true"
      />
      <main className="page page-home">
        <HomeHeading />
        {nextIsOpen ? (
          <button type="button" onClick={() => selectDay(nextDay.id)}>
            {copy}
          </button>
        ) : (
          <p className="lede">{copy}</p>
        )}
        {allUnlocked ? (
          <ul className="revisit-list">
            {days.map((day) => (
              <li key={day.id}>
                <button type="button" onClick={() => selectDay(day.id)}>
                  <span>{day.label}</span>
                  <span className="revisit-title">{day.title}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </>
  )
}
