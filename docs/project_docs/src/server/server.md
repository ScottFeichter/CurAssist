# src/server/server.ts

This module creates the Express application instance and defines the `start()` function that wires everything together and begins listening for requests.

---

## Line-by-Line Breakdown

### Imports

```typescript
import express, { Application } from 'express';
```
- `express` — the framework's factory function. Calling `express()` creates an app instance.
- `Application` — TypeScript type for the Express app (provides type info for `use()`, `listen()`, etc.)

```typescript
import { setupPreRouteMiddleware } from './middlewares/setup-pre-route-middleware';
import { setupRoutes } from './routes/setup-routes';
import { setupPostRouteMiddleware } from './middlewares/setup-post-route-middleware';
```
Three functions that attach middleware and routes in the correct order. Express processes middleware in the order it's registered — order matters.

```typescript
import { SERVER_PORT } from '../config/env-module';
```
The port to listen on (e.g. `5555`). Loaded from the `.env` file.

```typescript
import { connectToAtlas } from '../database/atlas';
```
The MongoDB connection function. Must succeed before the server starts accepting requests.

```typescript
import cors from 'cors';
```
CORS middleware — allows cross-origin requests. Imported here for the initial broad CORS setup (more specific CORS config is in pre-route middleware).

---

### SERVER Instance

```typescript
export const SERVER: Application = express();
```
Creates the Express app. This is the central object that:
- Holds all middleware and routes
- Processes incoming HTTP requests through the middleware chain
- Is passed to `http.createServer()` internally by `.listen()`

Exported so `entry.ts` can pass it to `start()`.

---

### start() Function

```typescript
export const start = async (SERVER: Application) => {
```
Async because it `await`s the database connection. Takes the Express app as a parameter (even though it's also in scope — makes the dependency explicit).

```typescript
  SERVER.use(cors());
  SERVER.use(express.json({ limit: '50mb' }));
```
Two middleware registered before everything else:
1. **`cors()`** — permissive CORS (allows all origins). This is a broad default; the pre-route middleware adds stricter CORS config that overrides this for specific routes.
2. **`express.json({ limit: '50mb' })`** — parses JSON request bodies. The `limit` option overrides the default 100KB cap to allow large spreadsheet uploads. After this middleware runs, `req.body` contains the parsed JSON object.

```typescript
  setupPreRouteMiddleware(SERVER);
  setupRoutes(SERVER);
  setupPostRouteMiddleware(SERVER);
```
Attaches middleware and routes in order:
1. **Pre-route** — view engine, timing, parsing, logging, security (CSRF, helmet, rate limit), authentication, static files
2. **Routes** — all API endpoints and page routes
3. **Post-route** — error handlers (must be after routes to catch errors thrown by route handlers)

```typescript
  await connectToAtlas();
```
Connects to MongoDB Atlas. If this fails, `connectToAtlas()` calls `process.exit(1)` — the server never starts. The `await` ensures the connection is established before we start accepting requests.

```typescript
  SERVER.listen(SERVER_PORT, () => {
    console.infor(`✅ Server is running at http://localhost:${SERVER_PORT}`);
  });
```
Binds the server to the port and starts accepting connections. The callback fires once the port is bound. `SERVER.listen()` internally creates an `http.Server` and calls its `.listen()` method.

```typescript
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
```
If anything in the startup sequence throws (middleware registration error, port already in use, etc.), log and exit.

---

## Request Flow

Once running, every incoming HTTP request flows through:

```
Request arrives at port 5555
  → cors()
  → express.json() (parses body)
  → Pre-route middleware (timing, cookies, compression, logging, security, auth, static)
  → Route handler (matched by method + path)
  → Post-route middleware (error handlers, 404 catch-all, error formatter)
  → Response sent to client
```

If no route matches, the catch-all in `setup-routes.ts` creates a 404 error and passes it to the error handlers.
