# src/server/middlewares/custom-errors/__error-index.ts

Barrel file that imports and re-exports all error handlers from a single location. This allows `setup-post-route-middleware.ts` to import everything with one line:

```typescript
import { BaseCustomError, _errorFormatter, error404_NotFound, ... } from './custom-errors/__error-index';
```

Also exports a default object containing all handlers for convenience.
