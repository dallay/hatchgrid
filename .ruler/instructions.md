# Ruler Instructions

These are the central AI agent instructions and the single source of truth for automated coding assistants working on the Hatchgrid repository.

## Scope

- All project rules, conventions, architecture notes, security requirements, and agent-specific adapters live under `.ruler/` as individual Markdown files.

- Ruler will concatenate every `*.md` file found in this directory (and subdirectories) and apply the resulting instructions to configured agents.

## What to include in `.ruler/`

- Coding conventions (Kotlin, TypeScript, Vue, Spring Boot, etc.)
- API design and REST endpoint patterns
- Architecture overviews (hexagonal, folder structure, DDD notes)
- Security & OWASP rules and secret-management guidance
- DevOps/CI guidelines (Ruler usage, GitHub Actions, OIDC, caching)
- Small, focused examples and migration notes where needed

## Agent outputs (configured in `.ruler/ruler.toml`)

- GitHub Copilot -> `.github/copilot-instructions.md`
- Gemini CLI -> `GEMINI.md`
- Cursor -> `.cursor/rules/ruler_cursor_instructions.mdc`
- Claude -> `CLAUDE.md`
- Aider -> `ruler_aider_instructions.md` and `.aider.conf.yml`

## Authoritative workflow (for humans and agents)

1. Edit or add a file under `.ruler/` (use a descriptive filename; one topic per file).

2. Run locally to verify generation:

Guidelines for AI assistants

- Always prefer rules found in `.ruler/` over repository-level heuristics or older docs.

- Do not edit `docs/src/content/docs` or `.kiro/` (these were migrated); update `.ruler/` instead.

- When making code changes, follow the project's conventions (linting, tests, Gradle/PNPM commands). If tests or builds are required, run the small validation steps before committing.

- For security-sensitive decisions follow the Security & OWASP file and prefer least-privilege, parameterized queries, no hard-coded secrets, and OIDC where possible.

Maintenance notes

- Keep each topic focused and small. Avoid large monolithic files.

- Always prefer rules found in `.ruler/` over repository-level heuristics or older docs.

- Do not edit `docs/src/content/docs` or `.kiro/` (these were migrated); update `.ruler/` instead.

- When making code changes, follow the project's conventions (linting, tests, Gradle/PNPM commands). If tests or builds are required, run the small validation steps before committing.

- For security-sensitive decisions, follow the Security & OWASP guide under `.ruler/` and prefer least privilege, parameterized queries, no hard-coded secrets, and OIDC where possible.
Last updated: 2025-08-15
