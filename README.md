# haxlys/skills

A curated marketplace of [Agent Skills](https://agentskills.io/specification) — reusable workflow packs for AI coding agents.

Cross-platform by design: works with **Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor**, and any tool that follows the [SKILL.md open standard](https://agentskills.io/specification).

## Install (Claude Code)

```bash
# Add the marketplace
/plugin marketplace add haxlys/skills

# Install whatever you need (see Catalog below)
/plugin install web-design-reviewer@haxlys-skills
/plugin install web-component-design@haxlys-skills
/plugin install react-performance@haxlys-skills
/plugin install agent-browser@haxlys-skills        # bundles electron/slack/sandbox/agentcore/dogfood sub-skills
/plugin install superpowers@haxlys-skills          # references obra/superpowers
```

## Catalog

### Local installable skills

`skills/` is the single source of truth for local installable skills. Claude Code,
Codex, Gemini, Copilot, and other `SKILL.md` consumers should read these paths.

| Skill | Category | Source | Description |
|-------|----------|--------|-------------|
| [web-design-reviewer](skills/web-design-reviewer) | frontend | curated upstream | Visual inspection of websites to identify and fix design issues |
| [web-component-design](skills/web-component-design) | frontend | curated upstream | React, Vue, and Svelte component patterns |
| [react-doctor](skills/react-doctor) | frontend | curated upstream | React security, performance, correctness, and architecture diagnostics |
| [react-performance](skills/react-performance) | frontend | self-authored | Modern React performance review workflow based on Sethi's 2026 guidance |
| [agent-browser](skills/agent-browser) | browser automation | curated upstream | Browser automation CLI for AI agents |

**`agent-browser` bundles 5 specialized sub-skills** loaded on demand via the CLI, not separately installable as Claude plugins:

| Sub-skill | Use for | CLI command |
|-----------|---------|-------------|
| `electron`        | Electron desktop apps (VS Code, Slack, Discord, Figma, …) | `agent-browser skills get electron` |
| `slack`           | Slack workspace automation                                | `agent-browser skills get slack` |
| `vercel-sandbox`  | Run agent-browser inside Vercel Sandbox microVMs          | `agent-browser skills get vercel-sandbox` |
| `agentcore`       | Run on AWS Bedrock AgentCore cloud browsers               | `agent-browser skills get agentcore` |
| `dogfood`         | Exploratory testing / QA / bug hunts                      | `agent-browser skills get dogfood` |

### Referenced upstream

Resolved at install time from upstream. These entries remain URL references in
`.claude-plugin/marketplace.json` and do not have local `skills/` directories.

| Skill | Upstream | License |
|-------|----------|---------|
| superpowers | [obra/superpowers](https://github.com/obra/superpowers) | MIT |
| understand-anything | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | MIT |

### External skills NOT in this marketplace

Used by the AEREN team but cannot be redistributed (upstream lacks LICENSE) and cannot be referenced via Claude marketplace (upstream lacks plugin.json). Install upstream directly:

- **web-design-guidelines** — [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)
- **find-skills** — [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)

See [`NOTICE`](NOTICE) for full attribution, pinned SHAs, and skipped-skill rationale.

## Repository structure

```
skills/                          # SSOT - local installable skills
.claude-plugin/marketplace.json  # Claude Code catalog; local sources point to ./skills/*
.github/workflows/
  validate-skills.yml            # Spec compliance gate
scripts/
  validate-skill-frontmatter.mjs   # Checks SKILL.md frontmatter and local names
  validate-marketplace.mjs        # Checks manifest, skills, and README alignment
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

**Curating an upstream skill locally:**
1. Add the installable skill directly under `skills/<name>/`.
2. Preserve upstream attribution in `NOTICE` and plugin metadata.
3. Add an entry to `.claude-plugin/marketplace.json` with `source: ./skills/<name>`.
4. Validate with `node scripts/validate-skill-frontmatter.mjs` and `node scripts/validate-marketplace.mjs`.

## License

MIT (self-authored skills). Curated upstream skills retain their original licenses — see [`NOTICE`](NOTICE).
