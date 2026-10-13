// Flip this to true to show the speaker button on each museum photo.
const MUSEUM_AUDIO_ENABLED = false

const WALL_X = 128
const SIDE_CLEARANCE = 256
const PICTURE_SPACING = Math.round(512 * 0.7)
const PICTURE_HEIGHT = 117
const PICTURE_BOTTOM = 288

// Desktop folder order, 1 through 13. Width and height are the saved file size.
const photos = [
  { src: 'museum/1.jpg', w: 1600, h: 1532, audio: 'museum/1.m4a', title: 'R2D2 Hoji' },
  { src: 'museum/2.jpg', w: 1260, h: 1600, audio: 'museum/2.m4a', title: 'Hoji’s Dinner Party' },
  { src: 'museum/3.jpg', w: 1200, h: 1600, audio: 'museum/3.m4a', title: 'Sock on hairdryer' },
  { src: 'museum/4.jpg', w: 1200, h: 1600, audio: 'museum/4.m4a', title: 'Spork in Popeye’s Apple Pie' },
  { src: 'museum/5.jpg', w: 1600, h: 1587, audio: 'museum/5.m4a', title: 'Buckee’s Bokers On Shima-Enaga' },
  { src: 'museum/6.jpg', w: 1200, h: 1600, audio: 'museum/6.m4a', title: 'One-Legged Pigeon' },
  { src: 'museum/7.jpg', w: 1200, h: 1600, audio: 'museum/7.m4a', title: 'Cassava Chip Disaster of September 2026' },
  { src: 'museum/8.jpg', w: 1200, h: 1600, audio: 'museum/8.m4a', title: 'Only 3 Cookies' },
  { src: 'museum/9.jpg', w: 1200, h: 1600, audio: 'museum/9.m4a', title: 'Pure Embarrassment' },
  { src: 'museum/10.jpg', w: 1200, h: 1600, audio: 'museum/10.m4a', title: 'Glass' },
  { src: 'museum/11.jpg', w: 1200, h: 1600, audio: 'museum/11.m4a', title: 'Fun games to play with your boyfriend on computer' },
  { src: 'museum/12.jpg', w: 1200, h: 1600, audio: 'museum/12.m4a', title: 'BRONWYN & WILL' },
  { src: 'museum/13.jpg', w: 900, h: 1600, audio: 'museum/13.m4a', title: 'Crock in Door' },
]

const PICTURE_COUNT = photos.length
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

const floor = { x: WALL_X, y: 368, w: wallWidth, h: 192 }
const floralWidth = 340
const floralHeight = Math.round((floralWidth * 1024) / 769)

export const museumFloors = [{ id: 'hall', ...floor }]

const pictureY = PICTURE_BOTTOM - PICTURE_HEIGHT

const pictureXs = Array.from(
  { length: PICTURE_COUNT },
  (_, index) => WALL_X + SIDE_CLEARANCE + index * PICTURE_SPACING,
)

const pictureCenterY = pictureY + PICTURE_HEIGHT / 2
// The linework is cropped on both sides near the bottom of the file.
// Drop it behind the floor, and shift it right so the motif sits on the picture.
const floralNudgeX = 26
const floralNudgeY = 40

export const museumFlorals = pictureXs.map((x, index) => ({
  id: `floral-${index + 1}`,
  x: x - floralWidth / 2 + floralNudgeX,
  y: pictureCenterY - floralHeight / 2 + floralNudgeY,
  w: floralWidth,
  h: floralHeight,
}))

export const museumExhibits = pictureXs.map((x, index) => {
  const photo = photos[index]
  return {
    id: `picture-${index + 1}`,
    x,
    y: pictureY,
    w: Math.round(PICTURE_HEIGHT * (photo.w / photo.h)),
    h: PICTURE_HEIGHT,
    title: photo.title,
    caption: '',
    photo: photo.src,
    audio: MUSEUM_AUDIO_ENABLED ? photo.audio : null,
  }
})
