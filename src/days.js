import { toLocalDate } from './constants'

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
    labelJa: formatJapaneseDayLabel({ opensOn }),
    chipMonth: MONTH_SHORT[opensOn.month],
    chipDate: String(opensOn.date),
  }
}

export const days = [
  withOpenDate(october(11), {
    id: 1,
    password: 'vodka cranberry',
    passwordAliases: ['vodka cran'],
    weakPasswords: ['drink', 'vodka', 'alcohol', 'dance', 'salsa', 'tu con el'],
    weakPasswordHints: {
      drink: 'Close! Be a bit more specific!',
      vodka: 'You are half way there!',
      alcohol: 'Close! Be a bit more specific!',
      dance: 'Not everything we shared that night was a dance',
      salsa: 'Not everything we shared that night was a dance',
      'tu con el': 'Not everything we shared that night was a dance',
    },
    hints: [
      'Think about what was in our hands',
      'You might find half the answer in a half-empty bottle in our fridge. Sorry you wont be able to check!',
    ],
    title: 'A playlist, just for you',
    kind: 'music',
    playlistUrl: 'https://open.spotify.com/playlist/6T230heijZByxfNrJDcWW2',
    embedUrl:
      'https://open.spotify.com/embed/playlist/6T230heijZByxfNrJDcWW2?utm_source=generator&theme=0&si=0dce24edc785428d',
    songKey: [
      'You captured me at first sight',
      'I wondered who you were',
      'You gave me hope',
      'You let me fall into this with you',
      'And showed me what love can be',
      'Forever',
      'A life together to look back on',
      'Let’s make the most of it',
      'I’ve never believed in anyone more',
    ],
  }),
  withOpenDate(october(12), {
    id: 2,
    password: 'expeditiously',
    passwordAliases: ['expaditiously', 'expiditiously'],
    hints: [
      'quickly!',
      'When in doubt consult the thesaurus ^^^',
    ],
    title: 'Day 2',
    kind: 'memory',
  }),
  withOpenDate(october(13), {
    id: 3,
    password: 'lilly of the valley',
    passwordAliases: ['lily of the valley'],
    title: 'Day 3',
    kind: 'ipod',
  }),
  withOpenDate(october(14), {
    id: 4,
    password: 'anna sui',
    passwordAliases: ['ana sui'],
    title: 'Day 4',
    kind: 'map',
  }),
  withOpenDate(october(15), {
    id: 5,
    password: 'shima-enaga',
    passwordAliases: ['shima enaga'],
    title: 'A museum of us',
    kind: 'museum',
  }),
  withOpenDate(october(16), {
    id: 6,
    password: 'chiaki',
    title: 'Day 6',
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

export function formatJapaneseDayLabel(day) {
  return `${day.opensOn.month + 1}月${day.opensOn.date}日`
}

export function formatDayLabel(day) {
  return `${MONTH_LONG[day.opensOn.month]} ${day.opensOn.date}`
}
