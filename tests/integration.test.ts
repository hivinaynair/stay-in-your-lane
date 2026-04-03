import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.ts";
import { discoverFiles } from "../src/discovery.ts";
import { formatHuman, formatJson } from "../src/formatter.ts";
import { scan } from "../src/scanner.ts";

const FIXTURES = path.resolve(import.meta.dirname!, "fixtures");

describe("integration", () => {
  it("detects all cross-feature violations in fixture project", () => {
    const config = loadConfig(FIXTURES);
    const files = discoverFiles(FIXTURES, "all");
    const result = scan(config, files);

    expect(result.violations).toHaveLength(3);

    const sources = result.violations.map((v) => ({
      from: v.fromFeature,
      to: v.toFeature,
    }));

    // payments -> enrollments
    expect(sources).toContainEqual({
      from: "payments",
      to: "enrollments",
    });
    // payments -> auth
    expect(sources).toContainEqual({ from: "payments", to: "auth" });
    // enrollments -> payments
    expect(sources).toContainEqual({
      from: "enrollments",
      to: "payments",
    });
  });

  it("does not flag same-feature or non-feature imports", () => {
    const config = loadConfig(FIXTURES);
    // auth/login.ts only imports from ./utils (same feature) and @/lib/db (shared)
    const authLogin = path.resolve(
      FIXTURES,
      "src/features/auth/login.ts",
    );
    const result = scan(config, [authLogin]);
    expect(result.violations).toHaveLength(0);
  });

  it("does not flag app/ importing from features", () => {
    const config = loadConfig(FIXTURES);
    const appPage = path.resolve(FIXTURES, "src/app/page.tsx");
    const result = scan(config, [appPage]);
    expect(result.violations).toHaveLength(0);
  });

  it("formats human output correctly", () => {
    const config = loadConfig(FIXTURES);
    const files = discoverFiles(FIXTURES, "all");
    const result = scan(config, files);
    const output = formatHuman(result, FIXTURES);

    expect(output).toContain("3 violations found");
    expect(output).toContain("imports from enrollments");
    expect(output).toContain("imports from auth");
    expect(output).toContain("imports from payments");
  });

  it("formats JSON output correctly", () => {
    const config = loadConfig(FIXTURES);
    const files = discoverFiles(FIXTURES, "all");
    const result = scan(config, files);
    const output = JSON.parse(formatJson(result, FIXTURES));

    expect(output).toHaveLength(3);
    expect(output[0]).toHaveProperty("file");
    expect(output[0]).toHaveProperty("line");
    expect(output[0]).toHaveProperty("importPath");
    expect(output[0]).toHaveProperty("fromFeature");
    expect(output[0]).toHaveProperty("toFeature");
  });

  it("check mode with specific files works", () => {
    const config = loadConfig(FIXTURES);
    const payButton = path.resolve(
      FIXTURES,
      "src/features/payments/components/pay-button.tsx",
    );
    const files = discoverFiles(FIXTURES, "files", [payButton]);
    const result = scan(config, files);
    expect(result.violations).toHaveLength(2);
    expect(result.filesChecked).toBe(1);
  });
});
