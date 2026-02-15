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

function renderNode(absPath, relPath, prefix, isLast, depth) {
  const lines = [];
  const base = path.basename(relPath);
  const connector = isLast ? "└── " : "├── ";
  lines.push(prefix + connector + base);

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
    lines.push(...renderNode(childAbs, childRel, nextPrefix, childLast, depth + 1));
  });

  return lines;
}

function buildTree(repoRoot) {
  const available = ROOT_ITEMS.filter((item) => fs.existsSync(path.join(repoRoot, item)));
  if (available.length === 0) {
    return "(표시할 파일 없음)";
  }

  const lines = [];
  available.forEach((item, idx) => {
    const abs = path.join(repoRoot, item);
    const isLast = idx === available.length - 1;
    lines.push(...renderNode(abs, item, "", isLast, 0));
  });
  return lines.join("\n");
}

function getStagedChanges() {
  const output = run("git diff --cached --name-status");
  if (!output) return ["(staged 변경 없음)"];
  return output.split("\n");
}

function makeAutoBlock(repoRoot) {
  const tree = buildTree(repoRoot);
  const changes = getStagedChanges().join("\n");

  return [
    START_MARKER,
    "### 자동 동기화",
    "",
    "#### 파일 구조(요약)",
    "```text",
    tree,
    "```",
    "",
    "#### 변경 파일(커밋 스테이징 기준)",
    "```text",
    changes,
    "```",
    "",
    END_MARKER,
  ].join("\n");
}

function updateReadme(readmePath, autoBlock) {
  const original = fs.readFileSync(readmePath, "utf8");
  const blockRegex = new RegExp(
    `${START_MARKER}[\\s\\S]*?${END_MARKER}`,
    "m"
  );

  if (blockRegex.test(original)) {
    return original.replace(blockRegex, autoBlock);
  }

  const anchor = "\n## 로컬 실행";
  const insertAt = original.indexOf(anchor);
  if (insertAt === -1) {
    return `${original}\n\n${autoBlock}\n`;
  }

  return `${original.slice(0, insertAt)}\n\n${autoBlock}\n${original.slice(insertAt)}`;
}

function main() {
  const repoRoot = getRepoRoot();
  const readmePath = path.join(repoRoot, "README.md");
  const autoBlock = makeAutoBlock(repoRoot);
  const updated = updateReadme(readmePath, autoBlock);

  if (updated !== fs.readFileSync(readmePath, "utf8")) {
    fs.writeFileSync(readmePath, updated, "utf8");
  }
}

main();
