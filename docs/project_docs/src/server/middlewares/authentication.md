# src/server/middlewares/authentication/

This directory contains the authentication and authorization middleware. Currently scaffolded but not fully enforced — the app operates without user login.

---

## Structure

```
authentication/
  authentication-middleware.ts    — Main auth middleware (placeholder)
  pre-authentication/
    login-pre-authentication-middleware.ts   — Validates login request format
    signup-pre-authentication-middleware.ts  — Validates signup request format
  post-authentication/
    jwt.service.ts                          — JWT token creation and verification
    login-post-authentication-middleware.ts — Sets session, issues token after login
    session-middleware.ts                   — Session management helpers
```

---

## Key Files

### jwt.service.ts
Creates and verifies JSON Web Tokens:
- `generateToken(payload)` — signs a JWT with the access token secret
- `verifyToken(token)` — verifies and decodes a JWT
- Token expiry, secret from environment variables

### login-post-authentication-middleware.ts
Exports three middleware used in `setup-pre-route-middleware.ts`:
- `restoreAuthentication` — reads JWT from cookie, attaches user to `req.user`
- `refreshAuthenticationToken` — issues a new token if current one is near expiry
- `checkSessionExpiry` — rejects requests with expired sessions

These currently pass through without blocking (auth not enforced) but the infrastructure is ready for when user accounts are added.

---

## authorization/
Contains `authorization-middleware.ts` — role-based access control (placeholder, returns `next()` for all requests).
