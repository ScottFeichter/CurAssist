# Dirty Flag — Unsaved Changes Detection

## Phase 2: Simple One-Way Dirty Flag (Current)

- `isDirty` flag set to `true` on any DOM change in the iframe (input, mutation)
- Never un-dirties — only resets on successful save or fresh file load
- `beforeunload` event for browser tab close / navigation away (free browser dialog)
- Custom modal for in-app navigation (bucket/subdir/file switch, prev/next): "Save and continue / Discard and continue / Cancel"
- Simple, reliable, no false negatives (never silently loses changes)
- Worst case: warns when nothing meaningful changed — user clicks Discard

## Phase 3: Snapshot Diffing (Future, If Needed)

Accurate "actually changed?" detection without a framework rewrite:

- On file load, snapshot form state using `collectFormData()` into a plain object
- On dirty check, call `collectFormData()` again and deep-compare against the snapshot
- If identical, not dirty — allows un-dirtying when user reverses changes
- `collectFormData()` already exists and does most of the heavy lifting
- Gap is just: snapshot on load + deep compare on navigation

## React + Redux Rewrite — Considered and Rejected

**Pros:**
- State management is first-class in React — diffing, snapshots, controlled inputs
- Redux/Zustand/Jotai would make dirty tracking trivial
- Component-level re-rendering, undo/redo almost for free
- Better long-term maintainability as features grow

**Cons (decisive for this project):**
- Template HTML is inherited from SF Service Guide — massive complex DOM with minified CSS class names, deeply nested structures, inline scripts
- Iframe architecture exists because the template must render as-is (mirrors SFSG output). React wants to own the DOM, which conflicts with hydrating a pre-built HTML template
- Would require rebuilding the entire frontend from scratch — template, form, modals, autocomplete, pill selectors, everything
- For a curation tool used by a small team, ROI on that rewrite is not justified
- Redux specifically is overkill — even in React-land most people use lighter alternatives now

**Recommendation:** Stay with current architecture. If Phase 3 is ever needed, vanilla JS snapshot diffing via `collectFormData()` is the right approach — 80% of the infrastructure already exists.
