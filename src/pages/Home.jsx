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
    </div>
  )
}

function HomeLetter() {
  return (
    <div className="home-letter">
      <h1 className="visually-hidden">A letter for Bronwyn</h1>
      <p>
        Hi pookie. You made it to Japan and your birthday week! Even though we are halfway
        around the world, I'm gonna be keeping you company through one of the
        ways I know best. Visit me here whenever you like, I'll have something
        new every day.
      </p>
      <p>
        Before you left, I gave you 7 envelopes, one for each day you're in
        Japan. On each day, open the envelope for that day. Somewhere inside
        will be a clue that will help you unlock that page.
      </p>
      <p>See you soon and have the best day in Japan!</p>
    </div>
  )
}

export default function Home() {
  const { nextDay } = useProgress()

  return (
    <>
      <div
        className="home-floral"
        style={{ '--floral-src': `url("${floralSrc}")` }}
        aria-hidden="true"
      />
      <main className="page page-home">
        <HomeHeading />
        <div className="home-body">
          <HomeLetter />
          {nextDay ? null : (
            <p className="lede">Hi, you have unlocked every day. I hope you had fun!</p>
          )}
        </div>
      </main>
    </>
  )
}
