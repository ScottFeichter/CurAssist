# dev-runner.js

This is the development orchestrator. It runs three things concurrently:
1. TypeScript compiler in watch mode (recompiles `.ts` → `.js` on change)
2. Nodemon watching `dist/` (restarts the server when compiled files change)
3. File watchers on static assets (copies public/views/templates to `dist/` on change)

All output is prefixed and line-numbered for easy debugging.

---

## Line-by-Line Breakdown

```javascript
#!/usr/bin/env node
```
Shebang line — tells the OS to run this file with Node.js if executed directly (e.g. `./dev-runner.js`).

```javascript
const { spawn, execSync } = require('child_process');
```
- `spawn` — starts a child process asynchronously (for long-running `tsc --watch` and `nodemon`)
- `execSync` — runs a command synchronously and blocks until done (for quick copy operations)

```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');
```
- `fs` — filesystem module for `fs.watch()` and `fs.existsSync()`
- `path` — path manipulation (`path.join()`)
- `readline` — creates line-by-line readers from process stdout/stderr streams

```javascript
let lineNumber = 0;
```
Global counter for all output lines across all processes. Makes it easy to reference specific output.

---

### formatLine

```javascript
function formatLine(prefix, line) {
  lineNumber++;
  const num = String(lineNumber).padStart(6, ' ');
  return `${num}  [${prefix}] ${line}`;
}
```
Formats every output line as: `   42  [tsc] File changed: src/server/server.ts`
- `lineNumber++` — increments the global counter
- `padStart(6, ' ')` — right-aligns the number in a 6-character field
- `[${prefix}]` — identifies which process produced the line (`tsc`, `app`, or `watch`)

---

### runProcess

```javascript
function runProcess(command, args, prefix, env = {}) {
  const proc = spawn(command, args, { shell: true, env: { ...process.env, ...env } });
```
Spawns a child process:
- `shell: true` — runs through the shell so `npx` and pipes work
- `{ ...process.env, ...env }` — inherits all current env vars, then overlays any extras (like `NODE_ENV: 'development'`)

```javascript
  const rlOut = readline.createInterface({ input: proc.stdout });
  const rlErr = readline.createInterface({ input: proc.stderr });
  rlOut.on('line', (line) => console.log(formatLine(prefix, line)));
  rlErr.on('line', (line) => console.error(formatLine(prefix, line)));
  return proc;
}
```
Creates readline interfaces on stdout and stderr — this splits the raw byte stream into individual lines. Each line gets formatted with the prefix and printed. Returns the process handle so it can be killed on exit.

---

### scheduleCopy (debounced asset rebuild)

```javascript
let rebuildTimer = null;
function scheduleCopy() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
```
Debounce pattern: if multiple file changes fire rapidly (e.g. saving multiple files), only run the rebuild once after 300ms of quiet.

```javascript
    console.log(formatLine('watch', 'ALERT : Change detected — rebuilding template and copying assets...'));
    try {
      const out1 = execSync('node content/Templates/build-template.js').toString().trim();
      if (out1) out1.split('\n').forEach(l => console.log(formatLine('watch', `ALERT : ${l}`)));
      execSync('cp -r src/public dist/ && cp -r src/views dist/');
      console.log(formatLine('watch', 'ALERT : Assets copied to dist/'));
    } catch (e) {
```
On change:
1. Rebuilds the combined HTML template from components
2. Copies `src/public` and `src/views` to `dist/` (these aren't TypeScript, so `tsc` doesn't handle them)
3. Logs success or error

```javascript
  }, 300);
}
```
300ms debounce window.

---

### File Watchers

```javascript
const watchDirs = [
  path.join(__dirname, 'src/public'),
  path.join(__dirname, 'src/views'),
  path.join(__dirname, 'content/Templates'),
  path.join(__dirname, 'content/collector'),
];
```
Directories to watch for changes. These contain non-TypeScript files that need to be copied to `dist/`.

```javascript
const watchFiles = [
  path.join(__dirname, 'false_commit.md'),
];
```
Individual files to watch. `false_commit.md` is a trick file — touching it triggers a rebuild without changing real code (useful for forcing a refresh).

```javascript
watchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, (event, filename) => {
      if (filename && !/orgServTemplate-combined/.test(filename)) scheduleCopy();
    });
```
Sets up recursive watchers on each directory. The regex filter ignores `orgServTemplate-combined.html` — that's the *output* of the template build, so watching it would create an infinite loop (change → rebuild → change → rebuild...).

---

### Main Processes

```javascript
const tsc = runProcess('npx', ['tsc', '--watch', '--preserveWatchOutput'], 'tsc');
```
Starts TypeScript compiler in watch mode. `--preserveWatchOutput` prevents clearing the terminal on each recompile.

```javascript
const app = runProcess('npx', ['nodemon', '--delay', '1', '-w', 'dist', 'dist/entry.js'], 'app', { NODE_ENV: 'development' });
```
Starts nodemon watching the `dist/` folder. When `tsc` writes new compiled files, nodemon detects the change and restarts the server. `--delay 1` waits 1 second after a change before restarting (gives `tsc` time to finish writing all files). `NODE_ENV: 'development'` is passed so the app loads `.env/.env.development`.

```javascript
process.on('SIGINT', () => {
  tsc.kill();
  app.kill();
  process.exit();
});
```
Graceful shutdown on Ctrl+C — kills both child processes before exiting.

---

## The Development Flow

```
You edit a .ts file
  → tsc --watch detects it, recompiles to dist/
  → nodemon detects dist/ change, restarts the server

You edit an HTML/CSS/JS file in src/public or content/Templates
  → fs.watch detects it, scheduleCopy() fires after 300ms
  → Template is rebuilt, assets copied to dist/
  → nodemon detects dist/ change, restarts the server
```
