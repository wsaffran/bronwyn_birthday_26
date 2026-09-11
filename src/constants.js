export const TAB_TITLE_BEFORE = 'BRONWYN IS ALMOST 26'
export const TAB_TITLE_AFTER = 'BRONWYN IS 26!!!'

// October 16, 2026 at local midnight in the visitor's timezone
export const BIRTHDAY = { year: 2026, month: 9, date: 16 }

export function toLocalDate({ year, month, date }) {
  return new Date(year, month, date)
}

export function getBirthdayDate() {
  return toLocalDate(BIRTHDAY)
}

export function getTimeUntilBirthday(now = new Date()) {
  const ms = Math.max(0, getBirthdayDate().getTime() - now.getTime())
  const totalSeconds = Math.floor(ms / 1000)

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    reached: ms === 0,
  }
}

export function getTabTitle(now = new Date()) {
  return now >= getBirthdayDate() ? TAB_TITLE_AFTER : TAB_TITLE_BEFORE
}
