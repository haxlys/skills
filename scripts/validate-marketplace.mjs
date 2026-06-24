#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const marketplacePath = path.join(root, ".claude-plugin/marketplace.json");
const readmePath = path.join(root, "README.md");

const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
const readme = readFileSync(readmePath, "utf8");
const problems = [];

function fail(message) {
  problems.push(message);
}

for (const plugin of marketplace.plugins ?? []) {
  if (!plugin.name) {
    fail("marketplace plugin is missing name");
    continue;
  }

  if (typeof plugin.source === "string") {
    const expectedSource = `./skills/${plugin.name}`;
    if (plugin.source !== expectedSource) {
      fail(`${plugin.name}: local source must be ${expectedSource}, got ${plugin.source}`);
    }

    const skillDir = path.join(root, plugin.source);
    const skillPath = path.join(skillDir, "SKILL.md");
    const pluginPath = path.join(skillDir, ".claude-plugin/plugin.json");

    if (!existsSync(skillDir)) fail(`${plugin.name}: source directory does not exist`);
    if (!existsSync(skillPath)) fail(`${plugin.name}: SKILL.md is missing`);
    if (!existsSync(pluginPath)) fail(`${plugin.name}: .claude-plugin/plugin.json is missing`);

    if (existsSync(skillPath)) {
      const text = readFileSync(skillPath, "utf8");
      const match = text.match(/^name:\s*["']?([^"'\n]+)["']?/m);
      const declaredName = match?.[1]?.trim();
      if (declaredName !== plugin.name) {
        fail(`${plugin.name}: SKILL.md name '${declaredName ?? "<missing>"}' does not match directory`);
      }
    }

    if (!readme.includes(`skills/${plugin.name}`)) {
      fail(`${plugin.name}: README catalog does not link to skills/${plugin.name}`);
    }
  } else if (plugin.source?.source === "url") {
    if (!plugin.source.url) fail(`${plugin.name}: referenced source is missing url`);
    if (!readme.includes(plugin.name)) {
      fail(`${plugin.name}: README does not mention referenced plugin`);
    }
  } else {
    fail(`${plugin.name}: source must be a local path string or { source: "url", url }`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`::error::${problem}`);
  }
  process.exit(1);
}

console.log("marketplace, skills/, and README are consistent");
