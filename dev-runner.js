#!/usr/bin/env node

/**
 * Development runner that concurrently runs:
 * 1. TypeScript compiler in watch mode (tsc --watch) - recompiles on .ts file changes
 * 2. Nodemon watching dist folder - restarts server when compiled files change
 * 
 * Adds line numbers and prefixes ([tsc]/[app]) to output for easier debugging.
 * Handles Ctrl+C to cleanly kill both processes.
 */

const { spawn } = require('child_process');
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

const tsc = runProcess('npx', ['tsc', '--watch', '--preserveWatchOutput'], 'tsc');
const app = runProcess('npx', ['nodemon', '--delay', '1', '-w', 'dist', 'dist/entry.js'], 'app');

process.on('SIGINT', () => {
  tsc.kill();
  app.kill();
  process.exit();
});
