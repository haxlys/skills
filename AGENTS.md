# AGENTS.md

This repository hosts haxlys's collection of [Agent Skills](https://agentskills.io/specification) — reusable, agent-agnostic skill packs that work across Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor, and other compatible tools.

## Layout

- `skills/` — single source of truth. Each subdirectory is one skill (`SKILL.md` + optional `references/`, `scripts/`, `assets/`).
- `.claude-plugin/marketplace.json` — Claude Code marketplace catalog. Local entries MUST point at `./skills/<name>`; trusted upstream repos may remain URL references.
- `scripts/` — maintenance checks that keep `skills/`, README, and the marketplace manifest aligned.
- `.github/workflows/` — `validate-skills.yml` enforces frontmatter/layout checks.

## Conventions

- All `SKILL.md` files MUST validate against the [agentskills.io specification](https://agentskills.io/specification).
- Self-authored skills: `metadata.author: haxlys`, `license: MIT`, semver `metadata.version`.
- Curated upstream skills: keep attribution in `NOTICE` and preserve the upstream license in plugin metadata.
- Skill `name` field MUST equal the parent directory name (lowercase, hyphens, ≤64 chars).
- `description` should front-load trigger keywords so agents activate the skill on the right cues.

## Commands

```bash
# Validate all skill frontmatter and local skill names
node scripts/validate-skill-frontmatter.mjs

# Check that skills/, marketplace.json, and README agree
node scripts/validate-marketplace.mjs
```

## Compatibility

| Platform        | Native SKILL.md | Manifest |
|-----------------|-----------------|----------|
| Claude Code     | ✅              | `.claude-plugin/marketplace.json` |
| Codex CLI       | ✅              | (auto-discovered from `skills/`) |
| Gemini CLI      | ✅              | (extension or symlink into `~/.gemini/extensions/`) |
| GitHub Copilot  | ✅              | (VS Code agent skills) |
| Cursor          | manual          | converted to `.cursor/rules/*.mdc` (build script TBD) |
