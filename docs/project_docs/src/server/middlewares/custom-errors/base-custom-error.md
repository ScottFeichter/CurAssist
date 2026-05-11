# src/server/middlewares/custom-errors/base-custom-error.ts

The foundation class for all application errors. Every error thrown intentionally in the app is either an instance of this class or gets wrapped in one by the catch-all handler.

---

## Line-by-Line Breakdown

```typescript
export class BaseCustomError extends Error {
```
Extends the native `Error` class so it works with `instanceof`, has a `.stack` trace, and integrates with Express error handling.

```typescript
  title: string;
  status: number;
  errors?: Record<string, string>;
  timestamp: string;
  trace?: Array<{ function: string; location: string }>;
  cause?: unknown;
```
Additional properties beyond what `Error` provides:
- `title` — human-readable error category (e.g. "Resource Not Found")
- `status` — HTTP status code to send in the response
- `errors` — structured key/value details about what went wrong
- `timestamp` — ISO string of when the error occurred
- `trace` — parsed stack frames (function name + file location)
- `cause` — the original error that triggered this one (for wrapping)

```typescript
  constructor(message: string, options = {}) {
    super(message);
    Object.setPrototypeOf(this, BaseCustomError.prototype);
```
`Object.setPrototypeOf` is required because TypeScript/ES6 class inheritance with built-in types (like `Error`) breaks `instanceof` checks without it. This ensures `err instanceof BaseCustomError` works correctly.

```typescript
    this.name = this.constructor.name;
```
Sets the error name to the class name (e.g. "BaseCustomError"). Shows up in stack traces.

```typescript
  toJSON() { ... }
```
Serialization method — used when the error is logged or sent as a JSON response. Returns a clean object without the raw stack string.

---

## Usage

```typescript
throw new BaseCustomError("Not Found", {
  title: "Resource Not Found",
  status: 404,
  errors: { message: "Org not found", path: "/api/buckets/..." }
});
```
