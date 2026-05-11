# typedoc.json

This configures TypeDoc — a documentation generator that reads TypeScript source and JSDoc comments to produce HTML API docs.

---

## Line-by-Line Breakdown

```json
"entryPoints": ["src"]
```
The root directory to scan for TypeScript files. TypeDoc will look for all `.ts` files under `src/`.

```json
"entryPointStrategy": "expand"
```
Tells TypeDoc to recursively expand the `src` directory and treat every `.ts` file inside as an entry point. Alternative strategies include `"resolve"` (follow imports from a single entry) or `"packages"` (for monorepos).

```json
"out": "docs/typedocs"
```
Output directory for the generated HTML documentation. This folder is gitignored.

```json
"name": "CurAssist"
```
The project name displayed in the generated docs header.

```json
"excludePrivate": true
```
Omits members marked with the `private` keyword from the docs. Only public/exported APIs are documented.

```json
"excludeProtected": true
```
Omits `protected` members as well. The docs focus on the public interface.

```json
"exclude": ["**/*.d.ts", "**/node_modules/**", "**/dist/**"]
```
Glob patterns to skip:
- `*.d.ts` — type definition files (no implementation to document)
- `node_modules` — third-party code
- `dist` — compiled output (would duplicate the source docs)

```json
"theme": "default"
```
Uses TypeDoc's built-in default theme. Other themes can be installed as plugins.

```json
"readme": "README.md"
```
Includes the project README as the landing page of the generated docs.
