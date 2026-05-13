# misc/flow.md

This file documents the startup execution order of the application. It explains how Node.js resolves imports (depth-first, top-to-bottom) before executing the importing file's own code.

---

## Key Concept

When `entry.ts` runs, Node doesn't execute `entry.ts` line by line from the top. It first resolves all `import` statements recursively — each imported file's imports are resolved before that file's code runs. Only after all imports are resolved does `entry.ts`'s own code execute.

---

## Current Accuracy

The flow described is largely correct for the startup sequence. The actual current import chain from `entry.ts` is:

```
entry.ts imports:
  1. customConsoles.ts (-> customConsoleMethods.ts -> customConsoleSetup.ts)
  2. env-module.ts (-> dotenv, path)
  3. logger.ts (-> logger-config/*, logger-transports/*)
  4. logger-wrapper.ts (-> logger.ts*)
  5. logger-directories.ts (-> logger-paths.ts, logger-clearpath.ts)
  6. logger-trials.ts (-> logger.ts*, logger-wrapper.ts*)
  7. server.ts (-> express, middlewares, routes, atlas.ts, env-module*)
```

`*` = already loaded (Node caches modules — only executed once)

The file's description of "looks up before looking down" and the `*indicates not called again` convention are accurate representations of Node's module caching behavior.

---

## What's Changed Since This Was Written

- References to `setupMiddleware.ts` — now split into `setup-pre-route-middleware.ts` and `setup-post-route-middleware.ts`
- The server import chain now includes `atlas.ts` (MongoDB connection)
- `logger-morganMiddleware.ts` is imported via `setup-pre-route-middleware.ts`, not directly from `server.ts`
- The "EXITO" region label is informal shorthand for "exit/done"
