# Session Handover

_Last updated: 2026-07-09_

## Where things stand

**"The Line" is merged into `main`, pushed, and live in production**, in
cut-down form. Real visitors see only the short return-visit echo — a black
hold, a bright line drawn at the hero rule's position with a pronounced
brighten, a held beat, then (as of 2026-07-09) a **right-to-left retraction
that mirrors the draw-on in reverse** — handing off into the same docking
stagger the full film's ending uses. Every visit, not just return visits.
Controlled by `introMode: 'echo-only'` in `src/data/introConfig.ts`.

- **The full ~24s journey film is still dormant, not removed.** Its code
  (canvas scene, route data, first-visit choreography) is untouched —
  `src/scripts/intro-scene.ts` hasn't changed since it was first written
  (2026-07-04). Reachable for QA via `?intro=full`. Flipping back to
  `introMode: 'full-first-then-echo'` is still a one-line change once it's
  ready.
- **`feature/intro-descent`** — photoreal Blender-rendered cloud-descent
  film, still parked at motion-preview stage, unaffected by any of the
  above. Record: [sprints/SPRINT_002_DESCENT.md](sprints/SPRINT_002_DESCENT.md).
- **Since the last handover (2026-07-05), five more things shipped**, all on
  `main` and deployed:
  1. A charcoal edge-wash softening the hero's left and top seams (2026-07-06).
  2. A transient GitHub Pages deploy failure cleared, and the underlying
     custom-domain-verification-lapse gotcha properly documented in
     [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) (2026-07-06).
  3. The reading overlay's close redesigned to use the intro's own docking
     grammar (collapse to a line, travel into the hero CTA's rule) instead
     of a plain fade (2026-07-06).
  4. The echo's ending reworked into the mirrored retraction described above,
     at the owner's specific request — verified frame-by-frame against the
     dev server with Playwright, committed, pushed, and confirmed deployed
     via the GitHub Actions API rather than assumed (2026-07-09).
  5. `PROJECT_CHARTER.md`'s Current Status entry for the intro was corrected
     to match — it still described the pre-pivot, first-visit-only design.

See [DECISIONS.md](DECISIONS.md) for the full detail on all of the above.

## Current sprint

No `SPRINT_003` — correcting a stale claim from the last handover rather
than continuing it: **nothing has actually touched the full journey film's
code across the last several sessions.** `intro-scene.ts` hasn't changed
since 2026-07-04. The real pattern of recent work has been general hero/UI
polish, deploy reliability, and refining the *echo* — not the full film.
The "polish the full film, then flip `introMode` back" goal from the
previous handover was never acted on. Flagging this explicitly rather than
carrying it forward as if it were in progress.

## Outstanding work

1. Decide whether full-film polish is actually still the priority, or
   whether continued echo/hero polish (the actual pattern of the last two
   sessions) is where focus should stay. Either is legitimate — the
   documentation just shouldn't claim one while the other is happening.
2. If full-film polish is still wanted: it needs the owner's "couple of
   bits" (unspecified in prior sessions — ask what they are) before
   `introMode` flips back and the `?intro=` QA override is reconsidered.
3. [ROADMAP.md](ROADMAP.md) → Technical Backlog for everything else (SEO
   baseline, content collections, CI type-checking, responsive pass).

## Next recommended task

Confirm with the owner: full-film polish, or continue in the current vein
(echo/hero/UI refinement)? Don't default to either without asking — the
last handover defaulted to "full-film polish" and that turned out not to be
what actually happened.
