import path from "node:path";
import type { ImportInfo } from "./types.ts";

export function resolveImport(
  importSource: string,
  importingFile: string,
  pathAliases: Record<string, string[]>,
  rootDir: string,
): string | null {
  // relative import
  if (importSource.startsWith(".")) {
    const dir = path.dirname(importingFile);
    return path.resolve(dir, importSource);
  }

  // try alias resolution — longest prefix match
  const matches: { prefix: string; targets: string[] }[] = [];
  for (const [pattern, targets] of Object.entries(pathAliases)) {
    const prefix = pattern.replace(/\*$/, "");
    if (importSource.startsWith(prefix)) {
      matches.push({ prefix, targets });
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.prefix.length - a.prefix.length);
    const best = matches[0]!;
    const rest = importSource.slice(best.prefix.length);
    const target = best.targets[0]!.replace(/\*$/, "");
    return path.resolve(rootDir, target + rest);
  }

  // bare specifier (npm package) — not a local import
  return null;
}

export function resolveImports(
  imports: ImportInfo[],
  importingFile: string,
  pathAliases: Record<string, string[]>,
  rootDir: string,
): { importInfo: ImportInfo; resolvedPath: string }[] {
  const results: { importInfo: ImportInfo; resolvedPath: string }[] = [];
  for (const imp of imports) {
    const resolved = resolveImport(
      imp.source,
      importingFile,
      pathAliases,
      rootDir,
    );
    if (resolved) {
      results.push({ importInfo: imp, resolvedPath: resolved });
    }
  }
  return results;
}
