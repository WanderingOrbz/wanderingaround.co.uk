# Creative Direction

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

## Palette & Type Voice

Sampled from the shipped design reference (`src/styles/global.css`):

- **Palette** — dark charcoal / steel / stone / warm white. `--color-bg`
  (`#0c0c0d`), `--color-surface` (`#131314`), `--color-stone` (`#46474a`),
  `--color-text` (`#f2efe8`), `--color-text-muted` (`#9b9892`). No bright or
  saturated colour anywhere in the interface.
- **Type** — system sans stack, weight 300 base. Two tracking scales:
  `--tracking-title` (0.04em, for headings) and `--tracking-label` (0.18em,
  for uppercase labels/nav). Small caps with generous letterspacing is the
  house voice for labels, captions, and place names.
- **Motion** — one shared easing curve, `--ease-calm`
  (`cubic-bezier(0.4, 0, 0.2, 1)`), and two duration tokens: `--duration-fade`
  (600ms) and `--duration-hover` (200ms). New motion work should reuse these
  rather than inventing new curves, so everything on the site moves with the
  same hand.

Design tokens beyond this (a fuller type scale, spacing scale, breakpoints)
are deferred — see [ROADMAP.md](ROADMAP.md) → Deferred.

---

## Notes

Update this document when the visual language changes materially — a new
token, a new motion primitive, a shift in what the interface is trying to
feel like. Day-to-day component styling doesn't need an entry here; only
decisions that should bind future work.
