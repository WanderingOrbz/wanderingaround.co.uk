# Coding Standards

## Development Principles

Prefer:

- Astro native features
- Static generation
- Reusable components
- Semantic HTML
- Modern CSS
- Accessibility by default

Avoid unnecessary dependencies.

Before implementing significant features, explain the proposed approach and
any important trade-offs.

If there are multiple good solutions, recommend the one that best balances
simplicity, maintainability and user experience.

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

Future collections (Photography, Galleries, etc.) should follow the same
pattern: dated, image-aware, schema-validated via `astro:content`.

---

## Image Guidelines

Use Astro's built-in `<Image />` / `astro:assets` for content images — never
a raw `<img src="/public/...">`.

Every image requires descriptive alt text. For migrated journal photos,
derive it from the original caption where one exists; otherwise describe the
scene.

Prefer modern formats (WebP/AVIF) and let Astro handle responsive sizing —
don't hand-roll `srcset`.

---

## SEO Baseline

Every page needs a unique `<title>` and meta description.

Add Open Graph tags (title, description, image) for journal entries and key
pages.

Maintain a sitemap and `robots.txt` once the site has more than the landing
page.

Use canonical URLs; the production domain is `https://wanderingaround.co.uk`.

---

## Accessibility Standard

Target WCAG 2.1 AA.

- All images require alt text (see Image Guidelines).
- Text and UI must meet AA contrast ratios against backgrounds, including
  over photography.
- All interactive elements must be keyboard-reachable with a visible focus
  state.
- Don't rely on colour alone to convey information.
- Respect `prefers-reduced-motion` for any non-trivial animation (see the
  global kill-switch in `src/styles/global.css`, and the static variant
  pattern used by the first-visit intro on `feature/intro-the-line`).

---

## Commit Conventions

Write commit messages in the imperative mood, describing why a change was
made, not just what changed (e.g. `Add responsive hero image to reduce LCP`,
not `Test update`).

Keep commits scoped to one logical change.
