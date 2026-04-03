import { describe, expect, it } from "vitest";
import { extractImports } from "../src/extractor.ts";

describe("extractImports", () => {
  it("extracts static imports", () => {
    const source = `import { foo } from '@/features/auth/lib';`;
    const result = extractImports("test.ts", source);
    expect(result).toEqual([
      { source: "@/features/auth/lib", line: 1 },
    ]);
  });

  it("extracts type-only imports", () => {
    const source = `import type { Bar } from './types';`;
    const result = extractImports("test.ts", source);
    expect(result).toEqual([{ source: "./types", line: 1 }]);
  });

  it("extracts re-exports", () => {
    const source = `export { baz } from '../payments/utils';`;
    const result = extractImports("test.ts", source);
    expect(result).toEqual([{ source: "../payments/utils", line: 1 }]);
  });

  it("extracts dynamic imports", () => {
    const source = `const x = import('@/features/payments/utils');`;
    const result = extractImports("test.ts", source);
    expect(result).toEqual([
      { source: "@/features/payments/utils", line: 1 },
    ]);
  });

  it("skips computed dynamic imports", () => {
    const source = "const x = import(`@/features/${name}/utils`);";
    const result = extractImports("test.ts", source);
    expect(result).toEqual([]);
  });

  it("tracks correct line numbers", () => {
    const source = `import { a } from './a';
import { b } from './b';
import { c } from './c';`;
    const result = extractImports("test.ts", source);
    expect(result).toEqual([
      { source: "./a", line: 1 },
      { source: "./b", line: 2 },
      { source: "./c", line: 3 },
    ]);
  });

  it("handles multiple import types in one file", () => {
    const source = `import { foo } from '@/features/auth/lib';
import type { Bar } from './types';
export { baz } from '../payments/utils';`;
    const result = extractImports("test.ts", source);
    expect(result).toHaveLength(3);
    expect(result[0]!.source).toBe("@/features/auth/lib");
    expect(result[1]!.source).toBe("./types");
    expect(result[2]!.source).toBe("../payments/utils");
  });
});
