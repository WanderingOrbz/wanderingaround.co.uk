# Decision Log

Append-only. Never rewrite past entries — add new ones. Each entry: date,
decision, and (where it isn't obvious) the reason.

- **2026-06-28** — Scaffolded the project with the Astro minimal starter
  template.
- **2026-06-28** — Chose GitHub Pages + GitHub Actions (`withastro/action`)
  for hosting and CI deployment.
- **2026-06-28** — Configured Cloudflare for DNS on the custom domain.
- **2026-06-28** — Adopted a hardlinked `CLAUDE.md` / `AGENTS.md` pair so
  different agent tools share one instruction source without manual syncing.
- **2026-06-28 to 2026-06-29** — Iterated the landing page hero from a
  static background image to a looping video background.
- **2026-06-30** — Reviewed `CLAUDE.md` and expanded it with concrete
  guardrails: content architecture, image handling, SEO baseline,
  accessibility standard, verification steps, commit conventions, roadmap
  linkage, sensitive-areas flagging, and available tooling. Design tokens
  and the Blogger migration edge-case policy were explicitly deferred to
  keep the rollout focused.
- **2026-06-30** — Renamed `PROJECT.md` to `PROJECT-CHARTER.md` for naming
  consistency.
- **2026-06-30** — Installed Context7 MCP and GitHub MCP (Docker-based,
  OAuth) in the development environment to support up-to-date framework
  lookups and repository operations.
- **2026-06-30** — Shipped Prototype P1 (Version 1.1 visual prototype) live
  to production: static hero image (replacing the earlier video), left
  navigation, "explore by month" index, and full chrome bar. All navigation
  links, the menu toggle, and the month index are intentionally inert
  placeholders — visual foundation only, no real routing yet. Mobile
  received a temporary, simplified layout (hero text centred, nav
  rearranged into a 3/2 grid, month index hidden by default) rather than a
  full mobile design pass, to unblock review before further iteration.
- **2026-07-01** — Renaming the GitHub account/repo (`wanderingorbz` →
  `WanderingOrbz`) was found to silently reset the Pages build source and
  clear the custom domain. Documented as a known gotcha (see
  [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)) rather than
  worked around, since the reset happens on GitHub's side and has no
  in-repo fix beyond `public/CNAME` self-healing the domain field.
- **2026-07-04** — Built a first-visit cinematic intro ("The Line") on
  `feature/intro-the-line`: a point of light draws the real journey route
  (from `globeRoute.ts`), naming each stop as it hovers there, pulls back to
  reveal the whole trip, then is pulled taut into the hero's rule as the
  homepage develops through. Kept on its own branch rather than merged
  immediately, pending a decision on pacing (~24s full run-time once every
  stop is named) — see
  [sprints/SPRINT_001_THE_LINE.md](sprints/SPRINT_001_THE_LINE.md).
- **2026-07-04** — Chose **offline CGI in Blender** as the production route
  for the "Descent" intro concept (photoreal volumetrics rendered once,
  delivered as a small video) over real-time WebGL shaders — the only route
  that delivers genuine photorealism without breaking the performance
  budget on mobile. Ending re-graded from the original whiteout to dusk, so
  the film lands on the site's charcoal. Replay policy: full film first
  visit, short dark-mist echo on returns, all behind one config switch.
- **2026-07-04** — Restructured project documentation from a single
  `CLAUDE.md`/`AGENTS.md` pair into a `docs/` folder split by concern
  (charter, roadmap, creative direction, reference board, technical
  architecture, coding standards, AI workflow, decisions, sprints), with
  `CLAUDE.md`/`AGENTS.md` reduced to a pointer into `docs/README.md`. Chosen
  over keeping one growing file so each concern can be read (and updated)
  independently as the project grows past the landing page.
- **2026-07-05** — **Pivoted away from both built intro concepts** before
  merging either. "The Line" (`feature/intro-the-line`) and "Descent"
  (`feature/intro-descent`, parked at motion-preview stage) both remain on
  their branches as complete, resumable bodies of work; a third and final
  intro concept is to be briefed. Decision recorded so future sessions
  don't mistake the parked branches for abandoned or mergeable work.
- **2026-07-05** — Built a fuller return-visit echo for "The Line": instead
  of the original barely-visible 600ms rule redraw, return visitors now get
  the same black curtain as the full film, a bright line drawn at the hero
  rule's exact position (standing in for the canvas line's landing), then a
  handoff into the film's own docking stagger — the whole hero
  content/chrome/nav reveal exactly as they do at the end of a first visit,
  just reached via a short hold instead of the full journey. Iterated twice
  on timing/feel (slower line-draw, a gentler curtain fade instead of an
  instant cut) before sign-off.
- **2026-07-05** — **Resolved the intro pivot**: rather than waiting on a
  third concept, shipped a cut-down version of "The Line" — merged
  `feature/intro-the-line` into `main`. Real visitors now see only the
  short return-visit echo above, on every visit, via
  `introMode: 'echo-only'` in `src/data/introConfig.ts`. The full ~24s
  journey film's code (canvas scene, route data, first-visit choreography)
  is untouched and still in the codebase — dormant, reachable for QA via
  `?intro=full` — while it gets further work; switching back to
  `introMode: 'full-first-then-echo'` (full film on first visit, echo on
  return) is a one-line change once it's ready. `feature/intro-descent`
  remains parked, unaffected by this.
