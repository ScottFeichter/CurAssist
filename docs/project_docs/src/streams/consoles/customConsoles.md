# src/streams/consoles/customConsoles.ts

This module creates the custom console used throughout the entire application. It extends Node's built-in Console with four custom methods: `enter`, `leave`, `infor`, and `super`.

---

## Why a Custom Console?

The standard `console.log` provides no structure. This custom console adds:
- **File tracing** — `enter()`/`leave()` automatically log which file is executing
- **Dual output** — writes to both terminal AND log files simultaneously
- **Color coding** — different log levels have different colors
- **Environment awareness** — verbose logs are suppressed in production

---

## The Four Custom Methods

### console.enter()
```typescript
(customConsole as CustomConsole).enter = function(data?, ...args) {
  const fileName = getCallerFileName();
  writeToConsoleAndFile(`[console] ENTER :`, fileName + message, false, '', ...args);
  if (isEnterEnabled(process.env.NODE_ENV)) {
    console.log(`[console] ENTER : ${fileName}${message}`);
  }
};
```
Logs that execution has entered a file. Automatically detects the calling file's name from the stack trace. Output: `[console] ENTER : server.ts`

### console.leave()
Same as `enter()` but marks exit. Adds a blank line after for visual separation.

### console.infor()
```typescript
(customConsole as CustomConsole).infor = function(data?, ...args) {
  writeToConsoleAndFile('[console] INFOR :', data, false, '', ...args);
  if (isInforEnabled(process.env.NODE_ENV)) {
    console.log(`${GREY_COLOR}[console] INFOR : ${message}`);
  }
};
```
Informational logging in grey. Always enabled (even in production). Objects are colorized with cyan values.

### console.super()
The most complex method — detailed debug logging with:
- File name and line number of the caller
- Item name (first argument)
- Pretty-printed values with yellow highlighting
- Special handling for file paths (formatted vertically)
- Black-on-yellow background for high visibility

Only enabled in non-production environments.

---

## Key Implementation Details

```typescript
const customConsole = new Console({ stdout: process.stdout, stderr: process.stderr });
```
Creates a new Console instance (not modifying the global one). This is then extended with custom methods and exported as `extendedConsole`.

```typescript
const formatPath = (path: string): string => { ... }
```
Formats file paths vertically with yellow coloring for readability in `super()` output.

```typescript
const isLikelyPath = (str: string): boolean => { ... }
```
Heuristic to detect if a string argument is a file path (contains `/` or `\` and ends with a known extension).

---

## Usage Pattern

Every file in the project:
```typescript
import { extendedConsole as console } from './streams/consoles/customConsoles';
console.enter();
// ... file code ...
console.infor('some info');
console.super('variableName', someVariable);
console.leave();
```
