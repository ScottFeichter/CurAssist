# src/utils/logger/logger-trials/logger-trials.ts

Test functions that exercise every log level and wrapper on startup to verify the logging system works.

---

## What It Does

```typescript
export function testLoggers() {
  logger.error('Test error message');
  logger.warni('Test warning message');
  logger.infor('Test info message');
  logger.https('Test https message');
  logger.debug('Test debug message');
  logger.enter('Test enter message');
  logger.retrn('Test retrn message');
}

export function testLogWrappers() {
  log.error('Test log.error');
  log.warni('Test log.warni');
  log.infor('Test log.infor');
  ...
}
```

Called from `entry.ts` in non-production environments. Writes one test message at each level to confirm:
- All transports are working (files are writable)
- Formatters produce expected output
- Colors render correctly in the console
- No transport errors on startup

If any transport fails, the `logger.on('error')` handler in `logger.ts` catches it.
