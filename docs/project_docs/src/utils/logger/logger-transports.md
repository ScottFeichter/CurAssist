# src/utils/logger/logger-transports/

Winston transports define WHERE log messages are written.

---

## logger-consoleTransports.ts

Configures the console transport — writes colorized log messages to stdout. Uses the custom format with colors enabled.

## logger-fileTransports.ts

Configures all file transports using `winston-daily-rotate-file`:

Each transport:
- Writes to a specific directory (e.g. `logs/error/`)
- Rotates daily (new file each day)
- Filters by level (error transport only writes error-level messages)
- Has configurable max file size and retention

The "all" transports (`allWinstonLogsTransport`, `allLogsNoAnsiTransport`, `allLogsWithAnsiTransport`) capture every level in a single file for comprehensive debugging.
