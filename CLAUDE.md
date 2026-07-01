## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

---

# WanderingAround Project Instructions

## Project Purpose

This repository contains the source code for WanderingAround.co.uk.

The first public release is a premium static travel archive that faithfully preserves an existing Blogger travel journal.

The long-term vision is for WanderingAround.co.uk to become the home of the WanderingAround brand, with future sections such as Photography, Galleries and other creative projects.

---

## Core Principles

Always build with these priorities:

1. User experience over technology.
2. Content over interface.
3. Simplicity over complexity.
4. Quality over speed.
5. Long-term maintainability over short-term convenience.

---

## Design Philosophy

The website should feel:

- Premium
- Minimal
- Timeless
- Calm
- Elegant
- Spacious
- Professional

Avoid:

- Busy layouts
- Trend-driven design
- Excessive animation
- Bright colours
- Unnecessary visual effects

Motion should always support the story rather than distract from it.

---

## Content Philosophy

The photography and journal entries are the heroes.

The interface should frame the content rather than compete with it.

Some journal entries may contain:

- Images only
- Text only
- Images with text

All layouts should accommodate these naturally.

---

## Navigation

Navigation is one of the defining features of the experience.

Visitors should always understand:

- Where they are
- How they arrived there
- Where they can explore next

Prefer elegant, intuitive navigation over traditional blog menus.

---

## Migration Rules

The original Blogger archive is the source of truth.

Always preserve:

- Dates
- Titles
- Chronology
- Images
- Original wording

Do not rewrite, modernise or embellish the original content.

---

## Content Architecture

Journal entries are managed as an Astro Content Collection.

Each entry's frontmatter should capture, at minimum:

- `title`
- `date` (the original Blogger publish date)
- `images` (ordered list)
- `slug` (stable, derived from the original Blogger URL where possible)

Co-locate each entry's images with its content where practical.

Future collections (Photography, Galleries, etc.) should follow the same pattern: dated, image-aware, schema-validated via `astro:content`.

---

## Image Guidelines

Use Astro's built-in `<Image />` / `astro:assets` for content images — never a raw `<img src="/public/...">`.

Every image requires descriptive alt text. For migrated journal photos, derive it from the original caption where one exists; otherwise describe the scene.

Prefer modern formats (WebP/AVIF) and let Astro handle responsive sizing — don't hand-roll `srcset`.

---

## SEO Baseline

Every page needs a unique `<title>` and meta description.

Add Open Graph tags (title, description, image) for journal entries and key pages.

Maintain a sitemap and `robots.txt` once the site has more than the landing page.

Use canonical URLs; the production domain is `https://wanderingaround.co.uk`.

---

## Accessibility Standard

Target WCAG 2.1 AA.

- All images require alt text (see Image Guidelines).
- Text and UI must meet AA contrast ratios against backgrounds, including over photography.
- All interactive elements must be keyboard-reachable with a visible focus state.
- Don't rely on colour alone to convey information.

---

## Development Principles

Prefer:

- Astro native features
- Static generation
- Reusable components
- Semantic HTML
- Modern CSS
- Accessibility by default

Avoid unnecessary dependencies.

Before implementing significant features, explain the proposed approach and any important trade-offs.

If there are multiple good solutions, recommend the one that best balances simplicity, maintainability and user experience.

---

## Verification

Before calling a task complete:

- Run `astro check` (TypeScript strict mode is enabled) and resolve errors.
- Run `astro build` for anything touching routing, content collections, or config.
- View the result in a browser — this is a visually-driven site, so "it compiles" does not mean "it looks right."

---

## Commit Conventions

Write commit messages in the imperative mood, describing why a change was made, not just what changed (e.g. `Add responsive hero image to reduce LCP`, not `Test update`).

Keep commits scoped to one logical change.

---

## Roadmap & Status

`PROJECT-CHARTER.md` tracks the project roadmap and current milestone status.

Check it before starting new work, and update its "Current Status" section when a milestone is completed.

---

## Sensitive Areas

Treat the following as high blast-radius — explain the change and confirm before editing:

- `.github/workflows/deploy.yml` (production deployment)
- Cloudflare DNS configuration (managed outside this repo, but referenced by it)
- `public/CNAME` (must always contain exactly `wanderingaround.co.uk` — see Known Gotchas below)

---

## Known Gotchas

**Renaming the GitHub account/repo silently breaks Pages.** On 2026-07-01, renaming
the GitHub owner (`wanderingorbz` → `WanderingOrbz`) reset the repo's Pages config:
the build source flipped back to the legacy "Deploy from a branch" (Jekyll) default
instead of "GitHub Actions", and the custom domain (`cname`) was cleared entirely.
The old deployment kept serving from cache for a while, so the outage wasn't visible
until the next push triggered a fresh (failing) deploy.

If `wanderingaround.co.uk` 404s with GitHub's "There isn't a GitHub Pages site here"
page after any account/org rename or transfer:

1. Check `github.com/<owner>/wanderingaround.co.uk/settings/pages` → **Build and
   deployment → Source** is set to **"GitHub Actions"**, not "Deploy from a branch".
2. Check the **Custom domain** field still shows `wanderingaround.co.uk`.
3. Re-run the `Deploy to GitHub Pages` workflow (`workflow_dispatch`) once both are
   correct.

`public/CNAME` (committed to the repo) makes step 2 self-healing on every successful
deploy — GitHub Pages re-reads it from the published artifact and re-applies the
custom domain — but step 1 (the build source toggle) has no in-repo equivalent and
must be fixed manually in Settings if it ever resets again.

---

## Available Tooling

Context7 MCP is available for current framework documentation (Astro, etc.) — prefer it over relying on training data for anything version-specific.

GitHub MCP is available for repository operations (issues, PRs).