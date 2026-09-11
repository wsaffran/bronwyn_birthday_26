// Tunables for the NYC City Map Explorer game.
// The walkable world is the generated map image (see mapMeta.js). All landmark
// positions and the player position are expressed in that image's pixel space.

// World px -> CSS px. Larger = more zoomed in (bigger character, less map visible).
export const SCALE = 2.4

// Cap device-pixel-ratio for crisp-but-affordable rendering.
export const MAX_DPR = 2

// Character movement speed, in world pixels per second.
export const WALK_SPEED = 82

// Walk animation frame toggles per second.
export const ANIM_FPS = 6

// How close (world px) the character must be for a landmark to become active.
export const INTERACT_RADIUS = 52

// Keep the character sprite fully inside the map image.
export const EDGE_MARGIN = 10

// Where the character starts (world px) — Midtown Manhattan, near Times Square.
export const PLAYER_START = { x: 700, y: 800 }

// Storybook marker styling (kept a constant screen size, independent of zoom).
export const MARKER = {
  radius: 9, // css px
  fill: '#b0413e',
  fillActive: '#e0574f',
  ring: '#f6efdd',
  dot: '#f6efdd',
  shadow: 'rgba(40, 24, 12, 0.35)',
}

// Action keys that open the active landmark's modal.
export const ACTION_CODES = new Set(['Enter', 'Space', 'KeyE'])
