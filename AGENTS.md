# AGENTS.md

This repository hosts haxlys's collection of [Agent Skills](https://agentskills.io/specification) — reusable, agent-agnostic skill packs that work across Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor, and other compatible tools.

## Layout

- `skills/` — single source of truth. Each subdirectory is one skill (`SKILL.md` + optional `references/`, `scripts/`, `assets/`).
- `vendored/` — external skills copied in via `git subtree` when local control is required (with `.upstream-sha` for sync tracking).
- `.claude-plugin/marketplace.json` — Claude Code marketplace catalog. Local entries MUST point at `./skills/<name>`; trusted upstream repos may remain URL references.
- `scripts/` — maintenance checks and generators that keep `skills/`, `vendored/`, README, and the marketplace manifest aligned.
- `.github/workflows/` — `validate-skills.yml` enforces frontmatter/layout checks; `sync-vendored.yml` opens weekly PRs when vendored upstreams change.

## Conventions

- All `SKILL.md` files MUST validate against the [agentskills.io specification](https://agentskills.io/specification).
- Self-authored skills: `metadata.author: haxlys`, `license: MIT`, semver `metadata.version`.
- Vendored skills: original `LICENSE` and frontmatter preserved; original attribution recorded in `NOTICE`.
- Skill `name` field MUST equal the parent directory name (lowercase, hyphens, ≤64 chars).
- `description` should front-load trigger keywords so agents activate the skill on the right cues.

## Commands

```bash
# Validate all skill frontmatter and local skill names
node scripts/validate-skill-frontmatter.mjs

# Regenerate local installable skills from vendored upstream snapshots
node scripts/sync-skills-from-vendored.mjs

# Check that skills/, marketplace.json, and README agree
node scripts/sync-skills-from-vendored.mjs --check
node scripts/validate-marketplace.mjs

# Manually sync a vendored upstream
git subtree pull --prefix=vendored/<name> <name> main --squash
```

## Compatibility

| Platform        | Native SKILL.md | Manifest |
|-----------------|-----------------|----------|
| Claude Code     | ✅              | `.claude-plugin/marketplace.json` |
| Codex CLI       | ✅              | (auto-discovered from `skills/`) |
| Gemini CLI      | ✅              | (extension or symlink into `~/.gemini/extensions/`) |
| GitHub Copilot  | ✅              | (VS Code agent skills) |
| Cursor          | manual          | converted to `.cursor/rules/*.mdc` (build script TBD) |
