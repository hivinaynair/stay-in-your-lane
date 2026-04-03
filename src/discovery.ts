import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = /\.(ts|tsx|js|jsx)$/;

export function discoverFiles(
  rootDir: string,
  mode: "all" | "staged" | "files",
  files?: string[],
): string[] {
  if (mode === "files" && files) {
    return files
      .filter((f) => EXTENSIONS.test(f))
      .map((f) => (path.isAbsolute(f) ? f : path.resolve(rootDir, f)));
  }

  if (mode === "staged") {
    return gitStagedFiles(rootDir);
  }

  // full scan — try git first, fallback to fs walk
  if (isGitRepo(rootDir)) {
    return gitListFiles(rootDir);
  }
  return walkFiles(rootDir);
}

function isGitRepo(dir: string): boolean {
  try {
    execSync("git rev-parse --git-dir", {
      cwd: dir,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function parseGitOutput(output: string, rootDir: string): string[] {
  const trimmed = output.trim();
  if (!trimmed) return [];
  return trimmed.split("\n").map((f) => path.resolve(rootDir, f));
}

function gitListFiles(rootDir: string): string[] {
  const output = execSync(
    "git ls-files --cached --others --exclude-standard '*.ts' '*.tsx' '*.js' '*.jsx'",
    { cwd: rootDir, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
  );
  return parseGitOutput(output, rootDir);
}

function gitStagedFiles(rootDir: string): string[] {
  const output = execSync(
    "git diff --cached --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.jsx'",
    { cwd: rootDir, encoding: "utf-8" },
  );
  return parseGitOutput(output, rootDir);
}

function walkFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (EXTENSIONS.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}
