# src/streams/consoles/customConsoleSetup.ts

This module provides the foundational setup for the custom console system: ANSI color constants, log file streams, and environment-based toggle functions.

---

## Line-by-Line Breakdown

### ANSI Color Codes

```typescript
export const GREY_COLOR = '\x1b[90m';
export const CYAN_COLOR = '\x1b[36m';
export const YELLOW_COLOR = '\x1b[33m';
export const RESET_COLOR = '\x1b[0m';
export const BLACK_ON_YELLOW = '\x1b[30m\x1b[43m';
export const BLACK_COLOR = '\x1b[30m';
export const WHITE_COLOR = '\x1b[37m';
export const BRIGHT_WHITE_COLOR = '\x1b[97m';
```
ANSI escape sequences that colorize terminal output:
- `\x1b[` — escape sequence prefix
- Number — the color code
- `m` — terminates the sequence
- `RESET_COLOR` — returns to default terminal color

These only work in terminals that support ANSI (all modern terminals do). In log files, they appear as raw escape characters unless stripped.

---

### Log File Streams

```typescript
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
```
Ensures the `logs/` directory exists at startup.

```typescript
export const logFileNoAnsi = fs.createWriteStream(path.join(logsDir, 'all-no-ansi.log'), { flags: 'a' });
export const logFileWithAnsi = fs.createWriteStream(path.join(logsDir, 'all-w-ansi.log'), { flags: 'a' });
```
Creates two persistent write streams:
- `all-no-ansi.log` — plain text, readable in any editor
- `all-w-ansi.log` — colored text, best viewed with `cat` in terminal

`{ flags: 'a' }` = append mode. New log entries are added to the end without overwriting.

---

### Environment Toggles

```typescript
export const isEnterEnabled = (NODE_ENV: string): boolean => {
  if (NODE_ENV !== 'production') return true;
  return false;
};
```
Controls which log levels appear in the terminal:

| Method | Development | Production |
|--------|-------------|------------|
| `enter` | ✅ Shown | ❌ Hidden |
| `leave` | ✅ Shown | ❌ Hidden |
| `infor` | ✅ Shown | ✅ Shown |
| `super` | ✅ Shown | ❌ Hidden |

Note: All methods always write to log files regardless of environment. The toggles only control terminal output.

`infor` is always enabled because it's used for important operational messages (server started, DB connected, etc.) that are useful even in production.
