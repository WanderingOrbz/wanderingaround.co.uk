# Documentation Guide

This repository is documentation-driven: the documents in this folder are the
canonical source of project knowledge, and every working session (human or AI)
is expected to read them before making changes.

## Reading order

1. **[SESSION_HANDOVER.md](SESSION_HANDOVER.md)** — where the project is right
   now: current sprint, outstanding work, and the next recommended task.
   Always read first; always update before ending a session.
2. **[PROJECT_CHARTER.md](PROJECT_CHARTER.md)** — vision, current version and
   status. The "what and why" of the whole project.
3. **[ROADMAP.md](ROADMAP.md)** — milestones, technical backlog, and
   deliberately deferred work.
4. **[CREATIVE_DIRECTION.md](CREATIVE_DIRECTION.md)** — how the site should
   feel: design philosophy, palette, typography voice, motion principles.
5. **[REFERENCE_BOARD.md](REFERENCE_BOARD.md)** — the external touchstones and
   mood the design is calibrated against.
6. **[TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)** — stack, repo
   layout, key components, and the deployment pipeline (including its known
   gotchas).
7. **[CODING_STANDARDS.md](CODING_STANDARDS.md)** — development principles,
   content architecture, image/SEO/accessibility standards, commit
   conventions, and sensitive areas.
8. **[AI_WORKFLOW.md](AI_WORKFLOW.md)** — how AI sessions operate in this
   repo: bootstrap, dev server, verification, approval gates, end-of-session
   duties.
9. **[DECISIONS.md](DECISIONS.md)** — the append-only decision log. Skim the
   recent entries; consult older ones when touching related areas.
10. **[sprints/](sprints/)** — one record per sprint of focused work. Read the
    sprint named in SESSION_HANDOVER.md.

## Maintenance rules

- **SESSION_HANDOVER.md** is rewritten at the end of every significant
  session — it describes *now*, not history.
- **DECISIONS.md** is append-only — never rewrite past entries; add new ones.
- **PROJECT_CHARTER.md → Current Status** is updated when a milestone
  completes.
- Sprint documents are updated while their sprint is live, then left as a
  record.
- Everything else changes only when the underlying reality changes.
