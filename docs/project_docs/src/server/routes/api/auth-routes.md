# src/server/routes/api/demousers/, login/, signup/

These directories contain scaffolded route handlers for user authentication features that are not currently active.

---

## demousers/
- `demoUsers-routes.ts` — CRUD routes for demo user accounts
- `demoUser-fetches.ts` — Database queries for demo users

## login/
- `login-routes.ts` — POST /api/login route handler
- `login-fetches.ts` — Database queries for login validation
- `logout-routes.ts` — POST /api/logout route handler

## signup/
- `signup-routes.ts` — POST /api/signup route handler

---

All of these are commented out in `api-router.ts`:
```typescript
// apiRouter.use('/signup', signupRouter);
// apiRouter.use('/login', loginRouter);
// apiRouter.use('/logout', logoutRouter);
// apiRouter.use('/demousers', demoUsersRouter);
```

They exist as infrastructure for when user authentication is added to the application. Currently the app operates without login — all users have full access.
