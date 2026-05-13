# src/server/routes/api.ts

**This is a legacy/historical file.** It contains the original file-based bucket routes from before the MongoDB migration. The active routes are in `src/server/routes/api/buckets/buckets-routes.ts`.

---

## What It Did

This was the original API router that used the filesystem (`content/Buckets/`) to store org data as HTML files:
- Listed buckets by reading directories
- Listed files by reading `.html` files in subdirectories
- Served file content by reading HTML from disk
- Saved by writing HTML to disk
- Moved by renaming files between directories

---

## Why It Still Exists

It's not imported or used anywhere in the active codebase. It likely remains as a reference for the original architecture before the MongoDB migration (documented in `docs/db2bOrNot2b.md`).

---

## Key Difference from Current Routes

| Aspect | This file (legacy) | Current (`buckets-routes.ts`) |
|--------|-------------------|-------------------------------|
| Storage | Filesystem (HTML files) | MongoDB Atlas |
| File list | `fs.readdir()` | `Org.find()` |
| Read org | `fs.readFile()` | `Org.findById()` + `hydrateTemplate()` |
| Save | `fs.writeFile()` (full HTML) | `Org.save()` (structured data) |
| Move | `fs.rename()` | Update `org.status` field |
