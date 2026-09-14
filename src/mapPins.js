export const MAP_START = {
  lat: 40.7726,
  lng: -73.926,
  zoom: 16,
}

export const MAP_MIN_ZOOM = 13
export const MAP_MAX_ZOOM = 19

export const mapPins = [
  {
    id: 'long-island-city',
    // 40°44'50.4"N 73°57'29.2"W
    lat: 40 + 44 / 60 + 50.4 / 3600,
    lng: -(73 + 57 / 60 + 29.2 / 3600),
    title: 'Long Island City Date',
    photo: 'pins/long-island-city.jpg',
  },
]
