# src/streams/consoles/customConsoleMethods.ts

This module provides helper functions used by the custom console. It handles formatting, colorizing, caller detection, and file writing.

---

## Exported Functions

### formatTimestamp()
```typescript
export function formatTimestamp(): string {
  return `[MM-DD-YYYY HH:MM:SS:MMMM]`;
}
```
Returns a formatted timestamp string for log file entries. Uses local time (not UTC).

### colorizeSuperValues(data, indent)
Recursively formats objects/arrays with yellow coloring and proper indentation for `console.super()` output. Handles nested objects, arrays, strings, nulls, and primitives.

### needsMultilineDisplay(value)
Returns `true` if a value is a non-empty object or array — used to decide whether to format inline or multiline.

### colorizeValues(data)
Formats objects for `console.infor()` — uses cyan for values and grey for keys. Less verbose than `colorizeSuperValues`.

### getCallerInfo()
```typescript
export function getCallerInfo() {
  const err = new Error();
  const stack = err.stack?.split('\n');
  // Skip frames: Error, getCallerInfo, the custom console method, the actual caller
  for (let i = 3; i < stack.length; i++) {
    const line = stack[i];
    if (!line.includes('customConsoles.ts')) {
      const match = line.match(/[\/\\]([^\/\\]+\.[jt]s):(\d+):/);
      return { fileName: match[1], lineNumber: match[2] };
    }
  }
}
```
Creates an Error to capture the stack trace, then parses it to find the calling file's name and line number. Skips internal frames (the custom console files themselves).

### getCallerFileName()
Convenience wrapper — returns just the filename from `getCallerInfo()`.

### writeToConsoleAndFile(prefix, data, addLineBreak, useColor, ...args)
The core output function. Writes to two log files simultaneously:
1. `all-no-ansi.log` — plain text (ANSI color codes stripped)
2. `all-w-ansi.log` — colored text (viewable with `cat` in terminal)

Also returns the formatted message for console display.

### formatConsoleOutput(prefix, message, timestamp)
Applies color schemes based on the console type (ENTER = bright white, LEAVE = bright white, INFOR = grey).
