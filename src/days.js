import { BIRTHDAY, toLocalDate } from './constants'

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function october(date) {
  return { year: 2026, month: 9, date }
}

function withOpenDate(opensOn, rest) {
  return {
    ...rest,
    opensOn,
    slug: `oct-${opensOn.date}`,
    label: formatDayLabel({ opensOn }),
    chipMonth: MONTH_SHORT[opensOn.month],
    chipDate: String(opensOn.date),
  }
}

export const days = [
  withOpenDate(october(10), {
    id: 1,
    password: 'testday1',
    title: 'A playlist, just for you',
    kind: 'music',
    playlistUrl: 'https://open.spotify.com/playlist/4ic6Tu4bKjm91RebrCAxOe',
    embedUrl:
      'https://open.spotify.com/embed/playlist/4ic6Tu4bKjm91RebrCAxOe?utm_source=generator&theme=0',
  }),
  withOpenDate(october(11), {
    id: 2,
    password: 'testday2',
    title: 'Day 2',
    kind: 'placeholder',
  }),
  withOpenDate(october(12), {
    id: 3,
    password: 'testday3',
    title: 'Day 3',
    kind: 'placeholder',
  }),
  withOpenDate(october(13), {
    id: 4,
    password: 'testday4',
    title: 'Day 4',
    kind: 'placeholder',
  }),
  withOpenDate(october(14), {
    id: 5,
    password: 'testday5',
    title: 'Day 5',
    kind: 'placeholder',
  }),
  withOpenDate(october(15), {
    id: 6,
    password: 'testday6',
    title: 'Day 6',
    kind: 'placeholder',
  }),
  withOpenDate(BIRTHDAY, {
    id: 7,
    password: 'testday7',
    title: 'Day 7',
    kind: 'placeholder',
  }),
]

export function getDay(id) {
  return days.find((day) => day.id === id)
}

export function getOpenDate(day) {
  return toLocalDate(day.opensOn)
}

export function isOpenOn(day, now = new Date()) {
  return now >= getOpenDate(day)
}

export function formatDayLabel(day) {
  return `${MONTH_LONG[day.opensOn.month]} ${day.opensOn.date}`
}
