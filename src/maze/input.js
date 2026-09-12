const KEY_TO_DIR = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
}

export function createInput() {
  const held = new Map()

  function setDir(dir, down) {
    if (!dir) return
    if (down) held.set(dir, performance.now())
    else held.delete(dir)
  }

  function primary() {
    const active = new Map(held)
    if (active.has('up') && active.has('down')) {
      if (active.get('up') > active.get('down')) active.delete('down')
      else active.delete('up')
    }
    if (active.has('left') && active.has('right')) {
      if (active.get('left') > active.get('right')) active.delete('right')
      else active.delete('left')
    }
    let best = null
    let bestTime = -1
    for (const [dir, time] of active) {
      if (time >= bestTime) {
        best = dir
        bestTime = time
      }
    }
    return best
  }

  function onKeyDown(event) {
    const dir = KEY_TO_DIR[event.code]
    if (!dir) return
    event.preventDefault()
    if (event.repeat) return
    setDir(dir, true)
  }

  function onKeyUp(event) {
    const dir = KEY_TO_DIR[event.code]
    if (!dir) return
    event.preventDefault()
    setDir(dir, false)
  }

  function attach() {
    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp, { passive: false })
  }

  function detach() {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    held.clear()
  }

  function clear() {
    held.clear()
  }

  return { setDir, primary, attach, detach, clear }
}
