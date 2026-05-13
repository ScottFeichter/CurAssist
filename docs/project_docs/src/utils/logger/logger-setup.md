# src/utils/logger/logger-setup/

Setup utilities for the logging system.

---

## logger-directories.ts

Creates the `logs/` subdirectory structure at startup:
```
logs/error/, logs/warni/, logs/infor/, logs/https/,
logs/debug/, logs/enter/, logs/retrn/, logs/allWinston/
```
Called from `entry.ts` in non-production environments. In production, directories already exist from the initial deploy.

## logger-clearpath.ts

Utility to clear/reset log files. Can be called to wipe logs during development without deleting the directory structure.

## logger-interpolation.ts

String interpolation helpers for log messages. Provides template-literal-style formatting for structured log output.

## logger-wrapper.ts

See dedicated doc: `logger-setup/logger-wrapper.md`
