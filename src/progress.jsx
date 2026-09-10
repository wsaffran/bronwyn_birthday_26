import { createContext, useContext, useMemo, useState } from 'react'
import { days, getDay } from './days'

const COOKIE_NAME = 'bronwyn-days-unlocked'
const LEGACY_MUSIC_KEY = 'gift-unlocked-music'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 400
const HOME = 'home'

const ProgressContext = createContext(null)

function readCookie(name) {
  const prefix = `${name}=`
  const row = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  return row ? decodeURIComponent(row.slice(prefix.length)) : ''
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${MAX_AGE_SECONDS}; path=/; SameSite=Lax`
}

function parseUnlocked(raw) {
  return raw
    .split(',')
    .map((value) => Number(value))
    .filter((id) => days.some((day) => day.id === id))
}

function uniqueSorted(ids) {
  return [...new Set(ids)].sort((a, b) => a - b)
}

function readUnlockedDays() {
  const fromCookie = parseUnlocked(readCookie(COOKIE_NAME))
  const migrated =
    localStorage.getItem(LEGACY_MUSIC_KEY) === 'true' ? [1] : []
  return uniqueSorted([...fromCookie, ...migrated])
}

function persistUnlockedDays(ids) {
  writeCookie(COOKIE_NAME, uniqueSorted(ids).join(','))
}

function canAttemptDay(unlocked, id) {
  return id === 1 || unlocked.includes(id - 1)
}

export function ProgressProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    const ids = readUnlockedDays()
    if (ids.length) persistUnlockedDays(ids)
    return ids
  })
  const [selected, setSelected] = useState(HOME)

  const value = useMemo(() => {
    const highest = unlocked.at(-1) ?? 0
    const nextDay = days.find((day) => day.id === highest + 1) ?? null
    const selectedDay = selected === HOME ? null : (getDay(selected) ?? null)

    return {
      nextDay,
      selected,
      selectedDay,
      isHome: selected === HOME,
      hasUnlocked: unlocked.length > 0,
      allUnlocked: unlocked.length === days.length,
      isUnlocked(id) {
        return unlocked.includes(id)
      },
      canAttempt(id) {
        return canAttemptDay(unlocked, id)
      },
      selectHome() {
        setSelected(HOME)
      },
      selectDay(id) {
        if (!canAttemptDay(unlocked, id)) return
        setSelected(id)
      },
      unlock(id) {
        setUnlocked((current) => {
          if (current.includes(id)) return current
          const next = uniqueSorted([...current, id])
          persistUnlockedDays(next)
          return next
        })
        setSelected(id)
      },
    }
  }, [selected, unlocked])

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider')
  }
  return context
}
