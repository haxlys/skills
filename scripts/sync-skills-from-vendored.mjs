#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");

const entries = [
  {
    name: "web-design-reviewer",
    source: "vendored/web-design-reviewer",
    target: "skills/web-design-reviewer",
  },
  {
    name: "web-component-design",
    source: "vendored/wshobson-agents/plugins/ui-design/skills/web-component-design",
    target: "skills/web-component-design",
  },
  {
    name: "react-doctor",
    source: "vendored/react-doctor/skills/react-doctor",
    target: "skills/react-doctor",
  },
  {
    name: "agent-browser",
    source: "vendored/agent-browser/skills/agent-browser",
    target: "skills/agent-browser",
  },
];

const ignoredNames = new Set([".upstream-sha", ".upstream-sha-haxlys"]);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir, base = dir) {
  const results = [];
  if (!(await exists(dir))) return results;

  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    if (ignoredNames.has(item.name)) continue;

    const fullPath = path.join(dir, item.name);
    const relPath = path.relative(base, fullPath);

    if (item.isDirectory()) {
      results.push(...(await walkFiles(fullPath, base)));
    } else if (item.isFile()) {
      results.push(relPath);
    }
  }

  return results.sort();
}

async function copyFiltered(source, target) {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });

  const files = await walkFiles(source);
  for (const relPath of files) {
    const from = path.join(source, relPath);
    const to = path.join(target, relPath);
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
}

async function checkEntry({ name, source, target }) {
  const sourcePath = path.join(root, source);
  const targetPath = path.join(root, target);
  const sourceFiles = await walkFiles(sourcePath);
  const targetFiles = await walkFiles(targetPath);
  const problems = [];

  if (JSON.stringify(sourceFiles) !== JSON.stringify(targetFiles)) {
    problems.push(
      `${name}: file list differs\nsource: ${sourceFiles.join(", ")}\ntarget: ${targetFiles.join(", ")}`,
    );
  }

  for (const relPath of sourceFiles) {
    if (!targetFiles.includes(relPath)) continue;
    const [sourceBytes, targetBytes] = await Promise.all([
      fs.readFile(path.join(sourcePath, relPath)),
      fs.readFile(path.join(targetPath, relPath)),
    ]);

    if (!sourceBytes.equals(targetBytes)) {
      problems.push(`${name}: ${relPath} differs from ${source}`);
    }
  }

  return problems;
}

let failed = false;

for (const entry of entries) {
  if (checkOnly) {
    const problems = await checkEntry(entry);
    for (const problem of problems) {
      console.error(`::error::${problem}`);
      failed = true;
    }
  } else {
    await copyFiltered(path.join(root, entry.source), path.join(root, entry.target));
    console.log(`Synced ${entry.target} from ${entry.source}`);
  }
}

if (failed) {
  console.error("skills/ is out of sync. Run: node scripts/sync-skills-from-vendored.mjs");
  process.exit(1);
}

if (checkOnly) {
  console.log("skills/ mirrors vendored sources");
}
