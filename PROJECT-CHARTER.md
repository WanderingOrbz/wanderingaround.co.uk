# Wandering Around — Project Charter

## Vision

A modern travel website built with Astro to preserve years of travel memories while becoming a long-term platform for blogs, photography and future travel content.

---

## Current Version

v0.1.1

---

## Current Status

### Completed

- Astro project created
- Git repository configured
- GitHub repository connected
- GitHub Actions deployment working
- GitHub Pages deployed
- Cloudflare DNS configured
- Animated hero landing page (looping video background) shipped
- `CLAUDE.md` / `AGENTS.md` expanded with project-specific development guardrails

### In Progress

- v0.2 — responsive layout not yet verified across breakpoints; the original "professional background image" goal was superseded by a video hero

---

## Milestones

### v0.2 — In Progress

- [x] Animated landing page (video hero)
- [~] Professional background image — superseded by video; revisit only if a static poster/fallback image is still wanted
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

- Set up Astro Content Collections for journal entries per the Content Architecture schema (`title`, `date`, `images`, `slug`)
- Add SEO baseline: per-page meta description, Open Graph tags, sitemap, `robots.txt`
- Add `astro check` (type-checking) to the CI workflow — `deploy.yml` currently only builds and deploys
- Verify responsive layout across breakpoints for the hero page
- Update `README.md` — still the default Astro starter content, not project-specific
- Update the `origin` git remote URL to the new GitHub casing (`WanderingOrbz`) to clear the "repository moved" warning on push
- Run an accessibility pass against the WCAG 2.1 AA bar once more pages exist

---

## Deferred

- **Design tokens** (colour palette, type scale, spacing scale, breakpoints) — deferred 2026-06-30 during the CLAUDE.md guardrail rollout. Revisit once enough pages exist to extract real patterns rather than guessing upfront.
- **Blogger migration edge-case policy** (broken embedded links, low-res originals, inline HTML quirks, watermarks) — deferred 2026-06-30. Revisit immediately before v0.4 migration work begins.

---

## Decision Log

- **2026-06-28** — Scaffolded the project with the Astro minimal starter template.
- **2026-06-28** — Chose GitHub Pages + GitHub Actions (`withastro/action`) for hosting and CI deployment.
- **2026-06-28** — Configured Cloudflare for DNS on the custom domain.
- **2026-06-28** — Adopted a hardlinked `CLAUDE.md` / `AGENTS.md` pair so different agent tools share one instruction source without manual syncing.
- **2026-06-28 to 2026-06-29** — Iterated the landing page hero from a static background image to a looping video background.
- **2026-06-30** — Reviewed `CLAUDE.md` and expanded it with concrete guardrails: content architecture, image handling, SEO baseline, accessibility standard, verification steps, commit conventions, roadmap linkage, sensitive-areas flagging, and available tooling. Design tokens and the Blogger migration edge-case policy were explicitly deferred to keep the rollout focused.
- **2026-06-30** — Renamed `PROJECT.md` to `PROJECT-CHARTER.md` for naming consistency.
- **2026-06-30** — Installed Context7 MCP and GitHub MCP (Docker-based, OAuth) in the development environment to support up-to-date framework lookups and repository operations.

---

## Notes

This document is the canonical project charter. Update **Current Status** when a milestone completes, and append a new **Decision Log** entry whenever a significant decision is made (see `CLAUDE.md` → Roadmap & Status).
