# src/public/frontend/index.html

This is the main HTML page served to the browser. It defines the application layout including:

- Left sidebar (bucket/subdir/file navigation dropdowns, prev/next buttons)
- Center content area (iframe that displays the hydrated org template)
- Right sidebar (action buttons: Save, Move, Submit, Copy, Delete, etc.)
- Modals (move, copy, delete, submit, create bucket, import, notifications)

The page loads `app.js` and the Scripts/ files which handle all interactivity. The iframe (`#formFrame`) is where the org template is rendered via `srcdoc`.

---

## Key Elements

| ID | Purpose |
|----|---------|
| `bucketSelect` | Bucket dropdown |
| `subdirSelect` | Subdirectory dropdown |
| `fileInfo` | File selection dropdown |
| `formFrame` | Iframe displaying the org template |
| `fileCount` | "File X of Y" indicator |
| Various modals | Confirmation dialogs for destructive/important actions |
