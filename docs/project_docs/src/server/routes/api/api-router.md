# src/server/routes/api/api-router.ts

This is the top-level API router. It mounts sub-routers for each API domain under `/api`.

---

## Line-by-Line Breakdown

```typescript
const apiRouter = express.Router();
```
Creates an Express Router instance. A Router is a mini-app that can have its own middleware and routes, then be mounted on the main app at a specific path.

```typescript
apiRouter.use('/buckets', bucketsRouter);
```
All bucket-related routes are handled by `bucketsRouter`. Since `apiRouter` is mounted at `/api` in `setup-routes.ts`, the full path becomes `/api/buckets/*`.

```typescript
apiRouter.use('/sf', sfProxyRouter);
```
All SF Service Guide proxy routes. Full path: `/api/sf/*`.

```typescript
// apiRouter.use('/signup', signupRouter);
// apiRouter.use('/login', loginRouter);
// apiRouter.use('/logout', logoutRouter);
// apiRouter.use('/demousers', demoUsersRouter);
```
Commented-out routes for authentication features. These are scaffolded but not active — the app currently has no user authentication.

```typescript
export default apiRouter;
```
Exported as default so `setup-routes.ts` can import and mount it.

---

## Route Resolution

When a request comes in for `POST /api/buckets/save`:
1. `setup-routes.ts` matches `/api` → delegates to `apiRouter`
2. `apiRouter` matches `/buckets` → delegates to `bucketsRouter`
3. `bucketsRouter` matches `POST /save` → runs the handler
