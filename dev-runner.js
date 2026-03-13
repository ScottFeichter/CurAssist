#!/usr/bin/env node

/**
 * Development runner that concurrently runs:
 * 1. TypeScript compiler in watch mode (tsc --watch) - recompiles on .ts file changes
 * 2. Nodemon watching dist folder - restarts server when compiled files change
 * 3. File watcher on src/public and content/ (excluding content/Buckets) -
 *    runs build-template + copy to dist on changes
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

let lineNumber = 0;

function formatLine(prefix, line) {
  lineNumber++;
  const num = String(lineNumber).padStart(6, ' ');
  return `${num}  [${prefix}] ${line}`;
}

function runProcess(command, args, prefix) {
  const proc = spawn(command, args, { shell: true });
  const rlOut = readline.createInterface({ input: proc.stdout });
  const rlErr = readline.createInterface({ input: proc.stderr });
  rlOut.on('line', (line) => console.log(formatLine(prefix, line)));
  rlErr.on('line', (line) => console.error(formatLine(prefix, line)));
  return proc;
}

// Debounce to avoid multiple rapid rebuilds
let rebuildTimer = null;
function scheduleCopy() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    console.log(formatLine('watch', 'Change detected — rebuilding template and copying assets...'));
    try {
      execSync('node content/Templates/build-template.js', { stdio: 'inherit' });
      execSync('cp -r src/public dist/ && cp -r src/views dist/', { stdio: 'inherit' });
      console.log(formatLine('watch', 'Assets copied to dist/'));
    } catch (e) {
      console.error(formatLine('watch', 'Build error: ' + e.message));
    }
  }, 300);
}

// Watch src/public and content/ (excluding content/Buckets)
const watchDirs = [
  path.join(__dirname, 'src/public'),
  path.join(__dirname, 'src/views'),
  path.join(__dirname, 'content/Templates'),
  path.join(__dirname, 'content/collector'),
];

watchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, (event, filename) => {
      if (filename) scheduleCopy();
    });
    console.log(formatLine('watch', `Watching: ${dir}`));
  }
});

const tsc = runProcess('npx', ['tsc', '--watch', '--preserveWatchOutput'], 'tsc');
const app = runProcess('npx', ['nodemon', '--delay', '1', '-w', 'dist', 'dist/entry.js'], 'app');

process.on('SIGINT', () => {
  tsc.kill();
  app.kill();
  process.exit();
});
