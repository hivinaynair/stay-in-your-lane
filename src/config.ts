import fs from "node:fs";
import path from "node:path";
import type { Config } from "./types.ts";

export function loadConfig(rootDir: string): Config {
  const pkgPath = path.join(rootDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const userConfig = pkg["stay-in-your-lane"] as
    | { features?: string[] }
    | undefined;

  if (!userConfig?.features?.length) {
    throw new Error(
      'Missing "stay-in-your-lane" config in package.json. Expected: { "stay-in-your-lane": { "features": ["src/features"] } }',
    );
  }

  const featureDirs = userConfig.features.map((f) =>
    path.resolve(rootDir, f),
  );
  const paths = loadTsconfigPaths(rootDir);

  return { features: featureDirs, paths, rootDir };
}

function loadTsconfigPaths(rootDir: string): Record<string, string[]> {
  const tsconfigPath = path.join(rootDir, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return {};

  const parsed = parseJsonc(fs.readFileSync(tsconfigPath, "utf-8"));
  const resolvedPaths = resolveTsconfigExtends(parsed, rootDir);
  return resolvedPaths;
}

function resolveTsconfigExtends(
  config: Record<string, unknown>,
  dir: string,
): Record<string, string[]> {
  let basePaths: Record<string, string[]> = {};

  if (typeof config.extends === "string") {
    const extendsPath = resolveExtendsPath(config.extends, dir);
    if (extendsPath && fs.existsSync(extendsPath)) {
      const baseConfig = parseJsonc(fs.readFileSync(extendsPath, "utf-8"));
      basePaths = resolveTsconfigExtends(baseConfig, path.dirname(extendsPath));
    }
  }

  const compilerOptions = config.compilerOptions as
    | Record<string, unknown>
    | undefined;
  const localPaths = (compilerOptions?.paths ?? {}) as Record<
    string,
    string[]
  >;

  return { ...basePaths, ...localPaths };
}

function resolveExtendsPath(extendsValue: string, dir: string): string | null {
  if (extendsValue.startsWith(".")) {
    const resolved = path.resolve(dir, extendsValue);
    if (fs.existsSync(resolved)) return resolved;
    if (fs.existsSync(resolved + ".json")) return resolved + ".json";
    return null;
  }
  // node_modules package — try to find it
  try {
    return require.resolve(extendsValue, { paths: [dir] });
  } catch {
    return null;
  }
}

export function parseJsonc(text: string): Record<string, unknown> {
  let result = "";
  let i = 0;
  while (i < text.length) {
    // skip strings (preserve contents)
    if (text[i] === '"') {
      const start = i;
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\") i++; // skip escaped char
        i++;
      }
      i++; // closing quote
      result += text.slice(start, i);
      continue;
    }
    // line comment
    if (text[i] === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    // block comment
    if (text[i] === "/" && text[i + 1] === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/"))
        i++;
      i += 2;
      continue;
    }
    // trailing comma before } or ]
    if (text[i] === ",") {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j]!)) j++;
      if (text[j] === "}" || text[j] === "]") {
        i++;
        continue;
      }
    }
    result += text[i];
    i++;
  }
  return JSON.parse(result);
}
