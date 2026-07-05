# Session Handover

_Last updated: 2026-07-05_

## Where things stand

**The project is mid-pivot on the homepage intro.** Two complete intro
candidates are parked on branches, deliberately unmerged, while a third
("final") concept is defined:

- **`feature/intro-the-line`** — canvas-drawn journey-line intro, fully
  built and verified (~24s with per-stop place names). Record:
  [sprints/SPRINT_001_THE_LINE.md](sprints/SPRINT_001_THE_LINE.md).
- **`feature/intro-descent`** — photoreal Blender-rendered cloud-descent
  film, parked at motion-preview stage with the web overlay written but not
  wired in. Record: [sprints/SPRINT_002_DESCENT.md](sprints/SPRINT_002_DESCENT.md).
  Includes reusable Blender pipeline lessons and a working scene file.
- **`main`** — clean; carries the site (Prototype P1) and documentation
  only. No intro is live.

Older branches `feature/hidden-globe` and `prototype/blog-post-overlay`
predate all of this; check `git log` before assuming their status.

## Current sprint

None active. Next sprint will be the **final intro concept** — not yet
specified by the owner. When it starts, open `SPRINT_003_<NAME>.md` and
follow the pattern of the two existing sprint records.

## Outstanding work

1. **Define and build the final intro** (owner is about to brief it).
   Both parked candidates contain reusable parts: The Line's overlay/gate/
   choreography grammar and route data; Descent's Blender pipeline, video
   overlay component and `introConfig.ts` mode switch.
2. [ROADMAP.md](ROADMAP.md) → Technical Backlog for everything else (SEO
   baseline, content collections, CI type-checking, responsive pass).

## Next recommended task

Take the owner's brief for the final intro concept; mine both parked
branches for reusable pieces before building anything new.
