# haxlys/skills

A curated marketplace of [Agent Skills](https://agentskills.io/specification) — reusable workflow packs for AI coding agents.

Cross-platform by design: works with **Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor**, and any tool that follows the [SKILL.md open standard](https://agentskills.io/specification).

## Install (Claude Code)

```bash
/plugin marketplace add haxlys/skills
/plugin install web-design-reviewer@haxlys-skills
```

## Catalog

### Self-authored

| Skill | Category | Description |
|-------|----------|-------------|
| [web-design-reviewer](skills/web-design-reviewer) | frontend | Visual inspection of websites to identify and fix design issues |

### Referenced upstream

These are referenced directly from the upstream repo (always latest, no vendoring):

| Skill | Upstream | License |
|-------|----------|---------|
| superpowers | [obra/superpowers](https://github.com/obra/superpowers) | MIT |

See [`NOTICE`](NOTICE) for full attribution and version pinning.

## Repository structure

```
skills/                          # SSOT — agentskills.io spec compliant
.claude-plugin/marketplace.json  # Claude Code catalog
vendored/                        # External skills copied via git subtree (when local control needed)
.github/workflows/
  validate-skills.yml            # Spec compliance gate
  sync-vendored.yml              # Weekly upstream PR for vendored entries
AGENTS.md                        # Cross-platform agent guidance
```

## Cross-platform usage

| Platform | How |
|----------|-----|
| Claude Code | `/plugin marketplace add haxlys/skills` |
| Codex CLI | symlink `skills/` into `~/.agents/skills/` |
| Gemini CLI | `gemini extensions install https://github.com/haxlys/skills` |
| GitHub Copilot | install via VS Code agent skills UI |
| Cursor | convert via `scripts/build-cursor-rules.sh` (TBD) |

## Adding a new skill

1. Create `skills/<name>/SKILL.md` following the [spec](https://agentskills.io/specification).
2. Add an entry to `.claude-plugin/marketplace.json`.
3. Run `npx -y @agentskills/skills-ref validate skills/<name>/SKILL.md` locally.
4. Open a PR. CI runs the same validation.

## License

MIT (self-authored skills). Vendored skills retain their original licenses — see [`NOTICE`](NOTICE).
