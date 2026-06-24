#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const roots = ["skills"];
const problems = [];

function fail(file, message) {
  problems.push(`${file}: ${message}`);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const results = [];
  if (!(await exists(dir))) return results;

  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...(await walk(fullPath)));
    } else if (item.isFile() && item.name === "SKILL.md") {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function getFrontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.replace(/^["']|["']$/g, "").trim();
}

for (const rootDir of roots) {
  for (const filePath of await walk(path.join(root, rootDir))) {
    const relPath = path.relative(root, filePath);
    const text = await fs.readFile(filePath, "utf8");
    const match = text.match(/^---\n([\s\S]*?)\n---/);

    if (!match) {
      fail(relPath, "missing YAML frontmatter");
      continue;
    }

    const frontmatter = match[1];
    const name = getFrontmatterValue(frontmatter, "name");
    const description = getFrontmatterValue(frontmatter, "description");

    if (!name) fail(relPath, "missing frontmatter name");
    if (!description) fail(relPath, "missing frontmatter description");

    if (relPath.startsWith("skills/") && name) {
      const dirName = path.basename(path.dirname(filePath));
      if (name !== dirName) {
        fail(relPath, `frontmatter name '${name}' must match directory '${dirName}'`);
      }
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`::error::${problem}`);
  }
  process.exit(1);
}

console.log("SKILL.md frontmatter is valid");
