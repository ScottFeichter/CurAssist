# tsconfig.json

This is the TypeScript compiler configuration. It tells `tsc` how to compile `.ts` files into `.js`.

---

## Line-by-Line Breakdown

```json
"compilerOptions": {
```
All settings that control how TypeScript compiles code.

---

```json
"target": "ES2022"
```
The JavaScript version to compile down to. ES2022 includes top-level `await`, `Array.at()`, `Object.hasOwn()`, etc. Since we run on Node 20, ES2022 is fully supported — no need to polyfill.

```json
"module": "commonjs"
```
The module system for the output. `commonjs` means compiled files use `require()` and `module.exports` — the Node.js standard. This is why we write `import/export` in TypeScript but the compiled output uses `require`.

```json
"lib": ["ES2022"]
```
Which built-in type definitions to include. Tells TypeScript what global APIs exist (e.g. `Promise`, `Array.at()`). Matches the `target` so type-checking aligns with what's available at runtime.

```json
"moduleResolution": "node"
```
How TypeScript resolves `import` paths. `"node"` means it follows Node.js resolution rules: checks `node_modules`, looks for `index.ts`, respects `package.json` `main` field, etc.

```json
"rootDir": "./src"
```
The root of the source tree. TypeScript uses this to mirror the directory structure in the output. Files in `src/server/server.ts` compile to `dist/server/server.js`.

```json
"outDir": "./dist"
```
Where compiled `.js` files go. The entire `src/` structure is replicated here.

```json
"esModuleInterop": true
```
Enables compatibility between CommonJS and ES module imports. Without this, you'd need to write `import * as express from 'express'` instead of `import express from 'express'`. It adds helper code to handle default exports from CJS modules.

```json
"forceConsistentCasingInFileNames": true
```
Prevents importing the same file with different casing (e.g. `./Server` vs `./server`). Important on macOS where the filesystem is case-insensitive but Linux (EC2) is case-sensitive — catches bugs before deployment.

```json
"strict": true
```
Enables all strict type-checking options at once:
- `strictNullChecks` — `null`/`undefined` aren't assignable to other types
- `strictFunctionTypes` — function parameter types are checked contravariantly
- `strictBindCallApply` — `bind`, `call`, `apply` are type-checked
- `noImplicitAny` — must explicitly type things that can't be inferred
- `noImplicitThis` — `this` must have a known type
- `strictPropertyInitialization` — class properties must be initialized

```json
"skipLibCheck": true
```
Skips type-checking `.d.ts` files in `node_modules`. Speeds up compilation significantly. Safe because library types are maintained by their authors.

```json
"resolveJsonModule": true
```
Allows importing `.json` files directly (e.g. `import pkg from './package.json'`). TypeScript will infer the JSON structure as a type.

```json
"allowSyntheticDefaultImports": true
```
Allows `import x from 'module'` even when the module doesn't have a default export. Works with `esModuleInterop` to make CJS modules feel like ES modules.

---

```json
"include": ["src/**/*.ts"]
```
Which files to compile. The glob `src/**/*.ts` means all `.ts` files anywhere under `src/`, recursively.

```json
"exclude": ["node_modules", "dist"]
```
Directories to skip. `node_modules` contains third-party code (already compiled). `dist` is our own output — don't recompile it.
