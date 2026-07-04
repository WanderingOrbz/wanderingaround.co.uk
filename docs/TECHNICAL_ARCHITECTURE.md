# Technical Architecture

## Stack

- **Astro 7** — static site generation, no client framework. Pages under
  `src/pages/`, components under `src/components/`, shared layout in
  `src/layouts/BaseLayout.astro`.
- **three.js** — used only inside the hidden-globe overlay
  (`src/components/GlobeOverlay.astro` + `src/scripts/globe-scene.ts`), and
  only dynamically imported when that overlay actually opens. It must never
  be part of the initial page load.
- **TypeScript strict mode** — enabled via `astro/tsconfigs/strict`
  (`tsconfig.json`). `astro check` must pass before any change is considered
  done.
- **No CSS framework** — hand-written CSS using the tokens defined in
  `src/styles/global.css` (see
  [CREATIVE_DIRECTION.md](CREATIVE_DIRECTION.md) → Palette & Type Voice).

## Repository layout

```
src/
  assets/images/       Source images (processed via astro:assets)
  components/          Astro components (Logo, SiteNav, MonthTimeline,
                        PostOverlay, GlobeOverlay, MenuToggle, ...)
  data/                Typed content data (e.g. globeRoute.ts — the route
                        used by both the hidden globe and, on its feature
                        branch, the first-visit intro)
  layouts/              BaseLayout.astro — the single page shell
  pages/                Route entry points (index.astro is the only route
                        so far)
  scripts/              Non-component TS modules, mostly lazy-loaded
                        (globe-scene.ts, and on feature/intro-the-line,
                        intro-scene.ts)
  styles/               global.css — the single shared stylesheet
public/
  textures/earth/       Earth day/specular/clouds maps for the hidden globe
                        (and reused by the intro's terrain reveal)
  images/backgrounds/   Hero video/image assets
  CNAME                 Must always contain exactly wanderingaround.co.uk
```

## Deployment pipeline

GitHub Actions (`.github/workflows/deploy.yml`) builds with `astro build`
and deploys to GitHub Pages on push to `main`. Cloudflare handles DNS for the
custom domain in front of Pages.

### Known gotcha: renaming the GitHub account/repo silently breaks Pages

On 2026-07-01, renaming the GitHub owner (`wanderingorbz` → `WanderingOrbz`)
reset the repo's Pages config: the build source flipped back to the legacy
"Deploy from a branch" (Jekyll) default instead of "GitHub Actions", and the
custom domain (`cname`) was cleared entirely. The old deployment kept
serving from cache for a while, so the outage wasn't visible until the next
push triggered a fresh (failing) deploy.

If `wanderingaround.co.uk` 404s with GitHub's "There isn't a GitHub Pages
site here" page after any account/org rename or transfer:

1. Check `github.com/<owner>/wanderingaround.co.uk/settings/pages` → **Build
   and deployment → Source** is set to **"GitHub Actions"**, not "Deploy
   from a branch".
2. Check the **Custom domain** field still shows `wanderingaround.co.uk`.
3. Re-run the `Deploy to GitHub Pages` workflow (`workflow_dispatch`) once
   both are correct.

`public/CNAME` (committed to the repo) makes step 2 self-healing on every
successful deploy — GitHub Pages re-reads it from the published artifact and
re-applies the custom domain — but step 1 (the build source toggle) has no
in-repo equivalent and must be fixed manually in Settings if it ever resets
again.

## Available tooling

- **Context7 MCP** — current framework documentation (Astro, etc.). Prefer
  it over training data for anything version-specific.
- **GitHub MCP** — repository operations (issues, PRs).

## Sensitive areas

Treat the following as high blast-radius — explain the change and confirm
before editing:

- `.github/workflows/deploy.yml` (production deployment)
- Cloudflare DNS configuration (managed outside this repo, but referenced by
  it)
- `public/CNAME` (must always contain exactly `wanderingaround.co.uk` — see
  the gotcha above)
