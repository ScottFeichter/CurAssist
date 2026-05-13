# src/types/ts-definitions.d.ts

This is a TypeScript declaration file that defines global types, interfaces, and module augmentations used throughout the application. It's not executed at runtime — it only provides type information to the TypeScript compiler.

---

## What is a .d.ts File?

A `.d.ts` (declaration) file tells TypeScript about types that exist but aren't defined in your own `.ts` files. It's used to:
- Augment existing types (add properties to Express's `Request`)
- Define global types available everywhere without importing
- Declare the shape of environment variables

---

## Sections

### ProcessEnv Augmentation

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVER_PORT: string;
      NODE_ENV: string;
      DB_CONNECT: string;
      ...
    }
  }
}
```
Tells TypeScript that `process.env.SERVER_PORT` exists and is a `string`. Without this, `process.env.SERVER_PORT` would be typed as `string | undefined`, requiring null checks everywhere.

### Error Formatting Interfaces

```typescript
export interface StackFrame { function: string; location: string; }
export interface ResponseDetails { name: string; title: string; status: number; ... }
export interface RequestDetails { method: string; url: string; ... }
export interface TransactionReport { REQUEST: RequestDetails; RESPONSE: ResponseDetails; }
```
Types used by the error formatter to structure error responses consistently.

### Custom Error Classes

```typescript
export class NotFoundError extends Error { statusCode = 404; ... }
export class BadRequestError extends Error { statusCode = 400; ... }
```
Error classes with built-in status codes. Used to throw typed errors that the error handlers can identify.

### Express Request Augmentation

```typescript
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; username: string; email: string; };
    context?: JwtPayload;
  }
}
```
Adds `req.user` and `req.context` to Express's Request type. After authentication middleware runs, `req.user` contains the authenticated user's info.

```typescript
declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}
```
Declares that `req.csrfToken()` exists (added by the `csurf` middleware at runtime).

### Session Types

```typescript
interface SessionData {
  userId: string;
  sessionID: string;
  token: string;
  expires: string;
  lastActivity?: number;
}
```
Shape of session data stored server-side. Used by authentication middleware.

### Sequelize Types (Historical)

```typescript
export interface UserAttributes { id: number; username: string; ... }
export class User extends Model<UserAttributes> { ... }
```
Types for the Sequelize User model. Historical — from before the MongoDB migration. Kept for reference.

---

## Note on `declare global`

`declare global` extends types that are available everywhere without importing. Regular `export` makes types available only when explicitly imported. The choice depends on how widely the type is used.
