#!/usr/bin/env node

/**
 * Development runner that concurrently runs:
 * 1. TypeScript compiler in watch mode (tsc --watch) - recompiles on .ts file changes
 * 2. Nodemon watching dist folder - restarts server when compiled files change
 * 3. File watcher on src/public and content/ (excluding content/Buckets) -
 *    runs build-template + copy to dist on changes
 *
 * NOTE: On file changes, only build-test-template.js is called directly.
 * It internally calls build-template.js first, so both templates are rebuilt
 * in a single pass. Calling build-template.js separately would build it twice.
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

function runProcess(command, args, prefix, env = {}) {
  const proc = spawn(command, args, { shell: true, env: { ...process.env, ...env } });
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
    console.log(formatLine('watch', 'ALERT : Change detected — rebuilding template and copying assets...'));
    try {
      const out1 = execSync('node content/Templates/build-test-template.js').toString().trim();
      if (out1) out1.split('\n').forEach(l => console.log(formatLine('watch', `ALERT : ${l}`)));
      execSync('cp -r src/public dist/ && cp -r src/views dist/');
      console.log(formatLine('watch', 'ALERT : Assets copied to dist/'));
    } catch (e) {
      const msg = (e.stdout ? e.stdout.toString().trim() + '\n' : '') + e.message;
      msg.split('\n').forEach(l => console.error(formatLine('watch', `ALERT : ${l}`)));
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

const watchFiles = [
  path.join(__dirname, 'false_commit.md'),
];

watchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, (event, filename) => {
      if (filename && !/orgServTemplate-combined/.test(filename)) scheduleCopy();
    });
    console.log(formatLine('watch', `INFO : Watching -> ${dir.replace(/.*CurAssist\//, '')}`));
  }
});

watchFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.watch(file, () => scheduleCopy());
    console.log(formatLine('watch', `INFO : Watching -> ${file.replace(/.*CurAssist\//, '')}`))
  }
});

const tsc = runProcess('npx', ['tsc', '--watch', '--preserveWatchOutput'], 'tsc');
const app = runProcess('npx', ['nodemon', '--delay', '1', '-w', 'dist', 'dist/entry.js'], 'app', { NODE_ENV: 'development' });

process.on('SIGINT', () => {
  tsc.kill();
  app.kill();
  process.exit();
});
