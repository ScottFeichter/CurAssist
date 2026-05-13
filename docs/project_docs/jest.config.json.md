# jest.config.json

This is the Jest test runner configuration. It tells Jest how to find, compile, and run tests.

---

## Line-by-Line Breakdown

```json
"preset": "ts-jest"
```
Uses the `ts-jest` preset, which configures Jest to compile TypeScript files on-the-fly using the TypeScript compiler. Without this, Jest can only run plain JavaScript.

```json
"testEnvironment": "node"
```
Tests run in a Node.js environment (not a browser/jsdom). This means globals like `window` and `document` are not available — appropriate for a server-side app.

```json
"verbose": true
```
Prints each individual test name and its pass/fail status. Without this, Jest only shows a summary per test file.

```json
"testEnvironmentOptions": {
  "NODE_ENV": "test"
}
```
Sets `NODE_ENV` to `"test"` within the test environment. This is a belt-and-suspenders approach — the npm scripts also set it via `NODE_ENV=test jest`, but this ensures it's set even if someone runs Jest directly.

```json
"moduleNameMapper": {
  "^@/(.*)$": "<rootDir>/src/$1"
}
```
Maps the `@/` path alias to `src/`. If any import uses `@/config/env-module`, Jest resolves it to `<project_root>/src/config/env-module`. `<rootDir>` is the directory containing this config file.

```json
"testMatch": ["**/*.test.ts"]
```
Pattern for finding test files. Any file ending in `.test.ts` anywhere in the project is treated as a test file.

```json
"coverageDirectory": "coverage"
```
Where to write coverage reports when running `npm run test:coverage`. Creates a `coverage/` folder at the project root.

```json
"collectCoverageFrom": [
  "src/**/*.{js,ts}",
  "!src/**/*.d.ts",
  "!src/tests/**"
]
```
Which files to measure coverage for:
- `src/**/*.{js,ts}` — all source files
- `!src/**/*.d.ts` — exclude type definition files (no runtime code)
- `!src/tests/**` — exclude test files themselves (measuring test coverage of tests is circular)

```json
"moduleFileExtensions": ["ts", "js", "json", "node"]
```
File extensions Jest tries when resolving imports (in order). If you write `import './foo'`, Jest tries `foo.ts`, then `foo.js`, then `foo.json`, then `foo.node`.

```json
"roots": ["<rootDir>/src"]
```
Where Jest looks for test files. Limits the search to `src/` — won't accidentally pick up test-like files in `node_modules` or `dist`.

```json
"testPathIgnorePatterns": [
  "/node_modules/",
  "/dist/"
]
```
Directories to never look in for tests, even if they match `testMatch`. Redundant with `roots` but provides an extra safety net.

```json
"setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]
```
Files to run after the test environment is set up but before any tests execute. `jest.setup.ts` silences console output and sets `NODE_ENV=test`. Runs once per test file.

```json
"clearMocks": true
```
Automatically clears mock state (calls, instances, results) between every test. Prevents one test's mock data from leaking into the next. Does NOT restore the original implementation — just clears recorded calls.
