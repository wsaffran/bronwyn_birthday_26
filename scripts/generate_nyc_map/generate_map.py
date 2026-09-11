#!/usr/bin/env python3
"""Generate a fixed, geographically accurate but storybook-styled NYC map.

Pulls real OpenStreetMap geometry (water, parks, road network) for the
Manhattan / Queens / Brooklyn area shown in the reference screenshot, renders it
with a warm storybook palette, adds a paper texture, and writes a single static
PNG plus a JS metadata module used by the in-game coordinate system.

Run:
    pip install -r requirements.txt
    python generate_map.py

Outputs (relative to repo root):
    src/citymap/assets/nyc-map.png
    src/citymap/mapMeta.js
"""

from __future__ import annotations

import json
import os
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import osmnx as ox
from PIL import Image
from pyproj import Transformer

# --- Geographic extent (WGS84) matching the reference screenshot ---------------
# west, south, east, north
WEST, SOUTH, EAST, NORTH = -74.025, 40.642, -73.791, 40.792

TARGET_WIDTH_PX = 4096
DPI = 200

# --- Storybook palette ---------------------------------------------------------
LAND = "#f3ead6"       # warm parchment
WATER = "#a9ccd6"      # soft muted teal
WATER_EDGE = "#7fa9b4"
GREEN = "#c2d4a4"      # muted sage
GREEN_EDGE = "#a9c084"
ROAD_MAJOR = "#b8996a"
ROAD_MINOR = "#cbb488"
LABEL = "#6b5836"

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_IMG = os.path.join(REPO_ROOT, "src", "citymap", "assets", "nyc-map.webp")
RAW_PNG = os.path.join(REPO_ROOT, "scripts", "generate_nyc_map", ".nyc-map-raw.png")
OUT_META = os.path.join(REPO_ROOT, "src", "citymap", "mapMeta.js")
WEBP_QUALITY = 80

WATER_TAGS = {
    "natural": ["water", "bay", "strait", "wetland"],
    "water": True,
    "landuse": ["reservoir", "basin"],
}
GREEN_TAGS = {
    "leisure": ["park", "garden", "nature_reserve", "golf_course", "pitch"],
    "landuse": ["grass", "recreation_ground", "cemetery", "forest", "meadow", "village_green"],
    "natural": ["wood", "scrub", "grassland", "heath"],
}

ROAD_WIDTHS = {
    "motorway": 1.9,
    "trunk": 1.7,
    "primary": 1.3,
    "secondary": 0.9,
    "tertiary": 0.65,
    "residential": 0.4,
    "unclassified": 0.4,
    "living_street": 0.35,
}
DEFAULT_ROAD_WIDTH = 0.35


def log(msg: str) -> None:
    print(f"[generate_map] {msg}", flush=True)


def only_polygons(gdf):
    if gdf is None or len(gdf) == 0:
        return None
    mask = gdf.geometry.type.isin(["Polygon", "MultiPolygon"])
    out = gdf[mask]
    return out if len(out) else None


def fetch_features(tags, label):
    try:
        gdf = ox.features_from_bbox((WEST, SOUTH, EAST, NORTH), tags)
        gdf = only_polygons(gdf)
        log(f"fetched {label}: {0 if gdf is None else len(gdf)} polygons")
        return gdf
    except Exception as exc:  # noqa: BLE001
        log(f"WARNING: failed to fetch {label}: {exc}")
        return None


def road_width(hwy):
    if isinstance(hwy, list):
        hwy = hwy[0] if hwy else None
    return ROAD_WIDTHS.get(hwy, DEFAULT_ROAD_WIDTH)


def main() -> int:
    os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)

    to_merc = Transformer.from_crs(4326, 3857, always_xy=True)
    xmin, ymin = to_merc.transform(WEST, SOUTH)
    xmax, ymax = to_merc.transform(EAST, NORTH)
    merc_w = xmax - xmin
    merc_h = ymax - ymin
    aspect = merc_h / merc_w
    height_px = int(round(TARGET_WIDTH_PX * aspect))
    log(f"mercator extent {merc_w:.0f} x {merc_h:.0f} -> image {TARGET_WIDTH_PX}x{height_px}")

    water = fetch_features(WATER_TAGS, "water")
    green = fetch_features(GREEN_TAGS, "green")

    log("fetching road network (drive)...")
    try:
        graph = ox.graph_from_bbox(
            (WEST, SOUTH, EAST, NORTH),
            network_type="drive",
            simplify=True,
            retain_all=True,
            truncate_by_edge=True,
        )
        roads = ox.graph_to_gdfs(graph, nodes=False).to_crs(3857)
        log(f"fetched roads: {len(roads)} edges")
    except Exception as exc:  # noqa: BLE001
        log(f"WARNING: failed to fetch roads: {exc}")
        roads = None

    fig_w_in = TARGET_WIDTH_PX / DPI
    fig_h_in = height_px / DPI
    fig, ax = plt.subplots(figsize=(fig_w_in, fig_h_in), dpi=DPI)
    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
    ax.set_axis_off()
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.set_aspect("equal")
    ax.set_facecolor(LAND)
    fig.patch.set_facecolor(LAND)

    if green is not None:
        green.to_crs(3857).plot(ax=ax, color=GREEN, edgecolor=GREEN_EDGE, linewidth=0.3, zorder=2)

    if water is not None:
        water.to_crs(3857).plot(ax=ax, color=WATER, edgecolor=WATER_EDGE, linewidth=0.6, zorder=3)

    if roads is not None and "highway" in roads.columns:
        roads = roads.copy()
        roads["_w"] = roads["highway"].map(road_width)
        roads["_major"] = roads["_w"] >= 0.9
        minor = roads[~roads["_major"]]
        major = roads[roads["_major"]]
        if len(minor):
            minor.plot(ax=ax, color=ROAD_MINOR, linewidth=minor["_w"].tolist(), zorder=4)
        if len(major):
            major.plot(ax=ax, color=ROAD_MAJOR, linewidth=major["_w"].tolist(), zorder=5)
    elif roads is not None:
        roads.plot(ax=ax, color=ROAD_MINOR, linewidth=0.4, zorder=4)

    # Borough labels (approximate centroids), storybook serif look.
    labels = [
        ("MANHATTAN", 40.775, -73.968),
        ("QUEENS", 40.728, -73.850),
        ("BROOKLYN", 40.665, -73.952),
    ]
    for name, lat, lng in labels:
        lx, ly = to_merc.transform(lng, lat)
        ax.text(
            lx, ly, name,
            fontsize=22, color=LABEL, alpha=0.55, ha="center", va="center",
            family="serif", fontweight="bold",
            zorder=6,
        )

    log("rendering figure...")
    fig.savefig(RAW_PNG, dpi=DPI, facecolor=LAND)
    plt.close(fig)

    postprocess(RAW_PNG, OUT_IMG)
    if os.path.exists(RAW_PNG):
        os.remove(RAW_PNG)

    write_meta(TARGET_WIDTH_PX, height_px)
    log(f"done: {OUT_IMG}")
    return 0


def postprocess(src_path: str, out_path: str) -> None:
    """Add a subtle paper grain + vignette, then save a compressed WebP."""
    img = Image.open(src_path).convert("RGB")
    w, h = img.size
    arr = np.asarray(img).astype(np.float32)

    rng = np.random.default_rng(7)
    grain = rng.normal(0.0, 6.0, size=(h, w, 1)).astype(np.float32)
    arr = arr + grain

    # Radial vignette
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2.0, h / 2.0
    dist = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    vig = np.clip(1.0 - 0.16 * np.clip(dist - 0.55, 0, None), 0.80, 1.0)[..., None]
    arr = arr * vig

    arr = np.clip(arr, 0, 255).astype(np.uint8)
    Image.fromarray(arr).save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
    log(f"post-processed + saved WebP q{WEBP_QUALITY}")


def write_meta(width: int, height: int) -> None:
    meta = {
        "width": width,
        "height": height,
        "bbox": {"west": WEST, "south": SOUTH, "east": EAST, "north": NORTH},
    }
    body = (
        "// AUTO-GENERATED by scripts/generate_nyc_map/generate_map.py — do not edit by hand.\n"
        "// The map image is geo-referenced so pixel <-> lat/lng conversion is available.\n\n"
        f"export const MAP_META = {json.dumps(meta, indent=2)}\n\n"
        "export function pixelToLatLng(x, y) {\n"
        "  const { west, south, east, north } = MAP_META.bbox\n"
        "  const lng = west + (x / MAP_META.width) * (east - west)\n"
        "  const lat = north - (y / MAP_META.height) * (north - south)\n"
        "  return { lat, lng }\n"
        "}\n\n"
        "export function latLngToPixel(lat, lng) {\n"
        "  const { west, south, east, north } = MAP_META.bbox\n"
        "  const x = ((lng - west) / (east - west)) * MAP_META.width\n"
        "  const y = ((north - lat) / (north - south)) * MAP_META.height\n"
        "  return { x, y }\n"
        "}\n"
    )
    with open(OUT_META, "w") as fh:
        fh.write(body)
    log(f"wrote {OUT_META}")


if __name__ == "__main__":
    sys.exit(main())
