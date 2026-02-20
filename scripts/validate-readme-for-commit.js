#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`README commit check failed: ${message}`);
  process.exit(1);
}

function ensureSection(content, title) {
  const pattern = new RegExp(`^##\\s+${title}\\s*$`, "m");
  if (!pattern.test(content)) {
    fail(`missing section: \"## ${title}\"`);
  }
}

function ensureRecentUpdateEntry(content) {
  const updatesIdx = content.indexOf("## 업데이트 기록");
  if (updatesIdx === -1) {
    fail("missing section: \"## 업데이트 기록\"");
  }

  const tail = content.slice(updatesIdx);
  const headingMatches = [...tail.matchAll(/^###\s+(\d{4}-\d{2}-\d{2})(?:\s*\(([^\n]+)\))?\s*$/gm)]
    .map((match) => ({
      index: match.index ?? 0,
      date: String(match[1] || "").trim(),
      title: String(match[2] || "").trim(),
    }));

  const detailsMatches = [...tail.matchAll(/<summary><strong>(\d{4}-\d{2}-\d{2})<\/strong>\s*-\s*([^<\n]+)<\/summary>/gm)]
    .map((match) => ({
      index: match.index ?? 0,
      date: String(match[1] || "").trim(),
      title: String(match[2] || "").trim(),
    }));

  const updateEntries = [...headingMatches, ...detailsMatches].sort((a, b) => a.index - b.index);

  if (updateEntries.length === 0) {
    fail("no dated update entry found under \"## 업데이트 기록\"");
  }

  const latest = updateEntries[0];
  const date = latest.date;
  const title = latest.title;

  const today = new Date();
  const yyyy = String(today.getFullYear());
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const expected = `${yyyy}-${mm}-${dd}`;

  if (date !== expected) {
    fail(`latest update date must be today (${expected}), found ${date}`);
  }

  if (!title) {
    fail("latest update entry must include a short summary in parentheses");
  }
}

function ensureFeatureListLooksUpdated(content) {
  const featuresIdx = content.indexOf("## 주요 기능");
  if (featuresIdx === -1) {
    fail("missing section: \"## 주요 기능\"");
  }

  const after = content.slice(featuresIdx);
  const nextSection = after.search(/\n##\s+/);
  const body = nextSection === -1 ? after : after.slice(0, nextSection);

  const numberedItems = body.match(/^###\s+\d+\.\s+/gm) || [];
  if (numberedItems.length < 3) {
    fail("\"## 주요 기능\" should contain at least 3 numbered feature items");
  }
}

function ensureProjectStructureBlock(content) {
  const hasSection = /^##\s+프로젝트 구조\s*$/m.test(content);
  if (!hasSection) {
    fail("missing section: \"## 프로젝트 구조\"");
  }

  const blockPattern = /##\s+프로젝트 구조\s*\n+```[\s\S]*?```/m;
  if (!blockPattern.test(content)) {
    fail("\"## 프로젝트 구조\" must include a fenced code block");
  }
}

function ensureReadmeStagedForCommit() {
  const staged = run("git diff --cached --name-only").split("\n").filter(Boolean);
  if (!staged.includes("README.md")) {
    fail("README.md is not staged. pre-commit should stage README updates.");
  }

  const unstagedReadme = run("git status --porcelain README.md");
  if (unstagedReadme.startsWith(" M") || unstagedReadme.startsWith("MM")) {
    fail("README.md still has unstaged edits. run: git add README.md");
  }
}

function getSectionBlock(content, title) {
  const regex = new RegExp(`^##\\s+${title}\\s*$`, "m");
  const match = regex.exec(content);
  if (!match || match.index < 0) return "";
  const start = match.index;
  const tail = content.slice(start);
  const nextIdx = tail.slice(1).search(/\n##\s+/);
  if (nextIdx === -1) return tail.trim();
  return tail.slice(0, nextIdx + 1).trim();
}

function readHeadReadme() {
  try {
    return execSync("git show HEAD:README.md", { encoding: "utf8" });
  } catch {
    return "";
  }
}

function ensureRequiredSectionsActuallyUpdated(content) {
  const staged = run("git diff --cached --name-only").split("\n").filter(Boolean);
  const nonReadme = staged.filter((file) => file !== "README.md");
  if (nonReadme.length === 0) return;

  const headContent = readHeadReadme();
  if (!headContent) return;

  const requiredSections = ["주요 기능", "프로젝트 구조", "업데이트 기록"];
  const unchanged = requiredSections.filter((title) => {
    const before = getSectionBlock(headContent, title);
    const after = getSectionBlock(content, title);
    return before === after;
  });

  if (unchanged.length > 0) {
    fail(
      `README required sections not updated: ${unchanged
        .map((title) => `"${title}"`)
        .join(", ")}. Update these sections before commit.`
    );
  }
}

function getTodayDateString() {
  const today = new Date();
  const yyyy = String(today.getFullYear());
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseUpdateDetailsEntries(sectionText) {
  const entries = [];
  const detailsPattern = /<details>[\s\S]*?<\/details>/gm;
  const blocks = sectionText.match(detailsPattern) || [];

  for (const block of blocks) {
    const summaryMatch = block.match(/<summary><strong>(\d{4}-\d{2}-\d{2})<\/strong>\s*-\s*([^<\n]+)<\/summary>/m);
    if (!summaryMatch) continue;
    entries.push({
      date: String(summaryMatch[1] || "").trim(),
      title: String(summaryMatch[2] || "").trim(),
      block: block.trim(),
    });
  }

  return entries;
}

function ensurePastUpdateEntriesPreserved(content, headContent) {
  const currentUpdates = getSectionBlock(content, "업데이트 기록");
  const headUpdates = getSectionBlock(headContent, "업데이트 기록");
  if (!currentUpdates || !headUpdates) return;

  const currentEntries = parseUpdateDetailsEntries(currentUpdates);
  const headEntries = parseUpdateDetailsEntries(headUpdates);
  if (headEntries.length === 0) return;

  const today = getTodayDateString();
  const beforeHistory = headEntries
    .filter((entry) => entry.date !== today)
    .map((entry) => `${entry.date}::${entry.title}`);
  const afterHistory = currentEntries
    .filter((entry) => entry.date !== today)
    .map((entry) => `${entry.date}::${entry.title}`);

  if (beforeHistory.length !== afterHistory.length) {
    fail(
      "past update log entries were added/removed. Keep previous-date entries unchanged and add/update only today's entry."
    );
  }

  for (let i = 0; i < beforeHistory.length; i += 1) {
    if (beforeHistory[i] !== afterHistory[i]) {
      fail(
        "past update log summaries were modified or reordered. Do not edit/delete/merge previous-date entries; add a new entry for today."
      );
    }
  }
}

function main() {
  const mode = process.argv.includes("--mode=push") ? "push" : "commit";
  const repoRoot = run("git rev-parse --show-toplevel");
  const readmePath = path.join(repoRoot, "README.md");

  if (!fs.existsSync(readmePath)) {
    fail("README.md not found");
  }

  const content = fs.readFileSync(readmePath, "utf8");

  ensureSection(content, "주요 기능");
  ensureProjectStructureBlock(content);
  ensureSection(content, "업데이트 기록");
  ensureRecentUpdateEntry(content);
  ensureFeatureListLooksUpdated(content);
  if (mode === "commit") {
    ensureReadmeStagedForCommit();
    ensureRequiredSectionsActuallyUpdated(content);
    ensurePastUpdateEntriesPreserved(content, readHeadReadme());
  }

  console.log(`README ${mode} check passed.`);
}

main();
