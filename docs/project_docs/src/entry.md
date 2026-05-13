# src/entry.ts

This is the application entry point — the first file that runs when the server starts. It orchestrates the startup sequence: load environment, initialize logging, and start the Express server.

---

## Line-by-Line Breakdown

### Imports

```typescript
import { extendedConsole as console } from './streams/consoles/customConsoles';
```
Replaces the global `console` with a custom version that adds enter/leave markers, colored output, and structured logging. By aliasing it as `console`, all `console.log()` calls in this file use the enhanced version.

```typescript
import { requiredEnvVars } from './config/env-module';
```
Importing `requiredEnvVars` is what **triggers** `env-module.ts` to execute. When Node.js processes this import, it runs the entire `env-module.ts` file top-to-bottom — which loads the `.env` file, validates all required variables, and exports them to `process.env`. This is a side-effect import pattern.

```typescript
import logger from './utils/logger/logger';
```
The Winston logger instance — writes to rotating log files and console.

```typescript
import { log } from './utils/logger/logger-setup/logger-wrapper';
```
A convenience wrapper around the logger with methods like `log.enter()`, `log.retrn()`, `log.blank()` for structured function-level tracing.

```typescript
import { createLogDirectories } from './utils/logger/logger-setup/logger-directories';
```
Creates the `logs/` subdirectory structure if it doesn't exist.

```typescript
import { testLoggers, testLogWrappers } from './utils/logger/logger-trials/logger-trials';
```
Functions that exercise every log level and wrapper to verify they work on startup.

```typescript
import { start, SERVER } from './server/server';
```
- `SERVER` — the Express application instance
- `start` — async function that attaches middleware, connects to MongoDB, and binds to the port

---

### Execution

```typescript
console.enter();
```
Logs that execution has entered this file (for tracing the startup sequence).

```typescript
console.assert(requiredEnvVars, 'Missing requiredEnvVars');
```
Asserts that `requiredEnvVars` is truthy. This isn't really a runtime check (it's always an array) — its purpose is to ensure the import isn't tree-shaken or optimized away. The act of referencing `requiredEnvVars` guarantees `env-module.ts` has executed.

```typescript
if (process.env.NODE_ENV !== 'production') {
  logger.infor('=== CurAssist Starting ===');
  logger.infor(`Environment: ${process.env.NODE_ENV || 'development'}`);
  createLogDirectories();
  testLoggers();
  testLogWrappers();
  console.infor(`Logger and log wrappers successfully created!`);
}
```
In non-production environments:
1. Logs a startup banner
2. Creates log directories (in prod, these already exist and PM2 handles this)
3. Tests all loggers to verify they work (writes sample messages at each level)
4. Confirms success

Skipped in production to avoid unnecessary I/O and log noise on every restart.

```typescript
start(SERVER);
```
Kicks off the async server startup:
1. Registers CORS and JSON body parser
2. Attaches pre-route middleware (security, parsing, auth)
3. Mounts all routes
4. Attaches post-route middleware (error handlers)
5. Connects to MongoDB Atlas
6. Binds to `SERVER_PORT`

```typescript
console.leave();
```
Logs that execution has left this file's top-level scope. Note: `start()` is async, so the server isn't actually listening yet when this logs — it just means the synchronous setup is done.

---

### Notes Section

The commented notes at the bottom document the intended startup sequence for reference. They describe the full order from type definitions through server start.
