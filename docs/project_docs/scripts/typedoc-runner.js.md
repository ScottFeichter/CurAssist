# scripts/typedoc-runner.js

This script runs TypeDoc programmatically (instead of via CLI) to generate API documentation with formatted console output.

---

## What It Does

1. Imports TypeDoc's `Application` class
2. Reads config from `typedoc.json`
3. Runs the documentation generation
4. Prints formatted success/failure messages with timing info

---

## Why Not Just `npx typedoc`?

Running TypeDoc via this wrapper script allows:
- Custom formatted output (colored, timestamped)
- Error handling with meaningful messages
- Integration into the build pipeline (`npm run build` calls this)
- Consistent output format matching the project's logging style
