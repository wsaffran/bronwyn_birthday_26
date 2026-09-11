export const days = [
  {
    id: 1,
    slug: 'day1',
    password: 'testday1',
    label: 'day 1',
    title: 'A playlist, just for you',
    kind: 'music',
    playlistUrl: 'https://open.spotify.com/playlist/4ic6Tu4bKjm91RebrCAxOe',
    embedUrl:
      'https://open.spotify.com/embed/playlist/4ic6Tu4bKjm91RebrCAxOe?utm_source=generator&theme=0',
  },
  {
    id: 2,
    slug: 'day2',
    password: 'testday2',
    label: 'day 2',
    title: 'A maze, just for you',
    kind: 'maze',
  },
  {
    id: 3,
    slug: 'day3',
    password: 'testday3',
    label: 'day 3',
    title: 'Day 3',
    kind: 'placeholder',
  },
  {
    id: 4,
    slug: 'day4',
    password: 'testday4',
    label: 'day 4',
    title: 'Day 4',
    kind: 'placeholder',
  },
  {
    id: 5,
    slug: 'day5',
    password: 'testday5',
    label: 'day 5',
    title: 'Day 5',
    kind: 'placeholder',
  },
  {
    id: 6,
    slug: 'day6',
    password: 'testday6',
    label: 'day 6',
    title: 'Day 6',
    kind: 'placeholder',
  },
  {
    id: 7,
    slug: 'day7',
    password: 'testday7',
    label: 'day 7',
    title: 'Day 7',
    kind: 'placeholder',
  },
]

export function getDay(id) {
  return days.find((day) => day.id === id)
}
