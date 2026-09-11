import { latLngToPixel } from './mapMeta'
import timesSquareImg from './assets/landmarks/times-square.webp'
import centralParkImg from './assets/landmarks/central-park.webp'
import brooklynBridgeImg from './assets/landmarks/brooklyn-bridge.webp'
import prospectParkImg from './assets/landmarks/prospect-park.webp'
import unisphereImg from './assets/landmarks/unisphere.webp'
import brooklynMuseumImg from './assets/landmarks/brooklyn-museum.webp'

// Each landmark is placed by pixel (x, y) on the map image (0,0 = top-left,
// see MAP_META in mapMeta.js for the image size). To add one, either:
//   1. give me a pixel position:  { x: 1234, y: 890, ... }
//   2. or use `at(lat, lng)` below to place it by real-world coordinates.
// Use the in-game dev helper (append ?place to the URL, then click the map) to
// read off pixel coordinates.
const at = (lat, lng) => latLngToPixel(lat, lng)

export const LANDMARKS = [
  {
    id: 'times-square',
    name: 'Times Square',
    ...at(40.758, -73.985),
    image: timesSquareImg,
    story:
      'The bright heart of Midtown, where a million lights never sleep. Add your own memory of this spot here.',
  },
  {
    id: 'central-park',
    name: 'Central Park',
    ...at(40.7829, -73.9654),
    image: centralParkImg,
    story:
      '843 acres of green tucked into the city grid. A perfect place for a long, wandering walk.',
  },
  {
    id: 'brooklyn-bridge',
    name: 'Brooklyn Bridge',
    ...at(40.7061, -73.9969),
    image: brooklynBridgeImg,
    story:
      'A 19th-century marvel of stone and steel cables linking Manhattan and Brooklyn over the East River.',
  },
  {
    id: 'prospect-park',
    name: 'Prospect Park',
    ...at(40.6602, -73.969),
    image: prospectParkImg,
    story:
      "Brooklyn's great backyard, with a long meadow, a lake, and winding wooded paths.",
  },
  {
    id: 'unisphere',
    name: 'The Unisphere',
    ...at(40.7458, -73.8447),
    image: unisphereImg,
    story:
      "A giant steel globe in Flushing Meadows, left over from the 1964 World's Fair.",
  },
  {
    id: 'brooklyn-museum',
    name: 'Brooklyn Museum',
    ...at(40.6712, -73.9636),
    image: brooklynMuseumImg,
    story:
      "One of the oldest and largest art museums in the country, right beside the Botanic Garden.",
  },
]
