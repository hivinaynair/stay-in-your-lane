import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig, parseJsonc } from "../src/config.ts";

describe("parseJsonc", () => {
  it("strips single-line comments", () => {
    const result = parseJsonc('{ "a": 1 // comment\n}');
    expect(result).toEqual({ a: 1 });
  });

  it("strips block comments", () => {
    const result = parseJsonc('{ /* comment */ "a": 1 }');
    expect(result).toEqual({ a: 1 });
  });

  it("strips trailing commas", () => {
    const result = parseJsonc('{ "a": 1, "b": 2, }');
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

describe("loadConfig", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "siyl-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("loads features from package.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        "stay-in-your-lane": { features: ["src/features"] },
      }),
    );
    fs.writeFileSync(
      path.join(tmpDir, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
    );

    const config = loadConfig(tmpDir);
    expect(config.features).toEqual([path.resolve(tmpDir, "src/features")]);
    expect(config.paths).toEqual({ "@/*": ["./src/*"] });
  });

  it("throws if no config in package.json", () => {
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({}));
    expect(() => loadConfig(tmpDir)).toThrow("Missing");
  });

  it("works without tsconfig.json", () => {
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        "stay-in-your-lane": { features: ["src/features"] },
      }),
    );

    const config = loadConfig(tmpDir);
    expect(config.paths).toEqual({});
  });

  it("follows tsconfig extends", () => {
    fs.writeFileSync(
      path.join(tmpDir, "base.json"),
      JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
    );
    fs.writeFileSync(
      path.join(tmpDir, "tsconfig.json"),
      JSON.stringify({ extends: "./base.json" }),
    );
    fs.writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify({
        "stay-in-your-lane": { features: ["src/features"] },
      }),
    );

    const config = loadConfig(tmpDir);
    expect(config.paths).toEqual({ "@/*": ["./src/*"] });
  });
});
