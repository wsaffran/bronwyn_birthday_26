// Metadata for the walkable NYC map image (src/citymap/assets/nyc-map.webp).
// The map is a north-up Web Mercator view, so it is geo-referenced and pixel
// <-> lat/lng conversion is available. The bounding box below was calibrated
// against known landmarks (Times Square, Grand Army Plaza, the Brooklyn Bridge,
// Prospect Park) so latLngToPixel places markers on the right streets.

export const MAP_META = {
  width: 3000,
  height: 3000,
  bbox: {
    west: -74.0263,
    south: 40.65158,
    east: -73.8451,
    north: 40.78949,
  },
}

export function pixelToLatLng(x, y) {
  const { west, south, east, north } = MAP_META.bbox
  const lng = west + (x / MAP_META.width) * (east - west)
  const lat = north - (y / MAP_META.height) * (north - south)
  return { lat, lng }
}

export function latLngToPixel(lat, lng) {
  const { west, south, east, north } = MAP_META.bbox
  const x = ((lng - west) / (east - west)) * MAP_META.width
  const y = ((north - lat) / (north - south)) * MAP_META.height
  return { x, y }
}
