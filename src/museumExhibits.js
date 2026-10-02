const WALL_X = 128
const SIDE_CLEARANCE = 256
const PICTURE_COUNT = 6
const PICTURE_SPACING = Math.round(512 * 0.7)
const wallWidth = SIDE_CLEARANCE * 2 + PICTURE_SPACING * (PICTURE_COUNT - 1)
const eastX = WALL_X + wallWidth

export const HALL = {
  width: eastX + 64 + 128,
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

export const museumFloors = [{ id: 'hall', x: WALL_X, y: 368, w: wallWidth, h: 192 }]

export const museumWalls = [
  { id: 'back', x: WALL_X, y: 128, w: wallWidth, h: 240, face: 'south' },
  { id: 'front', x: WALL_X, y: 560, w: wallWidth, h: 240, face: 'north' },
  { id: 'west', x: 64, y: 128, w: 64, h: 672 },
  { id: 'east', x: eastX, y: 128, w: 64, h: 672 },
]

const picture = { w: 108, h: 80, y: 208 }

const pictureXs = Array.from(
  { length: PICTURE_COUNT },
  (_, index) => WALL_X + SIDE_CLEARANCE + index * PICTURE_SPACING,
)

export const museumExhibits = pictureXs.map((x, index) => ({
  id: `picture-${index + 1}`,
  x,
  y: picture.y,
  w: picture.w,
  h: picture.h,
  title: `Picture ${index + 1}`,
  caption,
  photo,
}))
