import { useLayoutEffect } from 'react'
import { HAPPY_BIRTHDAY } from '../constants'
import { useProgress } from '../progress'
import DayTrail from './DayTrail'

const TAB_TITLE = `${HAPPY_BIRTHDAY}!`

export default function Layout({ children }) {
  const { selected } = useProgress()

  useLayoutEffect(() => {
    document.title = TAB_TITLE
  }, [])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    document.querySelector('.page')?.scrollTo(0, 0)
  }, [selected])

  return (
    <div className="site-shell">
      <title>{TAB_TITLE}</title>
      {children}
      <DayTrail />
    </div>
  )
}
