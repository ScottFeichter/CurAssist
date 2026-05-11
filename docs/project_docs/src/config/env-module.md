# src/config/env-module.ts

This module loads environment variables from the correct `.env` file based on `NODE_ENV`, validates that all required variables are present, and exports them as named constants for use throughout the app.

---

## Line-by-Line Breakdown

### Imports

```typescript
import path from 'path';
```
Node.js path module — provides `path.resolve()` for building absolute file paths.

```typescript
import { extendedConsole as console } from '../streams/consoles/customConsoles';
```
Custom console for structured logging.

```typescript
import { error } from 'console';
```
Imports the native `error` function (unused — likely leftover from debugging).

```typescript
import { config } from 'dotenv';
```
The `config` function from the `dotenv` package. When called, it reads a `.env` file and loads its key=value pairs into `process.env`.

---

### Determining the .env File Path

```typescript
const envVarsFilePath = `./.env/.env.${process.env.NODE_ENV || 'development'}`;
```
Builds the path dynamically:
- If `NODE_ENV=production` → `./.env/.env.production`
- If `NODE_ENV=development` → `./.env/.env.development`
- If `NODE_ENV` is unset → defaults to `./.env/.env.development`

The `.env/` directory (note: directory, not file) contains environment-specific files. This is a non-standard but organized approach — most projects put `.env` at the root.

---

### Loading the Variables

```typescript
const environmentVariables = config({ path: path.resolve(process.cwd(), envVarsFilePath) });
```
This is the key line. Breaking it down piece by piece:

1. **`process.cwd()`** — returns the Current Working Directory (where `node` was invoked from). For this project, that's the project root (`/home/ec2-user/CurAssist` in prod, or your local project folder in dev).

2. **`envVarsFilePath`** — the relative path string like `./.env/.env.development`

3. **`path.resolve(process.cwd(), envVarsFilePath)`** — combines them into an absolute path. `path.resolve` works like `cd`-ing into each argument sequentially:
   - Start at `process.cwd()` → `/Users/you/CurAssist`
   - Apply `./.env/.env.development` → `/Users/you/CurAssist/.env/.env.development`
   
   Why not just use the relative path directly? Because `dotenv` resolves relative paths from where Node was started, which might differ from where the file lives (e.g. if started from a parent directory). `path.resolve` guarantees the correct absolute path regardless of where `node` is invoked.

4. **`config({ path: ... })`** — `dotenv.config()` reads the file at the given path, parses each `KEY=VALUE` line, and calls `process.env.KEY = VALUE` for each one. It returns an object:
   ```typescript
   { parsed: { SERVER_PORT: '5555', DB_CONNECT: '...', ... } }
   // or on failure:
   { error: Error }
   ```

5. **`const environmentVariables = ...`** — stores the return value so we can check for errors.

---

### Error Handling

```typescript
if (environmentVariables.error) {
  console.error("...", environmentVariables.error);
  process.exit(1);
}
```
If the `.env` file doesn't exist or can't be read, the app exits immediately. There's no point continuing without database credentials or server config.

`process.exit(1)` — exits with code 1 (error). Code 0 means success.

---

### Validation

```typescript
export const requiredEnvVars = [
  'SERVER_PORT',
  'NODE_ENV',
  'BASE_URL',
  'WINSTON_LOG_LEVEL',
  'DB_CONNECT'
];
```
Array of variable names that MUST be present. Exported so `entry.ts` can import it (which triggers this file to execute).

```typescript
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```
Iterates through each required name and checks if it exists in `process.env`. If any is missing, throws an error that crashes the app with a clear message. This catches typos in `.env` files or missing variables early — before the app gets halfway through startup and fails cryptically.

---

### Exporting Variables

```typescript
export const {
  SERVER_PORT,
  NODE_ENV,
  BASE_URL,
  WINSTON_LOG_LEVEL,
  DB_CONNECT
} = process.env;
```
Destructures the required variables from `process.env` and re-exports them as named constants. This provides:

1. **Type safety** — other files import `SERVER_PORT` directly instead of accessing `process.env.SERVER_PORT` (which TypeScript types as `string | undefined`)
2. **Centralization** — if a variable name changes, you only update it here
3. **Discoverability** — `import { SERVER_PORT } from '../config/env-module'` makes dependencies explicit

---

## Execution Flow

This file executes as a **side effect of being imported**. The sequence:

1. `entry.ts` imports `requiredEnvVars` from this file
2. Node.js sees the import and executes this entire file top-to-bottom
3. `.env` file is loaded into `process.env`
4. Variables are validated
5. Constants are exported
6. `entry.ts` receives `requiredEnvVars` and continues

If validation fails at step 4, the process exits before `entry.ts` can even call `start()`.
