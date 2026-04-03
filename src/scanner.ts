import fs from "node:fs";
import type { Config, ScanResult, Violation } from "./types.ts";
import { checkBoundary } from "./checker.ts";
import { extractImports } from "./extractor.ts";
import { resolveImports } from "./resolver.ts";

export function scan(config: Config, files: string[]): ScanResult {
  const violations: Violation[] = [];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf-8");
    const imports = extractImports(file, source);
    const resolved = resolveImports(
      imports,
      file,
      config.paths,
      config.rootDir,
    );

    for (const { importInfo, resolvedPath } of resolved) {
      const violation = checkBoundary(
        file,
        resolvedPath,
        importInfo.source,
        importInfo.line,
        config.features,
      );
      if (violation) {
        violations.push(violation);
      }
    }
  }

  return { violations, filesChecked: files.length };
}
