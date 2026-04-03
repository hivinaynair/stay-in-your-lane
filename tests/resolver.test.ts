import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveImport } from "../src/resolver.ts";

const ROOT = "/project";
const ALIASES = { "@/*": ["./src/*"] };

describe("resolveImport", () => {
  it("resolves alias imports", () => {
    const result = resolveImport(
      "@/features/clients/types",
      "/project/src/features/auth/index.ts",
      ALIASES,
      ROOT,
    );
    expect(result).toBe(path.resolve(ROOT, "src/features/clients/types"));
  });

  it("resolves relative imports", () => {
    const result = resolveImport(
      "../../payments/utils",
      "/project/src/features/auth/lib/index.ts",
      ALIASES,
      ROOT,
    );
    expect(result).toBe(
      path.resolve("/project/src/features/auth/lib", "../../payments/utils"),
    );
  });

  it("returns null for bare specifiers", () => {
    const result = resolveImport(
      "react",
      "/project/src/features/auth/index.ts",
      ALIASES,
      ROOT,
    );
    expect(result).toBeNull();
  });

  it("returns null for scoped packages", () => {
    const result = resolveImport(
      "@tanstack/react-query",
      "/project/src/features/auth/index.ts",
      ALIASES,
      ROOT,
    );
    expect(result).toBeNull();
  });

  it("uses longest prefix match", () => {
    const aliases = {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
    };
    const result = resolveImport(
      "@/features/auth/types",
      "/project/src/app/page.ts",
      aliases,
      ROOT,
    );
    expect(result).toBe(path.resolve(ROOT, "src/features/auth/types"));
  });
});
