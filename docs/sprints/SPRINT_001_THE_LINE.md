# Sprint 001 — The Line (first-visit cinematic intro)

**Branch:** `feature/intro-the-line` · **Status:** complete, not yet merged

## Goal

An opening cinematic sequence for the homepage that creates emotion before
the visitor starts reading — closer to a documentary title sequence than a
typical "travel site" animation. Plays once per visitor, then gets out of
the way permanently.

## Concept

A single point of light draws the real journey — Holland, Italy, Hong Kong,
China, Japan, Singapore, Thailand, New Zealand, Australia, America, in the
real order and with real relative distances — over faintly-revealed
coastline terrain. The camera pulls back to real the whole route, which bows
with a whisper of globe curvature, holds for a beat, then is pulled taut
into the hero's rule line as the homepage photograph develops through the
darkness beneath it.

Three concepts were considered (a drawn line; a cloud-descent; a
dust-forming globe). "The Line" was chosen because the intro becomes part of
the site's ongoing visual language (the line motif can recur as a route
device elsewhere), it's the lightest to render, and a single continuous line
is the truest metaphor for one continuous six-month journey.

## What shipped

- **Renderer:** `src/scripts/intro-scene.ts` — Canvas 2D (deliberately not
  three.js/WebGL for this; the whole piece is a polyline, a faux bloom, and
  a masked terrain reveal, and pulling three.js into first page load would
  cost more than it buys). Comet-style line with a tapering bright head,
  ember sparks shed during travel, a sparse counter-drifting star-dust field
  for camera-through-space depth, and coastline etching (not flat fog) on
  the terrain reveal.
- **Overlay + choreography:** `src/components/IntroSequence.astro` — owns
  the dock sequence (line → hero rule), the head-inline first-paint gate
  (with a 3-second failsafe so a dead script can never trap the page),
  skip handling, and the reduced-motion static variant.
- **Route data:** `src/data/globeRoute.ts` gained `dwellMs` per stop — how
  long the light hovers (and the place name reads) at each stop. The whole
  film's timeline is derived from this data: total travel time = a movement
  budget + the sum of every stop's dwell, and every later beat (pull-back,
  hold, taut-dock, photo-develop) is anchored to wherever travel ends. This
  means **adding a country later is one line of data** — the film re-times
  itself automatically.
- **Place names:** each arrival is labelled in the site's small-caps, wide-
  tracking, glowing type voice — fading in on approach, holding while the
  light hovers, releasing as it banks away. This was the last feature added
  and is why the run-time grew from ~10s to ~24s (21 stops named, each
  needing a comfortable read-length pause).
- **States verified in a real browser (Playwright/Chromium), not just typed:**
  first visit (full film), skip (time-compressed to the same docked
  landing, not a jump-cut), returning visit (no film, 600ms hero-rule
  redraw as an echo), reduced motion (static composition + fade), and mobile
  portrait (re-framed camera field, not just scaled down).

## Known trade-off

Naming every one of the 21 stops makes the full run-time ~24 seconds. This
is the main open question before merging — see
[SESSION_HANDOVER.md](../SESSION_HANDOVER.md) → Outstanding work. Options if
it feels too long: trim `dwellMs` values, or only name major stops (skip the
minor waypoints like the sleeper train or individual Chinese cities within
the cluster).

## Verification performed

- `astro check` — 0 errors.
- `astro build` — clean; intro bundle ~12KB of lazy-loaded JS (three.js
  stays lazy inside the hidden-globe overlay only, untouched by this work).
- Manual Playwright pass across all states listed above, screenshots
  reviewed frame-by-frame at each major beat.

## Files touched

- `src/scripts/intro-scene.ts` (new)
- `src/components/IntroSequence.astro` (new)
- `src/data/globeRoute.ts` (added `dwellMs`)
- `src/layouts/BaseLayout.astro` (added a `head` slot for the gate script)
- `src/pages/index.astro` (wired the gate script and `<IntroSequence />`)
