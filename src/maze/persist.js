import { COMPLETE_KEY } from './constants'

export function readComplete() {
  try {
    return localStorage.getItem(COMPLETE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeComplete() {
  try {
    localStorage.setItem(COMPLETE_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}
