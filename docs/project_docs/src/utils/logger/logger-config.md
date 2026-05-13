# src/utils/logger/logger-config/

Configuration files for the Winston logger.

---

## logger-levels.ts

Defines custom log levels and their colors:

```typescript
export const customLevels = {
  levels: { error: 0, warni: 1, infor: 2, https: 3, debug: 4, enter: 5, retrn: 6 },
  colors: { error: 'red', warni: 'yellow', infor: 'cyan', https: 'magenta', debug: 'green', enter: 'white', retrn: 'white' }
};
```

Lower numbers = higher priority. Setting `level: 'debug'` logs everything at debug and above (error, warni, infor, https, debug). Setting `level: 'error'` logs only errors.

## logger-formatters.ts

Defines the `baseLogFormat` — a Winston `printf` format that structures each log line:
```
[timestamp] [winston] LEVEL : message
```

Handles colorization for console output and plain text for file output.

## logger-timestamp.ts

Defines `customTimestamp()` — a Winston format that adds a formatted timestamp to each log entry. Format: `[MM-DD-YYYY HH:MM:SS:MMMM]`.

## logger-paths.ts

Defines file paths for each log level's output directory:
```typescript
export const logPaths = {
  error: 'logs/error',
  warni: 'logs/warni',
  infor: 'logs/infor',
  ...
};
```
