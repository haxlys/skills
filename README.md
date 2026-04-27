# haxlys/skills

A curated marketplace of [Agent Skills](https://agentskills.io/specification) — reusable workflow packs for AI coding agents.

Cross-platform by design: works with **Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor**, and any tool that follows the [SKILL.md open standard](https://agentskills.io/specification).

## Install (Claude Code)

```bash
# Add the marketplace
/plugin marketplace add haxlys/skills

# Install individual plugins
/plugin install web-design-reviewer@haxlys-skills
/plugin install agent-browser@haxlys-skills
/plugin install dogfood@haxlys-skills
# ...etc — see Catalog below
```

## Catalog

### Self-authored

| Skill | Category | Description |
|-------|----------|-------------|
| _(none yet)_ |  |  |

### Vendored (copied + tracked)

Pinned to a specific upstream commit; weekly cron opens a PR when upstream advances.

| Skill | Upstream | License |
|-------|----------|---------|
| [web-design-reviewer](vendored/web-design-reviewer) | [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/web-design-reviewer) | MIT |
| [web-component-design](vendored/wshobson-agents/plugins/ui-design/skills/web-component-design) | [wshobson/agents](https://github.com/wshobson/agents) | MIT |
| [agent-browser](vendored/agent-browser/skills/agent-browser) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |
| [electron](vendored/agent-browser/skill-data/electron) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |
| [slack](vendored/agent-browser/skill-data/slack) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |
| [vercel-sandbox](vendored/agent-browser/skill-data/vercel-sandbox) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |
| [agentcore](vendored/agent-browser/skill-data/agentcore) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |
| [dogfood](vendored/agent-browser/skill-data/dogfood) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |

### Referenced upstream (no vendoring)

Resolved at install time from upstream — always latest.

| Skill | Upstream | License |
|-------|----------|---------|
| superpowers | [obra/superpowers](https://github.com/obra/superpowers) | MIT |

### External skills NOT in this marketplace

Used by the AEREN team but cannot be redistributed (upstream lacks LICENSE) and cannot be referenced via Claude marketplace (upstream lacks plugin.json). Install upstream directly:

- **web-design-guidelines** — [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)
- **find-skills** — [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)

See [`NOTICE`](NOTICE) for full attribution, pinned SHAs, and skipped-skill rationale.

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

**Self-authored:**
1. Create `skills/<name>/SKILL.md` (agentskills.io spec) + `skills/<name>/.claude-plugin/plugin.json` (Claude Code).
2. Add an entry to `.claude-plugin/marketplace.json` with `source: ./skills/<name>`.
3. Validate locally: `claude plugin validate skills/<name>` and `claude plugin validate .`.
4. Open a PR. CI runs the same checks.

**Vendoring an external skill:**
1. Copy upstream into `vendored/<name>/`, preserve the original SKILL.md and add `metadata.upstream`/`metadata.upstream-license`/`metadata.upstream-sha`.
2. Record the synced SHA in `vendored/<name>/.upstream-sha`.
3. Add an entry to `NOTICE` (Vendored table) with date + SHA.
4. Add the skill to `.github/workflows/sync-vendored.yml` matrix so weekly PRs are opened on upstream changes.

## License

MIT (self-authored skills). Vendored skills retain their original licenses — see [`NOTICE`](NOTICE).
