import path from "node:path";
import type { Violation } from "./types.ts";

export function getFeatureName(
  filePath: string,
  featureDir: string,
): string | null {
  const normalized = path.normalize(filePath);
  const normalizedFeatureDir = path.normalize(featureDir);

  if (!normalized.startsWith(normalizedFeatureDir + path.sep)) return null;
  const rest = normalized.slice(normalizedFeatureDir.length + 1);
  return rest.split(path.sep)[0] ?? null;
}

export function checkBoundary(
  file: string,
  resolvedImportPath: string,
  importSource: string,
  importLine: number,
  featureDirs: string[],
): Violation | null {
  for (const featureDir of featureDirs) {
    const fromFeature = getFeatureName(file, featureDir);
    const toFeature = getFeatureName(resolvedImportPath, featureDir);

    if (fromFeature && toFeature && fromFeature !== toFeature) {
      return {
        file,
        line: importLine,
        importPath: importSource,
        fromFeature,
        toFeature,
      };
    }
  }
  return null;
}
