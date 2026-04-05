#!/usr/bin/env node

/**
 * TypeDoc wrapper — runs TypeDoc and reformats its output
 * to match the CurAssist console style with [typedoc] prefix
 * and line breaks between warnings for readability.
 */

const { execSync } = require('child_process');

const RESET  = '\x1b[0m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';

function formatLine(line) {
  if (!line.trim()) return null;

  if (line.includes('[warning]')) {
    const msg = line.replace(/\[warning\]\s*/, '');
    return `${YELLOW}[typedoc]  WARNI :${RESET}  ${DIM}${msg}${RESET}`;
  }
  if (line.includes('[error]')) {
    const msg = line.replace(/\[error\]\s*/, '');
    return `${RED}[typedoc]  ERROR :${RESET}  ${msg}`;
  }
  if (line.includes('[info]')) {
    const msg = line.replace(/\[info\]\s*/, '');
    return `${CYAN}[typedoc]  INFOR :${RESET}  ${msg}`;
  }
  return `${DIM}[typedoc]${RESET}  ${line}`;
}

try {
  const output = execSync('npx typedoc', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  const lines = output.split('\n');
  let prevWasWarning = false;

  lines.forEach(line => {
    const formatted = formatLine(line);
    if (!formatted) return;

    const isWarning = line.includes('[warning]');
    if (isWarning && !prevWasWarning) process.stdout.write('\n');
    console.log(formatted);
    if (isWarning) process.stdout.write('\n');

    prevWasWarning = isWarning;
  });

} catch (e) {
  const output = (e.stdout || '') + (e.stderr || '');
  output.split('\n').forEach(line => {
    const formatted = formatLine(line);
    if (formatted) console.error(formatted);
  });
  process.exit(1);
}
