# Roadmap

## Milestones

### v0.2 — In Progress

- [x] Animated landing page (video hero)
- [~] Professional background image — superseded by video; revisit only if
      a static poster/fallback image is still wanted
- [ ] Responsive layout — needs verification across breakpoints

### v0.3 — Not Started

- [ ] About page

### v0.4 — Not Started

- [ ] Travel blog migration

### v0.5 — Not Started

- [ ] Gallery

### v1.0 — Not Started

- [ ] Production travel website

---

## Technical Backlog

Engineering tasks identified but not yet scheduled to a specific milestone:

- Set up Astro Content Collections for journal entries per the Content
  Architecture schema (`title`, `date`, `images`, `slug`) — see
  [CODING_STANDARDS.md](CODING_STANDARDS.md).
- Add SEO baseline: per-page meta description, Open Graph tags, sitemap,
  `robots.txt`.
- Add `astro check` (type-checking) to the CI workflow — `deploy.yml`
  currently only builds and deploys.
- Verify responsive layout across breakpoints for the hero page.
- Update `README.md` — still the default Astro starter content, not
  project-specific.
- Update the `origin` git remote URL to the new GitHub casing
  (`WanderingOrbz`) to clear the "repository moved" warning on push.
- Run an accessibility pass against the WCAG 2.1 AA bar once more pages
  exist.
- Build the **final homepage intro** (concept pending owner brief). Two
  parked candidates hold reusable parts:
  [sprints/SPRINT_001_THE_LINE.md](sprints/SPRINT_001_THE_LINE.md) and
  [sprints/SPRINT_002_DESCENT.md](sprints/SPRINT_002_DESCENT.md).

---

## Deferred

- **Design tokens** (colour palette, type scale, spacing scale, breakpoints)
  — deferred 2026-06-30 during the CLAUDE.md guardrail rollout. Revisit once
  enough pages exist to extract real patterns rather than guessing upfront.
  A first slice (palette, tracking, motion) is already documented in
  [CREATIVE_DIRECTION.md](CREATIVE_DIRECTION.md).
- **Blogger migration edge-case policy** (broken embedded links, low-res
  originals, inline HTML quirks, watermarks) — deferred 2026-06-30. Revisit
  immediately before v0.4 migration work begins.
