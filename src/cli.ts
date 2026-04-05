#!/usr/bin/env bun
import { loadConfig } from "./config.ts";
import { discoverFiles } from "./discovery.ts";
import { formatHuman, formatJson } from "./formatter.ts";
import { scan } from "./scanner.ts";

const args = process.argv.slice(2);
const json = args.includes("--json");
const staged = args.includes("--staged");
const checkIdx = args.indexOf("check");

const rootDir = process.cwd();

try {
  const config = loadConfig(rootDir);

  let files: string[];
  if (checkIdx !== -1) {
    const fileArgs = args.slice(checkIdx + 1).filter((a) => !a.startsWith("--"));
    files = discoverFiles(rootDir, "files", fileArgs);
  } else if (staged) {
    files = discoverFiles(rootDir, "staged");
  } else {
    files = discoverFiles(rootDir, "all");
  }

  const result = scan(config, files);
  const output = json
    ? formatJson(result, rootDir)
    : formatHuman(result, rootDir);

  const exitCode = result.violations.length > 0 ? 1 : 0;
  process.stdout.write(`${output}\n`, () => process.exit(exitCode));
} catch (err) {
  console.error(
    `stay-in-your-lane: ${err instanceof Error ? err.message : err}`,
  );
  process.exit(2);
}
