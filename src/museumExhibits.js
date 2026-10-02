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
  x: WALL_X + 48,
  y: 464,
}

export const HALL_SPEED_PX_PER_SEC = 180

/** How close she needs to be to a picture before View appears. */
export const EXHIBIT_VIEW_RADIUS_PX = 110

export const PLAYER_RADIUS = 26

const caption = 'A placeholder label. The real caption goes here.'
const photo = 'museum/placeholder.jpg'

const floor = { x: WALL_X, y: 368, w: wallWidth, h: 192 }
const wallTop = 128

export const museumFloors = [{ id: 'hall', ...floor }]

export const museumWalls = [
  { id: 'back', x: floor.x, y: wallTop, w: floor.w, h: floor.y - wallTop, face: 'south' },
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
