# NYC storybook map generator

Generates the fixed, storybook-styled NYC base map used by the City Map Explorer
game (Day 3). It pulls real OpenStreetMap geometry (water, parks, road network)
for the Manhattan / Queens / Brooklyn area, renders it with a warm storybook
palette, adds paper grain + a soft vignette, and writes:

- `src/citymap/assets/nyc-map.webp` — the walkable base map image
- `src/citymap/mapMeta.js` — image dimensions + geographic bbox, with
  `pixelToLatLng` / `latLngToPixel` helpers (the map is geo-referenced)

The committed `.webp` is the source of truth for the app; this script only needs
to be re-run if you want to change the extent, palette, or resolution.

## Usage

```bash
cd scripts/generate_nyc_map
pip install -r requirements.txt   # or: pip install --break-system-packages --user -r requirements.txt
python generate_map.py
```

Fetching the OSM data + rendering takes ~1-2 minutes and requires network
access to the OpenStreetMap Overpass API. Tunables (extent, palette, output
resolution, WebP quality) live at the top of `generate_map.py`.
