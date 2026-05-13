# src/database/atlas.ts

This module handles connecting to and disconnecting from MongoDB Atlas using Mongoose. The server will not start if the connection fails.

---

## Line-by-Line Breakdown

### Imports

```typescript
import mongoose from 'mongoose';
```
Mongoose is the MongoDB ODM (Object Document Mapper). It provides schema validation, query building, and connection management on top of the raw MongoDB driver.

```typescript
import { DB_CONNECT } from '../config/env-module';
```
The MongoDB connection string from the environment. Looks like:
```
mongodb+srv://user:password@cluster.mongodb.net/curassist?retryWrites=true&w=majority
```

---

### connectToAtlas

```typescript
export const connectToAtlas = async (): Promise<void> => {
```
Async function that returns a Promise resolving to `void`. Exported so `server.ts` can call it during startup.

```typescript
  if (!DB_CONNECT) {
    throw new Error('DB_CONNECT environment variable is not set');
  }
```
Guard clause — shouldn't happen since `env-module.ts` validates this, but provides a clear error if somehow called without it.

```typescript
  await mongoose.connect(DB_CONNECT);
```
The actual connection call. `mongoose.connect()`:
1. Parses the connection string (extracts host, credentials, database name, options)
2. Establishes a TCP connection to the Atlas cluster
3. Authenticates with the provided credentials
4. Selects the database (e.g. `curassist` or `curassist-dev`)
5. Creates a connection pool (default 5 connections) for concurrent queries

The `await` blocks until the connection is established or fails. If Atlas is unreachable (wrong IP whitelist, cluster paused, bad credentials), this throws.

```typescript
  console.infor(`✅ Connected to MongoDB Atlas — db: ${mongoose.connection.name}`);
```
Logs the database name on success. `mongoose.connection.name` returns the database name from the connection string (e.g. `curassist`).

```typescript
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    process.exit(1);
  }
```
On failure, logs the error and kills the process. `process.exit(1)` ensures the server doesn't start in a broken state with no database. PM2 will then attempt to restart it.

---

### disconnectFromAtlas

```typescript
export const disconnectFromAtlas = async (): Promise<void> => {
  await mongoose.disconnect();
};
```
Closes all connections in the pool. Available for:
- Graceful shutdown (SIGTERM handling)
- Test cleanup (though tests use `mongodb-memory-server` instead)

`mongoose.disconnect()` waits for in-flight operations to complete before closing.

---

## Connection Lifecycle

```
App starts → connectToAtlas() → mongoose.connect() → connection pool ready
                                                    → all Mongoose queries use this pool
App stops  → disconnectFromAtlas() → mongoose.disconnect() → pool closed
```

Mongoose maintains a single global connection by default. Once `mongoose.connect()` succeeds, any `Model.find()`, `Model.create()`, etc. anywhere in the app automatically uses that connection — no need to pass it around.
