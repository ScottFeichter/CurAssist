# nodemon.json

This configures Nodemon — a utility that watches files and automatically restarts the Node.js process when changes are detected. Used during development.

---

## Line-by-Line Breakdown

```json
"watch": ["dist"]
```
Which directories to monitor for changes. Nodemon only watches the compiled `dist/` folder — not `src/`. This is because `tsc --watch` handles the TypeScript compilation separately; nodemon's job is just to restart the server when new `.js` files appear in `dist/`.

```json
"ext": "js"
```
Which file extensions trigger a restart. Only `.js` files matter here since `dist/` contains compiled JavaScript.

```json
"ignore": ["dist/public/**"]
```
Paths to ignore even if they change. Static frontend assets (`dist/public/`) don't require a server restart — the browser just needs to refresh. Ignoring them prevents unnecessary restarts when CSS/images/frontend JS change.

```json
"exec": "node dist/entry.js"
```
The command nodemon runs (and re-runs on change). Starts the compiled server entry point.

---

## How It Fits In

This config is used by the `npm run serve` script:
```bash
nodemon --delay 1 dist/entry.js
```

In `dev-runner.js`, nodemon is spawned with explicit args that override some of these settings, but this file serves as the default config when running `npm run serve` standalone.
