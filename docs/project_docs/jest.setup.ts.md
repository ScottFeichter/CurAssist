# jest.setup.ts

This file runs after the test environment is initialized but before any test files execute. It configures the test environment globally.

---

## Line-by-Line Breakdown

```typescript
process.env.NODE_ENV = 'test';
```
Explicitly sets `NODE_ENV` to `'test'`. This is belt-and-suspenders — the npm test scripts already set it via `NODE_ENV=test jest`, but this guarantees it's set even if Jest is invoked directly (e.g. from an IDE test runner). When `NODE_ENV=test`, the app's `env-module.ts` would try to load `.env/.env.test` (which doesn't exist in tests — the in-memory DB handles everything).

```typescript
global.console.log   = jest.fn();
global.console.info  = jest.fn();
global.console.warn  = jest.fn();
global.console.error = jest.fn();
global.console.debug = jest.fn();
```
Replaces all console methods with Jest mock functions (no-ops that record calls but produce no output). This:

1. **Silences output** — tests don't spam the terminal with server startup logs, Winston messages, or custom console output
2. **Enables assertion** — you could assert `expect(console.error).toHaveBeenCalledWith(...)` if needed
3. **Applies globally** — since the custom `extendedConsole` delegates to these native methods under the hood, silencing them silences everything

The `jest.fn()` creates a mock function that:
- Records every call (arguments, return value, `this` context)
- Returns `undefined` by default
- Can be inspected with `mockFn.mock.calls`, `mockFn.mock.results`
- Gets cleared between tests because `clearMocks: true` is set in `jest.config.json`

---

## Why This Exists

Without this file, running tests would produce hundreds of lines of server logs (Winston, Morgan, custom console enter/leave markers) mixed in with test results, making failures hard to find.
