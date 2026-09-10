import { useLayoutEffect } from 'react'
import { getTabTitle } from '../constants'
import { useProgress } from '../progress'
import CountdownBanner from './CountdownBanner'
import DayTrail from './DayTrail'

export default function Layout({ children }) {
  const { selected } = useProgress()
  const tabTitle = getTabTitle()

  useLayoutEffect(() => {
    document.title = tabTitle
  }, [tabTitle])

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    document.querySelector('.page')?.scrollTo(0, 0)
  }, [selected])

  return (
    <div className="site-shell">
      <title>{tabTitle}</title>
      <CountdownBanner />
      {children}
      <DayTrail />
    </div>
  )
}
