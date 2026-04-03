import { parseSync } from "oxc-parser";
import type { ImportInfo } from "./types.ts";

export function extractImports(
  filePath: string,
  source: string,
): ImportInfo[] {
  const result = parseSync(filePath, source);
  const imports: ImportInfo[] = [];

  for (const imp of result.module.staticImports) {
    imports.push({
      source: imp.moduleRequest.value,
      line: offsetToLine(source, imp.moduleRequest.start),
    });
  }

  for (const exp of result.module.staticExports) {
    for (const entry of exp.entries) {
      if (entry.moduleRequest) {
        imports.push({
          source: entry.moduleRequest.value,
          line: offsetToLine(source, entry.start),
        });
      }
    }
  }

  for (const dyn of result.module.dynamicImports) {
    const raw = source.slice(dyn.moduleRequest.start, dyn.moduleRequest.end);
    // strip quotes: 'foo' or "foo" or `foo`
    const stripped = raw.replace(/^['"`]|['"`]$/g, "");
    // skip template literals with expressions
    if (stripped.includes("${")) continue;
    if (stripped !== raw) {
      imports.push({
        source: stripped,
        line: offsetToLine(source, dyn.moduleRequest.start),
      });
    }
  }

  return imports;
}

function offsetToLine(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") line++;
  }
  return line;
}
