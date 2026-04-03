import path from "node:path";
import type { ScanResult } from "./types.ts";

export function formatHuman(result: ScanResult, rootDir: string): string {
  if (result.violations.length === 0) {
    return `stay-in-your-lane: ${result.filesChecked} files checked, no violations found`;
  }

  const lines: string[] = [];
  lines.push(
    `stay-in-your-lane: ${result.violations.length} violation${result.violations.length === 1 ? "" : "s"} found\n`,
  );

  // group by file
  const byFile = new Map<string, typeof result.violations>();
  for (const v of result.violations) {
    const rel = path.relative(rootDir, v.file);
    const existing = byFile.get(rel);
    if (existing) {
      existing.push(v);
    } else {
      byFile.set(rel, [v]);
    }
  }

  for (const [file, violations] of byFile) {
    lines.push(`  ${file}`);
    for (const v of violations) {
      lines.push(
        `    L${v.line}  → imports from ${v.toFeature}  (${v.importPath})`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function formatJson(result: ScanResult, rootDir: string): string {
  const violations = result.violations.map((v) => ({
    file: path.relative(rootDir, v.file),
    line: v.line,
    importPath: v.importPath,
    fromFeature: v.fromFeature,
    toFeature: v.toFeature,
  }));
  return JSON.stringify(violations, null, 2);
}
