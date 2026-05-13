# src/utils/logger/logger-setup/logger-wrapper.ts

Provides the `log` object — a developer-friendly wrapper around the Winston logger with convenience methods and formatting tokens.

---

## The `log` Object

```typescript
export const log: CustomLogger = {
  error: (...args) => logger.error(formatArgsWithWrapping(args)),
  warni: (...args) => logger.warni(formatArgsWithWrapping(args)),
  infor: (...args) => logger.infor(formatArgsWithWrapping(args)),
  https: (...args) => logger.https(formatArgsWithWrapping(args)),
  debug: (...args) => logger.debug(formatArgsWithWrapping(args)),
  enter: (...args) => logger.enter(formatArgsWithWrapping(args)),
  retrn: (...args) => logger.retrn(formatArgsWithWrapping(args)),
  blank: () => console.log('\n'),
  arrow: ' -----------> ',
  worra: ' <----------- ',
  brack: '=> {',
  kcarb: '<= };'
};
```

Each method:
1. Takes any number of arguments
2. Formats them with `formatArgsWithWrapping()` (handles objects, arrays, primitives)
3. Passes the formatted string to the corresponding Winston level

---

## Formatting Tokens

| Token | Visual | Purpose |
|-------|--------|---------|
| `log.brack` | `=> {` | Marks function entry (opening bracket) |
| `log.kcarb` | `<= };` | Marks function return (closing bracket) |
| `log.arrow` | ` -----------> ` | Visual arrow for data flow |
| `log.worra` | ` <----------- ` | Reverse arrow |

Usage:
```typescript
log.enter('myFunction()', log.brack);  // [winston] ENTER : myFunction() => {
// ... function body ...
log.retrn('myFunction()', log.kcarb);  // [winston] RETRN : myFunction() <= };
```

---

## formatArgsWithWrapping

Formats mixed argument types for readable log output:
- Primitives (strings, numbers) — joined with spaces on one line
- Objects/arrays — pretty-printed with `util.inspect()`, indented to align with the log prefix
- Mixed — objects get their own lines, primitives stay inline

This makes log output readable even with complex nested objects.
