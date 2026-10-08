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
        Hi pookie, I'm glad you made it here! I hope you are having THE BEST time in Japan.
        I'm excited to show you what I've been up to. 
      </p>
      <p>
        Before you left, I gave you 6 dated envelopes, one for each day you're in
        Japan. You'll also find the corresponding day at the bottom of your screen. 
        For each one, open that envelope and enter the answer to the riddle. 
        Don't worry, if you get it wrong, I'll give you a hint or two.
      </p>
      <p>I will see you here soon :)</p>
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
