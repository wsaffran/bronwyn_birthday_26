import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { days, getDay, isOpenOn } from './days'

const COOKIE_NAME = 'bronwyn-days-unlocked'
const LEGACY_MUSIC_KEY = 'gift-unlocked-music'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 400
const HOME = 'home'
const DAY_PARAM = 'day'
const UNLOCK_PARAM = 'unlock'
const UNLOCK_OFF = new Set(['0', 'false', 'off'])

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

function skipDateLocksFromSearch(search = window.location.search) {
  const params = new URLSearchParams(search)
  if (!params.has(UNLOCK_PARAM)) return false
  const raw = params.get(UNLOCK_PARAM)
  if (raw === '' || raw == null) return true
  return !UNLOCK_OFF.has(raw.toLowerCase())
}

function isSequenceReady(unlocked, id) {
  return id === 1 || unlocked.includes(id - 1)
}

function isDateOpenFor(day, now, skipDateLocks) {
  return Boolean(day) && (skipDateLocks || isOpenOn(day, now))
}

function canAttemptDay(unlocked, id, now, skipDateLocks) {
  const day = getDay(id)
  if (!day) return false
  if (unlocked.includes(id)) return true
  return isSequenceReady(unlocked, id) && isDateOpenFor(day, now, skipDateLocks)
}

function parseDayParam(raw) {
  if (raw == null || raw === '') return HOME
  const id = Number(raw)
  return Number.isInteger(id) && getDay(id) ? id : HOME
}

function readSelectedFromUrl() {
  return parseDayParam(new URLSearchParams(window.location.search).get(DAY_PARAM))
}

function syncUrl(selected) {
  const url = new URL(window.location.href)
  if (selected === HOME) url.searchParams.delete(DAY_PARAM)
  else url.searchParams.set(DAY_PARAM, String(selected))

  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) window.history.replaceState(null, '', next)
}

function msUntilNextMidnight(now) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(1, next.getTime() - now.getTime())
}

export function ProgressProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    const ids = readUnlockedDays()
    if (ids.length) persistUnlockedDays(ids)
    return ids
  })
  const [selected, setSelected] = useState(readSelectedFromUrl)
  const [now, setNow] = useState(() => new Date())
  const [skipDateLocks] = useState(skipDateLocksFromSearch)

  useEffect(() => {
    syncUrl(selected)
  }, [selected])

  useEffect(() => {
    if (skipDateLocks) return undefined
    const id = window.setTimeout(() => {
      setNow(new Date())
    }, msUntilNextMidnight(now))
    return () => window.clearTimeout(id)
  }, [now, skipDateLocks])

  const value = useMemo(() => {
    const nextDay = days.find((day) => !unlocked.includes(day.id)) ?? null
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
      isDateOpen(id) {
        return isDateOpenFor(getDay(id), now, skipDateLocks)
      },
      canAttempt(id) {
        return canAttemptDay(unlocked, id, now, skipDateLocks)
      },
      selectHome() {
        setSelected(HOME)
      },
      selectDay(id) {
        if (!canAttemptDay(unlocked, id, now, skipDateLocks)) return
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
  }, [now, selected, skipDateLocks, unlocked])

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
