# Session Handover

_Last updated: 2026-07-05_

## Where things stand

**"The Line" is merged into `main` and ready to ship, in cut-down form.**
Real visitors will see only the short return-visit echo — a black hold, a
bright line drawn at the hero rule's position, then a handoff into the same
docking stagger the full film's ending uses — on **every** visit, not just
return visits. This is controlled by `introMode: 'echo-only'` in
`src/data/introConfig.ts`.

- **The full ~24s journey film is dormant, not removed.** Its code (canvas
  scene, route data, first-visit choreography) is untouched in the
  codebase. It isn't shown to real visitors while it gets further work, but
  is reachable for QA via `?intro=full` on any environment. Flipping back
  to `introMode: 'full-first-then-echo'` (full film on first visit, echo on
  return — the original design) is a one-line change once it's ready.
- **`feature/intro-descent`** — photoreal Blender-rendered cloud-descent
  film, still parked at motion-preview stage, unaffected by any of the
  above. Record: [sprints/SPRINT_002_DESCENT.md](sprints/SPRINT_002_DESCENT.md).
- **Not yet pushed to `origin/main`.** Pushing `main` is what triggers the
  live GitHub Pages deploy (`on: push: branches: [main]`, no manual gate) —
  that's a separate, explicit step, not implied by the merge itself.

Older branches `feature/hidden-globe` and `prototype/blog-post-overlay`
predate all of this; check `git log` before assuming their status.

## Current sprint

Polishing the full journey film (owner: "a couple of bits" still to work
on) before flipping `introMode` back to `'full-first-then-echo'`. No
`SPRINT_003` opened — this is a continuation of
[sprints/SPRINT_001_THE_LINE.md](sprints/SPRINT_001_THE_LINE.md), not a new
concept.

## Outstanding work

1. Push `main` to `origin` and confirm the live deploy — explicit owner
   go-ahead required first (see "Where things stand").
2. Finish the outstanding full-film polish, then switch `introMode` back
   and remove/adjust the `?intro=` QA override if no longer needed.
3. [ROADMAP.md](ROADMAP.md) → Technical Backlog for everything else (SEO
   baseline, content collections, CI type-checking, responsive pass).

## Next recommended task

Confirm with the owner whether to push `main` now (goes live immediately)
or hold until specific full-film polish items are further along.
