import { useLayoutEffect } from 'react'
import { useProgress } from '../progress'
import DayTrail from './DayTrail'

export default function Layout({ children }) {
  const { selected } = useProgress()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    document.querySelector('.page')?.scrollTo(0, 0)
  }, [selected])

  return (
    <div className="site-shell">
      {children}
      <DayTrail />
    </div>
  )
}
