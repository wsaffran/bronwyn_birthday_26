import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const COOKIE_NAME = 'bronwyn'
const ADMIT_VALUE = '10162000'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function readCookie(name) {
  const prefix = `${name}=`
  const row = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  return row ? decodeURIComponent(row.slice(prefix.length)) : ''
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${MAX_AGE_SECONDS}; path=/; SameSite=Lax`
}

function admitFromEntry() {
  if (readCookie(COOKIE_NAME) === ADMIT_VALUE) return true
  const params = new URLSearchParams(window.location.search)
  if (params.get(COOKIE_NAME) !== ADMIT_VALUE) return false
  writeCookie(COOKIE_NAME, ADMIT_VALUE)
  return true
}

function stripAdmitParam() {
  const url = new URL(window.location.href)
  if (url.searchParams.get(COOKIE_NAME) !== ADMIT_VALUE) return
  url.searchParams.delete(COOKIE_NAME)
  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next !== current) window.history.replaceState(null, '', next)
}

export default function BronwynGate() {
  const [admitted] = useState(admitFromEntry)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (admitted) stripAdmitParam()
  }, [admitted])

  useLayoutEffect(() => {
    const stage = document.querySelector('.site-shell')
    if (!stage || admitted) return undefined
    stage.setAttribute('inert', '')
    dialogRef.current?.focus()
    return () => stage.removeAttribute('inert')
  }, [admitted])

  if (admitted) return null

  return (
    <div
      ref={dialogRef}
      className="bronwyn-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bronwyn-gate-title"
      tabIndex={-1}
    >
      <p id="bronwyn-gate-title">This site is for Bronwyn only!</p>
    </div>
  )
}
