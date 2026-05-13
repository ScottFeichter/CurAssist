# src/utils/logger/

This directory contains the Winston logging system — a structured, multi-transport logger with rotating file output.

---

## Structure

```
logger/
  logger.ts                    — Main logger instance (exports the Winston logger)
  logger-config/
    logger-formatters.ts       — Custom Winston format functions (colorize, timestamp, printf)
    logger-levels.ts           — Custom log levels (enter, leave, infor, super, warni, error, etc.)
    logger-paths.ts            — File paths for each log level's output directory
    logger-timestamp.ts        — Timestamp format configuration
  logger-middleware/
    logger-morganMiddleware.ts — Morgan HTTP logger configured to write to Winston
  logger-setup/
    logger-clearpath.ts        — Utility to clear/reset log files
    logger-directories.ts      — Creates the logs/ subdirectory structure
    logger-interpolation.ts    — String interpolation helpers for log messages
    logger-wrapper.ts          — Convenience wrapper (log.enter, log.retrn, log.blank, etc.)
  logger-transports/
    logger-consoleTransports.ts — Winston console transport configuration
    logger-fileTransports.ts    — Winston file transport configuration (daily rotation)
  logger-trials/
    logger-trials.ts           — Test functions that exercise every log level on startup
```

---

## How It Works

### logger.ts
Creates and exports the Winston logger instance with:
- Custom levels (beyond the standard error/warn/info/debug)
- Multiple transports (console + rotating files per level)
- Custom formatters (timestamps, colors, structured output)

### logger-wrapper.ts (the `log` object)
Provides a developer-friendly API:
```typescript
log.enter('functionName()', log.brack);  // Marks function entry
log.retrn('functionName()', log.kcarb);  // Marks function return
log.blank();                              // Empty line for readability
log.infor('message');                     // Info-level log
log.warni('message');                     // Warning-level log
log.error('message');                     // Error-level log
```

`log.brack` and `log.kcarb` are formatting tokens (bracket markers for visual function nesting).

### logger-morganMiddleware.ts
Configures Morgan (HTTP request logger) to pipe its output into Winston instead of stdout. This means HTTP access logs go into the same rotating log files as application logs.

### Daily Rotation
Uses `winston-daily-rotate-file` to:
- Create a new log file each day
- Organize by level (separate directories for error, info, debug, etc.)
- Prevent log files from growing unbounded

### Environment Behavior
- **Development** — all levels logged to console and files
- **Production** — all levels logged to console and files (same as dev)
- **Test** — silent transport (no output, no files)

### Why Silent in Tests?

The `isTest` check (`process.env.NODE_ENV === 'test'`) switches Winston to a single silent transport. The value `'test'` is correct — it matches what the npm scripts set (`NODE_ENV=test jest`) and what `jest.setup.ts` sets (`process.env.NODE_ENV = 'test'`).

Reasons for silencing:

1. **Noise** — running `npm test` would dump hundreds of Winston log lines (every `log.enter()`, `log.retrn()`, `log.infor()` from every route handler, middleware, and helper) mixed in with Jest's test results. You'd struggle to find which test passed/failed.

2. **File writes** — without silent mode, every test run would create/append to log files in `logs/`. Integration tests hit many routes, so you'd get dozens of log entries per test. Over time this fills up disk and the log files contain meaningless test data (not real traffic).

3. **Speed** — file I/O is slow relative to in-memory operations. Writing to 11 transports on every `log.infor()` call adds up when tests make hundreds of log calls. Silent mode makes tests faster.

4. **Isolation** — tests should be deterministic and side-effect-free. Writing to the filesystem is a side effect that could cause flaky tests (e.g. permission issues, disk full, file locks).

Note that `jest.setup.ts` also silences `console.*` for the same reasons — the custom console's `enter()`/`leave()`/`infor()` calls would also spam test output.

**Debugging tip:** If you need to see logs while debugging a failing test, temporarily comment out the `isTest` check in `logger.ts` or set `WINSTON_LOG_LEVEL=error` to only see errors. But for normal test runs, silent is the right default.
