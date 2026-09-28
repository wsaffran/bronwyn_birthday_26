export const HALL = {
  width: 3392,
  height: 960,
}

export const HALL_START = {
  x: 176,
  y: 464,
}

export const HALL_SPEED_PX_PER_SEC = 180

/** How close she needs to be to a picture before View appears. */
export const EXHIBIT_VIEW_RADIUS_PX = 110

export const PLAYER_RADIUS = 26

const caption = 'A placeholder label. The real caption goes here.'
const photo = 'museum/placeholder.jpg'

export const museumFloors = [{ id: 'hall', x: 128, y: 368, w: 3072, h: 192 }]

export const museumWalls = [
  { id: 'back', x: 128, y: 128, w: 3072, h: 240, face: 'south' },
  { id: 'front', x: 128, y: 560, w: 3072, h: 240, face: 'north' },
  { id: 'west', x: 64, y: 128, w: 64, h: 672 },
  { id: 'east', x: 3200, y: 128, w: 64, h: 672 },
]

const picture = { w: 108, h: 80, y: 208 }

export const museumExhibits = [384, 896, 1408, 1920, 2432, 2944].map((x, index) => ({
  id: `picture-${index + 1}`,
  x,
  y: picture.y,
  w: picture.w,
  h: picture.h,
  title: `Picture ${index + 1}`,
  caption,
  photo,
}))
