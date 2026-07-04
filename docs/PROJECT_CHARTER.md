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
- **Prototype P1 live** — Version 1.1 visual foundation (static hero image, left nav, month index, mobile layout) deployed to production. Navigation links and the menu toggle are intentionally inert — no real destinations yet. Mobile uses a temporary, simplified layout (centred hero text, 3/2 nav grid, month index hidden) as a placeholder pending dedicated mobile design work (see Decision Log).
- **First-visit cinematic intro ("The Line")** — a ~10s Canvas 2D sequence: a single point of light draws the real journey route (from `globeRoute.ts`) over faintly revealed terrain, pulls back to show the whole trip, then is pulled taut into the hero's rule as the homepage develops in. First visit only (`localStorage` key `wa:intro-seen`), skippable (time-compressed, not jump-cut), static composition under reduced motion, ~9KB of lazy-loaded JS. Returning visits get a 600ms redraw of the hero rule as an echo.

### In Progress

- v0.2 — responsive layout verified across desktop, tablet, and mobile (see Prototype P1 above); mobile's current treatment is a deliberate temporary workaround, not the final design

---

## Milestones & Backlog

Tracked in [ROADMAP.md](ROADMAP.md) — milestones, technical backlog, and
deliberately deferred work.

## Decision Log

Tracked in [DECISIONS.md](DECISIONS.md) — the append-only record of
significant decisions and why they were made.

---

## Notes

This document is the canonical project charter: vision and current status.
Update **Current Status** when a milestone completes; log the decision in
[DECISIONS.md](DECISIONS.md) and update [ROADMAP.md](ROADMAP.md) alongside it
(see [AI_WORKFLOW.md](AI_WORKFLOW.md) → End of Session).
