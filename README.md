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
/plugin install hermes-tweet@haxlys-skills         # references Xquik-dev/hermes-tweet
```

## Catalog

### Local installable skills

`skills/` is the single source of truth for local installable skills. Claude Code,
Codex, Gemini, Copilot, and other `SKILL.md` consumers should read these paths.

| Skill | Category | Source | Description |
|-------|----------|--------|-------------|
| [web-design-reviewer](skills/web-design-reviewer) | frontend | vendored | Visual inspection of websites to identify and fix design issues |
| [web-component-design](skills/web-component-design) | frontend | vendored | React, Vue, and Svelte component patterns |
| [react-doctor](skills/react-doctor) | frontend | vendored | React security, performance, correctness, and architecture diagnostics |
| [react-performance](skills/react-performance) | frontend | self-authored | Modern React performance review workflow based on Sethi's 2026 guidance |
| [agent-browser](skills/agent-browser) | browser automation | vendored | Browser automation CLI for AI agents |

### Vendored upstream snapshots

`vendored/` stores upstream snapshots used to generate selected `skills/`
entries. They are pinned to a specific upstream commit; weekly cron opens a PR
when upstream advances.

| Plugin | Upstream | License |
|--------|----------|---------|
| [web-design-reviewer](vendored/web-design-reviewer) | [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/web-design-reviewer) | MIT |
| [web-component-design](vendored/wshobson-agents/plugins/ui-design/skills/web-component-design) | [wshobson/agents](https://github.com/wshobson/agents) | MIT |
| [agent-browser](vendored/agent-browser/skills/agent-browser) | [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | Apache-2.0 |
| [react-doctor](vendored/react-doctor/skills/react-doctor) | [millionco/react-doctor](https://github.com/millionco/react-doctor) | MIT |

**`agent-browser` bundles 5 specialized sub-skills** loaded on demand via the CLI, not separately installable as Claude plugins:

| Sub-skill | Use for | CLI command |
|-----------|---------|-------------|
| `electron`        | Electron desktop apps (VS Code, Slack, Discord, Figma, …) | `agent-browser skills get electron` |
| `slack`           | Slack workspace automation                                | `agent-browser skills get slack` |
| `vercel-sandbox`  | Run agent-browser inside Vercel Sandbox microVMs          | `agent-browser skills get vercel-sandbox` |
| `agentcore`       | Run on AWS Bedrock AgentCore cloud browsers               | `agent-browser skills get agentcore` |
| `dogfood`         | Exploratory testing / QA / bug hunts                      | `agent-browser skills get dogfood` |

### Referenced upstream (no vendoring)

Resolved at install time from upstream. These entries remain URL references in
`.claude-plugin/marketplace.json` and do not have local `skills/` directories.

| Skill | Upstream | License |
|-------|----------|---------|
| superpowers | [obra/superpowers](https://github.com/obra/superpowers) | MIT |
| understand-anything | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | MIT |
| hermes-tweet | [Xquik-dev/hermes-tweet](https://github.com/Xquik-dev/hermes-tweet) | MIT |

### External skills NOT in this marketplace

Used by the AEREN team but cannot be redistributed (upstream lacks LICENSE) and cannot be referenced via Claude marketplace (upstream lacks plugin.json). Install upstream directly:

- **web-design-guidelines** — [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)
- **find-skills** — [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)

See [`NOTICE`](NOTICE) for full attribution, pinned SHAs, and skipped-skill rationale.

## Repository structure

```
skills/                          # SSOT - local installable skills
vendored/                        # Upstream snapshots copied via git subtree
.claude-plugin/marketplace.json  # Claude Code catalog; local sources point to ./skills/*
.github/workflows/
  validate-skills.yml            # Spec compliance gate
  sync-vendored.yml              # Weekly upstream PR for vendored entries
scripts/
  sync-skills-from-vendored.mjs   # Regenerates skills/* from vendored sources
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

**Vendoring an external skill:**
1. Copy upstream into `vendored/<name>/`, preserve the original SKILL.md and add `metadata.upstream`/`metadata.upstream-license`/`metadata.upstream-sha`.
2. Record the synced SHA in `vendored/<name>/.upstream-sha`.
3. Add or update the mapping in `scripts/sync-skills-from-vendored.mjs`.
4. Run `node scripts/sync-skills-from-vendored.mjs` so `skills/<name>` is regenerated from the vendored source.
5. Add an entry to `NOTICE` (Vendored table) with date + SHA.
6. Add the skill to `.github/workflows/sync-vendored.yml` matrix so weekly PRs are opened on upstream changes.
7. Validate with `node scripts/validate-marketplace.mjs` and `node scripts/sync-skills-from-vendored.mjs --check`.

## License

MIT (self-authored skills). Vendored skills retain their original licenses — see [`NOTICE`](NOTICE).
