# Session Handover

_Last updated: 2026-07-04_

## Where things stand

- **`main`** is at the pre-intro state: Prototype P1 (static hero, left nav,
  month index, hidden globe) plus the documentation restructure described
  below. No uncommitted changes should be left on `main` once this
  restructure is committed.
- **`feature/intro-the-line`** carries a complete, verified first-visit
  cinematic intro (see [sprints/SPRINT_001_THE_LINE.md](sprints/SPRINT_001_THE_LINE.md)
  for the full build record). It is deliberately **not merged yet** —
  functionally done, but pacing (~24s full run-time) needs a final sign-off
  before it goes live.
- **`feature/hidden-globe`** and **`prototype/blog-post-overlay`** are older
  branches from earlier prototype work; check `git log` on each before
  assuming their status.
- Documentation just moved from a single `CLAUDE.md`/`AGENTS.md` pair into
  this `docs/` folder (see [DECISIONS.md](DECISIONS.md), 2026-07-04 entry).
  `CLAUDE.md` and `AGENTS.md` are now short pointers into
  [README.md](README.md).

## Current sprint

None active. The last completed sprint was
[SPRINT_001_THE_LINE](sprints/SPRINT_001_THE_LINE.md) (the first-visit
intro), which is built and verified but parked on its branch pending the
pacing decision above.

## Outstanding work

1. **Decide on `feature/intro-the-line`** — watch it end-to-end, decide if
   ~24s (with a name-per-stop pause) is right, or whether to trim `dwellMs`
   values / name only major stops, then merge.
2. See [ROADMAP.md](ROADMAP.md) → Technical Backlog for the rest of the
   open items (SEO baseline, content collections, CI type-checking,
   responsive verification, etc.) — none are currently in progress.

## Next recommended task

Watch the intro branch (`git checkout feature/intro-the-line`, then
`astro dev --background`) and make the merge-or-adjust call on pacing. Once
that's resolved, the technical backlog in [ROADMAP.md](ROADMAP.md) is the
next source of work.
