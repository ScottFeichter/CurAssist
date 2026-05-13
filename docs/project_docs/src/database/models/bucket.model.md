# src/database/models/bucket.model.ts

This defines the Mongoose schema and model for bucket documents. A bucket is a named container that groups org records into a curation batch (e.g. "DCYF 10.01.25").

---

## Line-by-Line Breakdown

### Imports

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';
```
Same Mongoose imports as `org.model.ts` — Schema for structure, Document for the TypeScript interface, Model for the query API.

---

### Interface

```typescript
export interface IBucket extends Document {
  name:      string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```
- `name` — unique bucket identifier (e.g. "DCYF 10.01.25")
- `createdBy` — who created it (placeholder `'unknown'` until auth is added)
- `createdAt` / `updatedAt` — managed automatically by `timestamps: true`

`extends Document` adds Mongoose methods (`save()`, `remove()`, `_id`, etc.).

---

### Schema

```typescript
const BucketSchema = new Schema<IBucket>({
  name:      { type: String, required: true, unique: true },
  createdBy: { type: String, default: 'unknown' },
}, { timestamps: true });
```

- `required: true` — a bucket must have a name. `Bucket.create({})` would throw a validation error.
- `unique: true` — creates a MongoDB unique index on the `name` field. Attempting to create two buckets with the same name throws a duplicate key error (E11000). This is enforced at the database level, not just in application code.
- `default: 'unknown'` — if `createdBy` isn't provided, defaults to this string.
- `{ timestamps: true }` — auto-manages `createdAt` (set once on insert) and `updatedAt` (refreshed on every save).

---

### Model

```typescript
export const Bucket: Model<IBucket> = mongoose.model<IBucket>('Bucket', BucketSchema);
```
- Model name `'Bucket'` → collection name `buckets` (Mongoose lowercases + pluralizes)
- Typed as `Model<IBucket>` so queries return properly typed results

---

## Relationship to Orgs

Buckets and orgs are related by name (not by ObjectId reference):
- `Org.bucket` stores the bucket name as a string (e.g. "DCYF 10.01.25")
- `Bucket.name` is the same string

This is a denormalized relationship — simpler queries (`Org.find({ bucket: 'DCYF 10.01.25' })`) at the cost of needing to update all orgs if a bucket is renamed. Since buckets are never renamed in practice, this trade-off works well.

Deleting a bucket (`DELETE /api/buckets/:bucket`) also deletes all orgs with that bucket name.
