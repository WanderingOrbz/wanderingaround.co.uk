# Sprint 002 — Descent (cinematic intro candidate #2)

**Branch:** `feature/intro-descent` · **Status:** parked at preview stage
(pivot to a third concept — see [SESSION_HANDOVER.md](../SESSION_HANDOVER.md))

## Goal

A photorealistic ~10.5s opening film: the camera begins inside a bright
cloud deck, falls with real mass, a monochrome fjord resolves below, one
warm terminator light-band sweeps the terrain, and dusk settles the frame
into the homepage's charcoal — where the hero photograph and title develop
out of the dark.

## Key decisions made

- **Production route: offline CGI in Blender** (Cycles, RTX 5070/OptiX) —
  the only path to genuine photorealism that keeps the site's performance
  promise; delivered as a small video, not real-time shaders.
- **Ending re-graded to dusk/dark** rather than the original whiteout, so
  the film dissolves into the site's existing charcoal rather than
  hard-cutting from white to dark.
- **Replay policy:** full film on first visit, ~2s dark-mist "echo" on
  return visits; one config switch (`full-every-visit / full-once-then-echo
  / full-once / off`) plus `?intro=` URL overrides.
- **Landscape identity:** fjord terrain, deliberately the same *kind of
  place* as the existing hero photograph — the film lands where the photo
  was taken.
- Silent (audio possible later).

## What was built (all committed on the branch)

- **Blender scene** (`production/descent/descent-anim-v1.blend`), built
  entirely by script over the MCP bridge: procedural fjord (620² heightfield
  + Cycles adaptive subdivision with true displacement — the step that took
  it from "clay" to "rock"), volumetric cloud deck / valley mist / finite
  haze box, slate + water materials, keyframed 253-frame descent with
  mass-and-flare camera curve, animated cloud churn, warm sweep light, and
  a keyframed dusk grade (sky/sun/exposure) ending near `#0c0c0d`.
- **Look-dev frames** approved by the owner (`production/descent/lookdev/`).
- **Motion preview** (`production/descent/preview/descent-preview-v1.mp4`,
  640×360@24smp) — rendered overnight 2026-07-04→05, ~30min on the 5070.
- **Web overlay** (`src/components/DescentIntro.astro` +
  `src/data/introConfig.ts`): video-driven intro with all four modes, skip
  via playback-rate ramp, reduced-motion poster crossfade, autoplay-failure
  failsafe, and the same hero-develop choreography grammar as The Line.
  Written but **not wired into `index.astro`** — integration paused at the
  pivot.

## Hard-won technical notes (worth keeping regardless of concept)

- A **world-volume scatter kills the sky** in Cycles (infinite path =
  total extinction). Aerial haze must live in a finite box.
- **Bump mapping is invisible at landscape scale** — terrain realism came
  from Cycles experimental **adaptive subdivision + true displacement**
  (dicing rate ~2.5px was safe on 8GB VRAM).
- Noise textures with **no vector input default to Generated (bounding-box)
  space** — on a 12km object, "3m detail" silently becomes 34km blur. Always
  wire Object coordinates on large meshes.
- Volumes need **several volume bounces** (8 used) to glow like real cloud
  instead of rendering as dark slabs; density ~0.005/m with noise-carved
  gaps reads as cloud, 0.09 reads as concrete.
- Preview render economics: 640×360 @ 24smp ≈ 7s/frame on the RTX 5070;
  1080p stills @ 96smp ≈ 1min. A full-quality 253-frame final render is an
  overnight job, not a blocker.

## Where it stopped

Owner watched the motion preview on 2026-07-05 and called a pivot to a new
(final) intro concept before giving notes on the film. Everything above is
committed and resumable: open the .blend, adjust, re-render.
