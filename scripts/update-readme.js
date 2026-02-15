#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const START_MARKER = "<!-- README:AUTO-START -->";
const END_MARKER = "<!-- README:AUTO-END -->";

const ROOT_ITEMS = [
  "index.html",
  "404.html",
  "pages",
  "css",
  "js",
  "workers",
  "docs",
  "scripts",
  "firebase.json",
  "package.json",
  "README.md",
];

const IGNORE_DIRS = new Set([
  ".git",
  ".firebase",
  ".vscode",
  ".claude",
  ".idx",
  "node_modules",
  ".wrangler",
]);

const MAX_DEPTH = 3;
const MAX_CHILDREN = 40;

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function getRepoRoot() {
  return run("git rev-parse --show-toplevel");
}

function listChildren(absDir) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => !IGNORE_DIRS.has(entry.name))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  if (entries.length <= MAX_CHILDREN) return entries;
  return entries.slice(0, MAX_CHILDREN);
}

/**
 * Parse existing "## 프로젝트 구조" code block to extract filename -> description map.
 * Lines like: "├── index.html               # 메인 페이지" => { "index.html": "메인 페이지" }
 * Lines like: "├── pages/" => { "pages/": "" } (directory, no description)
 */
function parseExistingDescriptions(readme) {
  const sectionMatch = readme.match(/## 프로젝트 구조\s*\n+```[^\n]*\n([\s\S]*?)```/);
  if (!sectionMatch) return {};

  const descriptions = {};
  const lines = sectionMatch[1].split("\n");
  for (const line of lines) {
    // Extract filename and optional # description
    const match = line.match(/[├└│─\s]+([^\s#/]+\/?)\s+#\s*(.+)/);
    if (match) {
      const filename = match[1].replace(/\/$/, "");
      descriptions[filename] = match[2].trim();
    }
  }
  return descriptions;
}

function renderNode(absPath, relPath, prefix, isLast, depth, descriptions) {
  const lines = [];
  const base = path.basename(relPath);
  const connector = isLast ? "└── " : "├── ";
  const desc = descriptions[base];
  const suffix = desc ? `${" ".repeat(Math.max(1, 25 - base.length))}# ${desc}` : "";
  lines.push(prefix + connector + base + suffix);

  const stat = fs.statSync(absPath);
  if (!stat.isDirectory() || depth >= MAX_DEPTH) {
    return lines;
  }

  const children = listChildren(absPath);
  const nextPrefix = prefix + (isLast ? "    " : "│   ");
  children.forEach((entry, idx) => {
    const childAbs = path.join(absPath, entry.name);
    const childRel = path.join(relPath, entry.name);
    const childLast = idx === children.length - 1;
    lines.push(...renderNode(childAbs, childRel, nextPrefix, childLast, depth + 1, descriptions));
  });

  return lines;
}

function buildTree(repoRoot, descriptions) {
  const available = ROOT_ITEMS.filter((item) => fs.existsSync(path.join(repoRoot, item)));
  if (available.length === 0) {
    return "(표시할 파일 없음)";
  }

  const lines = [];
  available.forEach((item, idx) => {
    const abs = path.join(repoRoot, item);
    const isLast = idx === available.length - 1;
    lines.push(...renderNode(abs, item, "", isLast, 0, descriptions));
  });
  return lines.join("\n");
}

function getStagedChanges() {
  const output = run("git diff --cached --name-status");
  if (!output) return ["(staged 변경 없음)"];
  return output.split("\n");
}

function makeAutoBlock() {
  const changes = getStagedChanges().join("\n");

  return [
    START_MARKER,
    "### 자동 동기화",
    "",
    "#### 변경 파일(커밋 스테이징 기준)",
    "```text",
    changes,
    "```",
    "",
    END_MARKER,
  ].join("\n");
}

function updateProjectStructure(readme, repoRoot) {
  const descriptions = parseExistingDescriptions(readme);
  const tree = buildTree(repoRoot, descriptions);

  // Replace the code block inside "## 프로젝트 구조"
  const regex = /(## 프로젝트 구조\s*\n+)```[^\n]*\n[\s\S]*?```/;
  if (regex.test(readme)) {
    return readme.replace(regex, `$1\`\`\`\n${tree}\n\`\`\``);
  }
  return readme;
}

function updateAutoBlock(readme, autoBlock) {
  const blockRegex = new RegExp(
    `${START_MARKER}[\\s\\S]*?${END_MARKER}`,
    "m"
  );

  if (blockRegex.test(readme)) {
    return readme.replace(blockRegex, autoBlock);
  }

  const anchor = "\n## 로컬 실행";
  const insertAt = readme.indexOf(anchor);
  if (insertAt === -1) {
    return `${readme}\n\n${autoBlock}\n`;
  }

  return `${readme.slice(0, insertAt)}\n\n${autoBlock}\n${readme.slice(insertAt)}`;
}

function main() {
  const repoRoot = getRepoRoot();
  const readmePath = path.join(repoRoot, "README.md");
  const original = fs.readFileSync(readmePath, "utf8");

  // 1. Update existing "## 프로젝트 구조" code block with current file tree + descriptions
  let updated = updateProjectStructure(original, repoRoot);

  // 2. Update auto-sync block (staged changes only, no duplicate file structure)
  const autoBlock = makeAutoBlock();
  updated = updateAutoBlock(updated, autoBlock);

  if (updated !== original) {
    fs.writeFileSync(readmePath, updated, "utf8");
  }
}

main();
