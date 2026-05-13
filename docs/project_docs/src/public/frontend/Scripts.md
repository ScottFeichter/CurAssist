# src/public/frontend/Scripts/

The frontend JavaScript is organized into folders by responsibility. All functions are global (no module system) — loaded via `<script>` tags in `index.html` in dependency order.

---

## Directory Structure

```
Scripts/
  core/           — Global state, CSRF, notifications, dirty flag
  data/           — Lookup tables (category/eligibility IDs)
  submit/         — Collector, transform, and SFSG submission logic
  operations/     — File-level CRUD (save, move, copy, delete, create)
  buckets/        — Bucket-level operations (create, delete, import bucket)
  import/         — Single file import from SFSG
  navigation/     — Bucket/subdir/file navigation + init
  ui/             — Sidebar toggle and resize
```

---

## Load Order (index.html)

Order matters because later scripts reference functions/variables from earlier ones:

1. **core/state.js** — defines all global variables (`currentBucket`, `API_BASE`, etc.)
2. **core/csrf.js** — CSRF token functions (uses `API_BASE`, `csrfToken`)
3. **core/notifications.js** — notify modal (standalone)
4. **core/dirty-flag.js** — dirty flag logic (uses `isDirty`, `_iframeObserver`, calls `saveFile`)
5. **data/lookup-tables.js** — category/eligibility lookup maps (standalone)
6. **submit/collector.js** — DOM data extraction (standalone)
7. **submit/transform.js** — payload transformation (uses `lookup-tables`, defines `SF_API`)
8. **submit/submitNewOrg.js** — SFSG org creation (uses `SF_API`, `transformNewOrg`)
9. **submit/submitService.js** — SFSG service creation (uses `SF_API`, `transformServiceOnly`)
10. **submit/submitUpdateOrg.js** — SFSG change request (uses `SF_API`, `transformNewOrg`)
11. **submit/submit-flow.js** — orchestrates submit (uses `saveFile`, `collectFormData`, `submitNewOrg`, etc.)
12. **operations/save.js** — save logic (uses `collectFormData`, `getCsrfToken`, `clearDirty`)
13. **operations/move.js** — move logic (uses `saveFile`, `getCsrfToken`, `notify`, `loadSubdir`)
14. **operations/copy.js** — copy logic (uses `saveFile`, `getCsrfToken`, `notify`)
15. **operations/delete-file.js** — delete logic (uses `getCsrfToken`, `notify`, `loadSubdir`)
16. **operations/create-file.js** — create file logic (uses `getCsrfToken`, `notify`, `loadSubdir`)
17. **buckets/create-bucket.js** — bucket creation + spreadsheet upload (uses many functions)
18. **buckets/delete-bucket.js** — bucket deletion (uses `getCsrfToken`, `notify`, `init`)
19. **buckets/import-bucket.js** — bulk import by ID range (uses `getCsrfToken`, `notify`)
20. **import/import-file.js** — single file import (uses `getCsrfToken`, `loadSubdir`)
21. **navigation/navigation.js** — navigation functions (uses `fetchCsrfToken`, `guardUnsaved`, `clearDirty`, `observeIframe`)
22. **ui/sidebar.js** — sidebar resize (standalone DOM manipulation)
23. **app.js** — entry point, calls `init()`

---

## Key Design Decisions

- **No module bundler** — plain `<script>` tags, all functions global. Simple, no build step for frontend.
- **Navigation loads last** — because it depends on everything above (dirty flag, save, etc.).
- **app.js loads very last** — it's the entry point that calls `init()`. Separates bootstrapping from navigation logic.
- **Sidebar loads late** — it queries DOM elements that must exist, and has no dependencies on other scripts.
