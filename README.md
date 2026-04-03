# stay-in-your-lane

[![npm](https://img.shields.io/npm/v/stay-in-your-lane)](https://www.npmjs.com/package/stay-in-your-lane)
[![GitHub](https://img.shields.io/badge/github-hivinaynair%2Fstay--in--your--lane-blue?logo=github)](https://github.com/hivinaynair/stay-in-your-lane)

Enforce feature-based folder boundaries. No cross-feature imports.

If your codebase is organized into feature folders — `src/features/auth`, `src/features/billing`, `src/features/dashboard` — this tool makes sure they don't reach into each other. Features can share a common layer, but they can't import from sibling features.

## Install

```bash
npm install --save-dev stay-in-your-lane
# or
bun add -d stay-in-your-lane
```

## Configure

Add a `stay-in-your-lane` key to your `package.json` pointing to the directories that contain your features:

```json
{
  "stay-in-your-lane": {
    "features": ["src/features"]
  }
}
```

Each path in `features` is a directory whose **immediate subdirectories** are treated as feature boundaries. Imports between those subdirectories are violations.

Multiple feature roots are supported:

```json
{
  "stay-in-your-lane": {
    "features": ["src/features", "src/modules"]
  }
}
```

TypeScript path aliases defined in `tsconfig.json` (including extended configs) are resolved automatically.

## Usage

```bash
# Scan the entire project
npx stay-in-your-lane

# Scan specific files
npx stay-in-your-lane check src/features/auth/index.ts src/features/billing/utils.ts

# Scan only git-staged files (useful in a pre-commit hook)
npx stay-in-your-lane --staged

# Output violations as JSON
npx stay-in-your-lane --json
```

Exit code is `0` when no violations are found, `1` when violations exist, and `2` on a configuration error.

## Example output

```
stay-in-your-lane: 2 violations found

  src/features/auth/LoginForm.tsx
    L12  → imports from billing  (../../billing/plans)

  src/features/dashboard/index.ts
    L4   → imports from auth  (@/features/auth/session)
```

## Pre-commit hook

Pair with [lint-staged](https://github.com/lint-staged/lint-staged) to enforce boundaries on every commit:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": "stay-in-your-lane check"
  }
}
```

Or add a `pre-commit` script directly:

```bash
#!/bin/sh
npx stay-in-your-lane --staged
```

## How it works

1. **Discover** — finds all `.ts`, `.tsx`, `.js`, and `.jsx` files (or accepts an explicit list).
2. **Extract** — parses each file with [oxc-parser](https://github.com/oxc-project/oxc) to collect static imports, re-exports, and static dynamic imports.
3. **Resolve** — turns each import specifier into an absolute path, handling relative paths and TypeScript aliases.
4. **Check** — if the importing file and the resolved path live in different immediate subdirectories of a configured feature root, it's a violation.
5. **Report** — prints a grouped, human-readable summary (or JSON) and exits with the appropriate code.

## License

MIT — [github.com/hivinaynair/stay-in-your-lane](https://github.com/hivinaynair/stay-in-your-lane)
