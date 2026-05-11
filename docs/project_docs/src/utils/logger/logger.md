# src/utils/logger/logger.ts

Creates and exports the Winston logger instance — the central logging object used throughout the application.

---

## Line-by-Line Breakdown

```typescript
import 'winston-daily-rotate-file';
```
Side-effect import — registers the daily rotate transport type with Winston so it can be used in transport configs.

```typescript
EventEmitter.defaultMaxListeners = 20;
```
Increases the default listener limit. Winston attaches listeners to each transport; with 11+ transports, the default limit of 10 would trigger warnings.

```typescript
winston.addColors(customLevels.colors);
```
Registers custom colors for each log level so console output is colorized (e.g. errors in red, info in cyan).

```typescript
const isTest = process.env.NODE_ENV === 'test';
```
In test environment, uses a single silent transport — no file writes, no console noise. Tests run clean.

```typescript
const logger = winston.createLogger({
  level: process.env.WINSTON_LOG_LEVEL || 'debug',
  levels: customLevels.levels,
  format: winston.format.combine(
    customTimestamp(),
    winston.format.errors({ stack: true }),
    baseLogFormat
  ),
  transports: isTest ? [silent] : [all 11 transports]
});
```
- `level` — minimum level to log (from env var, defaults to 'debug' which logs everything)
- `levels` — custom level hierarchy (error=0, warni=1, infor=2, https=3, debug=4, enter=5, retrn=6)
- `format.combine` — chains formatters: timestamp → stack trace capture → base format
- `transports` — where logs go (console + 10 file transports for different levels/formats)

```typescript
logger.on('error', (error) => {
  console.error('Logger error:', error);
  fs.appendFileSync('logger-errors.txt', ...);
});
```
If the logger itself fails (e.g. can't write to a file), falls back to console and a simple text file.

---

## Transports (non-test)

| Transport | Destination |
|-----------|-------------|
| `consoleTransport` | Terminal (colorized) |
| `errorTransport` | `logs/error/` (daily rotation) |
| `warniTransport` | `logs/warni/` |
| `inforTransport` | `logs/infor/` |
| `httpsTransport` | `logs/https/` |
| `debugTransport` | `logs/debug/` |
| `enterTransport` | `logs/enter/` |
| `retrnTransport` | `logs/retrn/` |
| `allWinstonLogsTransport` | `logs/allWinston/` (all levels) |
| `allLogsNoAnsiTransport` | `logs/all-no-ansi.log` (plain text) |
| `allLogsWithAnsiTransport` | `logs/all-w-ansi.log` (colored) |
