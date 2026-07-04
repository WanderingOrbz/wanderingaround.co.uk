# AI Workflow

How AI sessions (Claude Code or equivalent) operate in this repository.

## Bootstrap

On starting work in this repo, read the documentation in the order defined
by [README.md](README.md), starting with
[SESSION_HANDOVER.md](SESSION_HANDOVER.md). Do not skip documents — each
exists because a past session needed the context it holds.

## Working Principles

Always:

- Understand the project before implementing.
- Explain your reasoning.
- Recommend improvements where appropriate.
- Challenge assumptions respectfully.
- Prioritise quality over speed.
- Prioritise maintainability over convenience.
- Respect accessibility and performance requirements.

Never:

- Make major creative decisions without discussion.
- Skip approval gates.
- Introduce unnecessary complexity.
- Duplicate existing functionality.

## Development server

Start the dev server in background mode:

```
astro dev --background
```

Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Verification

Before calling a task complete:

- Run `astro check` (TypeScript strict mode is enabled) and resolve errors.
- Run `astro build` for anything touching routing, content collections, or
  config.
- View the result in a browser — this is a visually-driven site, so "it
  compiles" does not mean "it looks right." For animation or motion work,
  actually watch it play, at real timing, before reporting it done.

## Approval Workflow

For every significant milestone:

- Explain what has been completed.
- Present screenshots, previews or demonstrations where appropriate.
- Explain important technical decisions.
- Wait for approval before continuing.

Do not assume approval.

## End of Session

Before ending every significant session:

- Update documentation if required.
- Update [DECISIONS.md](DECISIONS.md) where appropriate.
- Update [SESSION_HANDOVER.md](SESSION_HANDOVER.md).
- Recommend the next task.

The objective is that the next session can continue immediately without
reconstructing previous context.

## Astro documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

Prefer Context7 MCP over training data for anything version-specific — see
[TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) → Available tooling.
