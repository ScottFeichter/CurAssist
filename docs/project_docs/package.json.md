# package.json

This is the NPM package manifest — it defines the project's identity, scripts, and dependencies.

---

## Line-by-Line Breakdown

```json
"name": "curassist-backend"
```
The package name. Used by NPM for identification. Not published to a registry — just a local project name.

```json
"version": "1.0.0"
```
Semantic version. Major.Minor.Patch. Since this isn't published, it's mostly informational.

```json
"description": "Backend for CurAssist workflow app"
```
Human-readable description. Shows up in `npm search` and package listings.

```json
"main": "dist/entry.js"
```
The entry point when someone does `require('curassist-backend')` or when `npm start` runs without a script. Points to the compiled TypeScript output.

---

## Scripts

```json
"build": "node content/Templates/build-template.js && tsc && cp -r src/views dist/ && cp -r src/public dist/ && node scripts/typedoc-runner.js"
```
Multi-step build pipeline:
1. `node content/Templates/build-template.js` — combines HTML template component files into one `orgServTemplate-combined.html`
2. `tsc` — runs the TypeScript compiler, outputting `.js` files to `dist/`
3. `cp -r src/views dist/` — copies HTML view files (not TypeScript, so `tsc` doesn't handle them)
4. `cp -r src/public dist/` — copies static frontend assets (JS, CSS, images)
5. `node scripts/typedoc-runner.js` — generates API documentation from source comments

```json
"start": "node dist/entry.js"
```
Runs the compiled production server directly. Used by PM2 in production.

```json
"dev": "npm run build && node dev-runner.js"
```
Full development startup: builds everything first, then launches the dev runner (which watches for changes and auto-restarts).

```json
"watch": "tsc --watch"
```
Runs TypeScript compiler in watch mode — recompiles on any `.ts` file change. Used internally by `dev-runner.js`.

```json
"watch:template": "nodemon --watch content/Templates --ext js,html --ignore content/Templates/orgServTemplate-combined.html --exec \"node content/Templates/build-template.js\""
```
Watches template source files and rebuilds the combined template on change. Ignores the output file to avoid infinite loops.

```json
"serve": "nodemon --delay 1 dist/entry.js"
```
Runs the compiled server with nodemon watching for changes. The `--delay 1` gives `tsc` a second to finish writing before nodemon restarts.

```json
"docs": "node scripts/typedoc-runner.js"
```
Generates TypeDoc documentation standalone (without a full build).

```json
"test": "NODE_ENV=test jest"
```
Runs all tests with `NODE_ENV=test` set. This ensures the test environment config is loaded and Winston uses silent transports.

```json
"test:unit": "NODE_ENV=test jest src/tests/unit"
```
Runs only unit tests (sanitizers, transform logic, hydrateTemplate).

```json
"test:integration": "NODE_ENV=test jest src/tests/integration"
```
Runs only integration tests (API routes via supertest + mongodb-memory-server).

```json
"test:coverage": "NODE_ENV=test jest --coverage"
```
Runs all tests and generates a coverage report showing which lines/branches are tested.

```json
"clean": "rm -rf dist"
```
Removes the compiled output directory for a fresh build.

---

## Dependencies (Production)

| Package | Purpose |
|---------|---------|
| `compression` | Gzip/deflate response compression middleware |
| `connect-timeout` | Middleware that times out requests after a specified duration |
| `cookie-parser` | Parses `Cookie` header into `req.cookies` object |
| `cors` | Cross-Origin Resource Sharing middleware |
| `csurf` | CSRF protection middleware (generates/validates tokens) |
| `dotenv` | Loads `.env` file variables into `process.env` |
| `ejs` | Embedded JavaScript templating engine (used for HTML views) |
| `express` | The web framework — handles HTTP routing and middleware |
| `express-rate-limit` | Rate limiting middleware to prevent abuse |
| `express-session` | Server-side session management |
| `helmet` | Sets security-related HTTP headers |
| `jsonwebtoken` | JWT creation and verification for authentication |
| `mongoose` | MongoDB ODM — defines schemas, validates data, queries Atlas |
| `morgan` | HTTP request logger middleware |
| `multer` | Multipart form data handling (file uploads — spreadsheets) |
| `sequelize` | SQL ORM (historical — commented out, kept for reference) |
| `winston` | Logging framework with transports (console, file, rotating) |
| `winston-daily-rotate-file` | Winston transport that rotates log files daily |
| `xlsx` | Spreadsheet parsing and generation (reads uploaded .ods/.xlsx, writes reports) |

---

## DevDependencies

| Package | Purpose |
|---------|---------|
| `@types/*` | TypeScript type definitions for each dependency |
| `concurrently` | Run multiple commands in parallel (used by dev scripts) |
| `jest` | Test runner and assertion library |
| `mongodb-memory-server` | Spins up an in-memory MongoDB for integration tests |
| `nodemon` | Watches files and restarts the server on changes |
| `supertest` | HTTP assertion library — makes requests to Express without a running server |
| `ts-jest` | Jest transformer that compiles TypeScript test files |
| `tsc-alias` | Resolves TypeScript path aliases in compiled output |
| `ttypescript` | TypeScript compiler wrapper that supports custom transformers |
| `typedoc` | Generates HTML documentation from TypeScript source and JSDoc comments |
| `typescript` | The TypeScript compiler itself |
| `typescript-transform-paths` | Transforms path aliases during compilation |
