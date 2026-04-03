import { describe, expect, it } from "vitest";
import { checkBoundary, getFeatureName } from "../src/checker.ts";

const FEATURE_DIRS = ["/project/src/features"];

describe("getFeatureName", () => {
  it("extracts feature name from path", () => {
    expect(
      getFeatureName(
        "/project/src/features/clients/components/foo.ts",
        "/project/src/features",
      ),
    ).toBe("clients");
  });

  it("returns null for non-feature paths", () => {
    expect(
      getFeatureName("/project/src/lib/utils.ts", "/project/src/features"),
    ).toBeNull();
  });

  it("returns null for app paths", () => {
    expect(
      getFeatureName("/project/src/app/page.tsx", "/project/src/features"),
    ).toBeNull();
  });
});

describe("checkBoundary", () => {
  it("flags cross-feature import", () => {
    const result = checkBoundary(
      "/project/src/features/enrollments/lib/create.ts",
      "/project/src/features/payments/server/record.ts",
      "@/features/payments/server/record",
      42,
      FEATURE_DIRS,
    );
    expect(result).toEqual({
      file: "/project/src/features/enrollments/lib/create.ts",
      line: 42,
      importPath: "@/features/payments/server/record",
      fromFeature: "enrollments",
      toFeature: "payments",
    });
  });

  it("allows same-feature import", () => {
    const result = checkBoundary(
      "/project/src/features/auth/lib/login.ts",
      "/project/src/features/auth/types.ts",
      "./types",
      5,
      FEATURE_DIRS,
    );
    expect(result).toBeNull();
  });

  it("allows non-feature file importing from feature", () => {
    const result = checkBoundary(
      "/project/src/app/page.tsx",
      "/project/src/features/auth/components/form.tsx",
      "@/features/auth/components/form",
      3,
      FEATURE_DIRS,
    );
    expect(result).toBeNull();
  });

  it("allows feature importing from shared lib", () => {
    const result = checkBoundary(
      "/project/src/features/auth/lib/login.ts",
      "/project/src/lib/utils.ts",
      "@/lib/utils",
      1,
      FEATURE_DIRS,
    );
    expect(result).toBeNull();
  });
});
