// Flip this to true to play each recording instead of showing its description.
const MUSEUM_AUDIO_ENABLED = false

const WALL_X = 128
const SIDE_CLEARANCE = 256
const PICTURE_SPACING = Math.round(512 * 0.7)
const PICTURE_HEIGHT = 117
const PICTURE_BOTTOM = 288

// Desktop folder order, 1 through 13. Width and height are the saved file size.
const photos = [
  {
    src: 'museum/1.jpg',
    w: 1600,
    h: 1532,
    audio: 'museum/1.m4a',
    title: 'R2D2 Hoji',
    caption:
      'You can see here Hoji, in R2D2 formation. You sent me this image in March of 2026, if you could even believe that. This was when I found out that sweet picture of Hoji on your lock screen was all a lie.',
  },
  {
    src: 'museum/2.jpg',
    w: 1260,
    h: 1600,
    audio: 'museum/2.m4a',
    title: 'Hoji’s Dinner Party',
    caption:
      'In May of 2026, you invited me to your apartment for the first time. Not only that, but I was meeting all of your friends and roommate for the first time too. This was a big step in our relationship and it meant so much to me. I was also so impressed by your drawing. I knew I was walking into something so special.',
  },
  {
    src: 'museum/3.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/3.m4a',
    title: 'Sock on hairdryer',
    caption:
      'In early July, this masterpiece was created out of necessity. I don’t even remember why we were doing this on a Monday morning at 8 AM, but this image lives in my head forever and was the inspiration for the cover of the first and most beautiful playlist I have ever received.',
  },
  {
    src: 'museum/4.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/4.m4a',
    title: 'Spork in Popeye’s Apple Pie',
    caption:
      'In July, we had a late night after Yumeki’s fashion event and needed some food really bad, so we went to Popeyes in Astoria and watched people walk around a city. I remember this disturbed you, but is now significant to our story.',
  },
  {
    src: 'museum/5.jpg',
    w: 1600,
    h: 1587,
    audio: 'museum/5.m4a',
    title: 'Buc-ee’s Boxers on Shima-Enaga',
    caption:
      'I believe this happened before I went to Canada. And I know I will never wear those boxers again.',
  },
  {
    src: 'museum/6.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/6.m4a',
    title: 'One-Legged Pigeon',
    caption:
      'We had a really special date in LIC this night. We got boba and went to the water, and walked past crazy parts of the city we never knew existed. But, amongst all that, on our walk this is one of the few pictures we have from that night.',
  },
  {
    src: 'museum/7.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/7.m4a',
    title: 'Cassava Chip Disaster of September 2026',
    caption:
      'Before we had even left NYC on our way to Rome, Bronwyn had made an absolute mess of the cassava chips we brought. Very few snacks made it to Rome that night in tact.',
  },
  {
    src: 'museum/8.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/8.m4a',
    title: 'Only 3 Cookies',
    caption: 'It was not only 3 cookies this night.',
  },
  {
    src: 'museum/9.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/9.m4a',
    title: 'Pure Embarrassment',
    caption:
      'Not us having a family size box of kinder cakes on our lap while every flight attendant stood over us arguing with the crazy woman next to us.',
  },
  {
    src: 'museum/10.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/10.m4a',
    title: 'Glass',
    caption:
      'Stumbled upon this masterpiece on our way back from Thai food in Crown Heights. The waitress said your smile was pretty. And I agree.',
  },
  {
    src: 'museum/11.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/11.m4a',
    title: 'Fun games to play with your boyfriend on computer',
    caption: 'This one speaks for itself. It is one of my favorites.',
  },
  {
    src: 'museum/12.jpg',
    w: 1200,
    h: 1600,
    audio: 'museum/12.m4a',
    title: 'BRONWYN & WILL',
    caption:
      'Testing out pens for our drawing date after going to the Brooklyn museum. Got to leave our mark.',
  },
  {
    src: 'museum/13.jpg',
    w: 900,
    h: 1600,
    audio: 'museum/13.m4a',
    title: 'Crock in Door',
    caption:
      'Necessary innovation to get fresh air in the apartment. I see nothing odd about this one at all.',
  },
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
    caption: MUSEUM_AUDIO_ENABLED ? '' : photo.caption,
    photo: photo.src,
    audio: MUSEUM_AUDIO_ENABLED ? photo.audio : null,
  }
})
