# src/utils/logger/logger-middleware/logger-morganMiddleware.ts

Configures Morgan (HTTP request logger) to pipe its output into Winston instead of writing directly to stdout.

---

## How It Works

```typescript
export const morganMiddleware = morgan(format, { stream: { write: (msg) => logger.https(msg.trim()) } });
```

- Morgan formats each HTTP request as a string (method, URL, status, response time)
- Instead of `console.log`, it writes to a custom stream
- The stream calls `logger.https()` which routes the message to the `https` level transports
- This means HTTP access logs end up in `logs/https/` alongside all other Winston logs

---

## Why Route Through Winston?

- Consistent formatting with all other logs
- Same rotation/retention policies
- Single log infrastructure to manage
- Can filter HTTP logs by level in production
